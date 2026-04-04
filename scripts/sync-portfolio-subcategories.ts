/**
 * Fill Dato `portfolio_subcategory` localized `name` and `slug` from PORTFOLIO-list.csv
 * plus optional `data/portfolio-subcategory-locales.json` overrides.
 *
 * Keys in the JSON file are matched with `normalizeTaxonomyLabel` (same as import scripts).
 *
 * Usage:
 *   pnpm sync:subcategories -- path/to/PORTFOLIO-list.csv
 *   pnpm sync:subcategories -- path/to/PORTFOLIO-list.csv --dry-run
 *
 * Requires DATOCMS_MANAGEMENT_API_TOKEN (or DATOCMS_API_TOKEN with CMA access).
 */

import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'csv-parse/sync'
import { buildClient } from '@datocms/cma-client-node'
import {
  buildTaxonomyMaps,
  fetchAllItemsOfType,
  loadTaxonomyAliasesFromDisk,
  normalizeTaxonomyLabel,
  resolveTaxonomyId,
  taxonomyItemDisplayName,
} from './import-taxonomy-lookup'

const CSV_COLUMNS = [
  'link',
  'title_cs',
  'title_en',
  'desc_cs',
  'desc_en',
  'slug_cs',
  'slug_en',
  'rok',
  'kategorie1',
  'kategorie2',
  'priorita',
  'client',
  'země',
  'stitky_cz',
  'stitky_en',
] as const

type CsvRow = Record<(typeof CSV_COLUMNS)[number], string>

type LocaleOverride = { cs?: string; en?: string }

function parseArgs(argv: string[]) {
  const args = argv.slice(2).filter((a) => a !== '--')
  const dryRun = args.includes('--dry-run')
  const paths = args.filter((a) => a !== '--dry-run')
  return { csvPath: paths[0], dryRun }
}

function slugifyAscii(input: string): string {
  const s = input
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return s || 'x'
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function itemId(item: Record<string, unknown>): string {
  const top = item.id
  if (typeof top === 'string' && top) {
    return top
  }
  return ''
}

function loadLocaleOverrides(): Record<string, LocaleOverride> {
  const p = path.join(
    process.cwd(),
    'data/portfolio-subcategory-locales.json'
  )
  if (!fs.existsSync(p)) {
    return {}
  }
  try {
    const raw = JSON.parse(fs.readFileSync(p, 'utf8')) as Record<
      string,
      unknown
    >
    const out: Record<string, LocaleOverride> = {}
    for (const [k, v] of Object.entries(raw)) {
      const nk = normalizeTaxonomyLabel(k)
      if (!nk) continue
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        const o = v as Record<string, unknown>
        out[nk] = {
          cs: typeof o.cs === 'string' ? o.cs : undefined,
          en: typeof o.en === 'string' ? o.en : undefined,
        }
      }
    }
    return out
  } catch {
    return {}
  }
}

async function main() {
  const { csvPath, dryRun } = parseArgs(process.argv)
  if (!csvPath) {
    console.error(
      'Usage: pnpm sync:subcategories -- <path-to.csv> [--dry-run]'
    )
    process.exit(1)
  }

  const resolved = path.resolve(csvPath)
  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`)
    process.exit(1)
  }

  const token =
    process.env.DATOCMS_MANAGEMENT_API_TOKEN?.trim() ||
    process.env.DATOCMS_API_TOKEN?.trim()
  if (!token) {
    console.error(
      'Set DATOCMS_MANAGEMENT_API_TOKEN (or DATOCMS_API_TOKEN) in .env'
    )
    process.exit(1)
  }

  const raw = fs.readFileSync(resolved, 'utf8')
  const rows = parse(raw, {
    columns: [...CSV_COLUMNS],
    from_line: 2,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
    skip_empty_lines: true,
  }) as CsvRow[]

  const localeOverrides = loadLocaleOverrides()
  const aliases = loadTaxonomyAliasesFromDisk()

  /** First CSV label seen per resolved subcategory id (for default EN/CS base string). */
  const idToCsvLabel = new Map<string, string>()

  const client = buildClient({ apiToken: token })
  const maps = await buildTaxonomyMaps(client)

  for (const row of rows) {
    const k2 = row.kategorie2?.trim()
    if (!k2) continue
    const id = resolveTaxonomyId(maps, 'portfolio_subcategory', k2, aliases)
    if (!id) {
      console.warn(
        `No portfolio_subcategory match for CSV kategorie2="${k2}" (add Dato record or alias)`
      )
      continue
    }
    if (!idToCsvLabel.has(id)) {
      idToCsvLabel.set(id, k2)
    }
  }

  const subItems = (await fetchAllItemsOfType(
    client,
    'portfolio_subcategory'
  )) as Record<string, unknown>[]

  let updated = 0

  for (const item of subItems) {
    const id = itemId(item)
    if (!id) continue

    const csvLabel = idToCsvLabel.get(id)
    const fallbackName = taxonomyItemDisplayName(item)
    const base = (csvLabel ?? fallbackName).trim()
    if (!base) {
      console.warn(`Skipping subcategory ${id}: no CSV label and no Dato name`)
      continue
    }

    const nk = normalizeTaxonomyLabel(base)
    const override = localeOverrides[nk] ?? {}
    const cs = (override.cs ?? base).trim()
    const en = (override.en ?? base).trim()
    if (!cs || !en) {
      console.warn(`Skipping subcategory ${id}: empty cs/en after merge`)
      continue
    }

    const body = {
      name: { cs, en },
      slug: { cs: slugifyAscii(cs), en: slugifyAscii(en) },
      meta: { status: 'published' as const },
    }

    if (dryRun) {
      console.log(
        `[dry-run] ${id} | ${JSON.stringify(csvLabel ?? fallbackName)} → name=${JSON.stringify(body.name)} slug=${JSON.stringify(body.slug)}`
      )
      updated++
      continue
    }

    await client.items.update(id, body)
    updated++
    console.log(`Updated portfolio_subcategory ${id} (${en})`)
    await sleep(120)
  }

  if (dryRun) {
    console.log(`\nDry run: would touch ${updated} record(s).`)
  } else {
    console.log(`\nDone: ${updated} record(s) updated.`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
