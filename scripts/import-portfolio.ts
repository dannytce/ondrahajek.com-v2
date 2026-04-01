/**
 * Import portfolio rows from CSV into DatoCMS Portfolio records (Content Management API).
 *
 * CSV (header row 1): ODKAZ,Titulek videa,,,Slug,Rok,Kategorie 1,Kategorie 2,Klient,Lokace,Štítky
 * Unnamed columns = Czech + English long descriptions.
 *
 * Mapping:
 *   odkaz → video (YouTube → embed URL)
 *   titulek → title
 *   slug → slug
 *   popis_cs / popis_en → description (locales cs / en, Structured Text)
 *   rok → date (YYYY-01-01)
 *   klient → client
 *   lokace → location
 *   kategorie1 → category (portfolio_category: case-insensitive name match + optional aliases)
 *   kategorie2 → subcategory (portfolio_subcategory: same)
 *   subtitle → short line Klient · Lokace (both cs and en)
 *   stitky → Portfolio `tags` (single string, stored as in CSV — e.g. #hashtag #hashtag …)
 *
 * Requires DATOCMS_MANAGEMENT_API_TOKEN (or DATOCMS_API_TOKEN with CMA access).
 *
 * Usage:
 *   pnpm import:portfolio -- path/to/file.csv
 *   pnpm import:portfolio -- path/to/file.csv --dry-run
 *   pnpm import:portfolio -- path/to/file.csv --update-only   # only PATCH existing items (match by slug); never create
 *
 * @see https://www.datocms.com/docs/content-management-api
 */

import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'csv-parse/sync'
import { buildClient } from '@datocms/cma-client-node'
import {
  plainTextToStructuredTextRequest,
  type StructuredTextRequest,
} from './plain-text-to-dast'
import {
  buildTaxonomyMaps,
  loadTaxonomyAliasesFromDisk,
  resolveTaxonomyId,
  type TaxonomyMaps,
} from './import-taxonomy-lookup'

const COLUMN_NAMES = [
  'odkaz',
  'titulek',
  'popis_cs',
  'popis_en',
  'slug',
  'rok',
  'kategorie1',
  'kategorie2',
  'klient',
  'lokace',
  'stitky',
] as const

type Row = Record<(typeof COLUMN_NAMES)[number], string>

const warnedMissingTaxonomy = new Set<string>()

function parseArgs(argv: string[]) {
  const args = argv.slice(2).filter((a) => a !== '--')
  const dryRun = args.includes('--dry-run')
  const updateOnly = args.includes('--update-only')
  const paths = args.filter((a) => a !== '--dry-run' && a !== '--update-only')
  const csvPath = paths[0]
  return { csvPath, dryRun, updateOnly }
}

function youtubeEmbedBase(url: string): string {
  const trimmed = url.trim()
  let id: string | null = null
  try {
    const u = new URL(trimmed)
    if (u.hostname === 'youtu.be') {
      id = u.pathname.replace(/^\//, '').split('/')[0] ?? null
    } else if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/embed/')) {
        id = u.pathname.split('/').filter(Boolean)[1] ?? null
      } else {
        id = u.searchParams.get('v')
      }
    }
  } catch {
    throw new Error(`Invalid video URL: ${url}`)
  }
  if (!id) {
    throw new Error(`Could not parse YouTube video id from: ${url}`)
  }
  return `https://www.youtube.com/embed/${id}`
}

function yearToIsoDate(rok: string): string | null {
  const y = parseInt(rok.trim(), 10)
  if (Number.isNaN(y) || y < 1900 || y > 2100) {
    return null
  }
  return `${y}-01-01`
}

function buildShortSubtitle(row: Row): string {
  const parts = [row.klient, row.lokace].map((s) => s?.trim()).filter(Boolean)
  return parts.join(' · ')
}

async function findPortfolioItemTypeId(
  client: ReturnType<typeof buildClient>
): Promise<string> {
  const types = await client.itemTypes.list()
  const portfolio = types.find((t) => t.api_key === 'portfolio')
  if (!portfolio) {
    throw new Error(
      'No item type with api_key "portfolio" found in this DatoCMS environment.'
    )
  }
  return portfolio.id
}

async function findItemBySlug(
  client: ReturnType<typeof buildClient>,
  slug: string
): Promise<{ id: string } | null> {
  const items = await client.items.list({
    filter: {
      type: 'portfolio',
      fields: {
        slug: {
          eq: slug,
        },
      },
    },
    page: { limit: 1 },
  })
  const first = items[0]
  return first ? { id: first.id } : null
}

function warnMissingTaxonomy(
  modelApiKey: 'portfolio_category' | 'portfolio_subcategory',
  csvValue: string,
  maps: TaxonomyMaps
) {
  const k = `${modelApiKey}:${csvValue.trim()}`
  if (warnedMissingTaxonomy.has(k)) {
    return
  }
  warnedMissingTaxonomy.add(k)
  const sample = [
    ...(modelApiKey === 'portfolio_category'
      ? maps.category
      : maps.subcategory
    ).keys(),
  ]
    .slice(0, 12)
    .join(', ')
  console.warn(
    `No ${modelApiKey} matching "${csvValue.trim()}" (after normalization/aliases). Known examples: ${sample || '(none)'}`
  )
}

/** Dato Portfolio `tags`: one string from `Štítky`, unchanged (e.g. PORTFOLIO.FINAL2.csv). */
function buildTagsField(row: Row): string | null {
  const t = row.stitky?.trim()
  return t || null
}

function buildLocalizedDescription(row: Row) {
  const cs = plainTextToStructuredTextRequest(row.popis_cs ?? '')
  const en = plainTextToStructuredTextRequest(row.popis_en ?? '')
  const out: { cs?: StructuredTextRequest; en?: StructuredTextRequest } = {}
  if (cs) {
    out.cs = cs
  }
  if (en) {
    out.en = en
  }
  return Object.keys(out).length ? out : null
}

async function main() {
  const { csvPath, dryRun, updateOnly } = parseArgs(process.argv)
  if (!csvPath) {
    console.error(
      'Usage: pnpm import:portfolio -- <path-to.csv> [--dry-run] [--update-only]'
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
  if (!token && !dryRun) {
    console.error(
      'Set DATOCMS_MANAGEMENT_API_TOKEN (or DATOCMS_API_TOKEN) in .env'
    )
    process.exit(1)
  }

  const raw = fs.readFileSync(resolved, 'utf8')
  const rows = parse(raw, {
    columns: [...COLUMN_NAMES],
    from_line: 2,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
    skip_empty_lines: true,
  }) as Row[]

  const client = token ? buildClient({ apiToken: token }) : null
  const itemTypeId =
    client && !dryRun ? await findPortfolioItemTypeId(client) : ''
  const taxonomyAliases = loadTaxonomyAliasesFromDisk()
  const taxonomyMaps = client ? await buildTaxonomyMaps(client) : null

  let created = 0
  let updated = 0
  let skippedUpdateOnly = 0
  let errors = 0
  let dryOk = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const line = i + 2
    try {
      const slug = row.slug?.trim()
      const title = row.titulek?.trim()
      if (!slug || !title) {
        console.warn(`Line ${line}: skipping — missing slug or title`)
        errors++
        continue
      }

      const video = youtubeEmbedBase(row.odkaz)
      const shortSubtitle = buildShortSubtitle(row)
      const dateStr = yearToIsoDate(row.rok ?? '')
      const description = buildLocalizedDescription(row)

      let categoryIds: string[] = []
      let subcategoryIds: string[] = []
      if (client && taxonomyMaps) {
        const k1 = row.kategorie1 ?? ''
        const k2 = row.kategorie2 ?? ''
        const c1 = resolveTaxonomyId(
          taxonomyMaps,
          'portfolio_category',
          k1,
          taxonomyAliases
        )
        const c2 = resolveTaxonomyId(
          taxonomyMaps,
          'portfolio_subcategory',
          k2,
          taxonomyAliases
        )
        if (c1) {
          categoryIds = [c1]
        } else if (k1.trim()) {
          warnMissingTaxonomy('portfolio_category', k1, taxonomyMaps)
        }
        if (c2) {
          subcategoryIds = [c2]
        } else if (k2.trim()) {
          warnMissingTaxonomy('portfolio_subcategory', k2, taxonomyMaps)
        }
      }

      let existing: { id: string } | null = null
      if (client) {
        existing = await findItemBySlug(client, slug)
      }

      if (dryRun || !client) {
        const descCsLen = (row.popis_cs ?? '').trim().length
        const descEnLen = (row.popis_en ?? '').trim().length
        const catLabel = client ? `${categoryIds.length ? 'yes' : '—'}` : 'n/a'
        const subLabel = client
          ? `${subcategoryIds.length ? 'yes' : '—'}`
          : 'n/a'
        let upsertHint = ''
        if (client) {
          if (updateOnly) {
            upsertHint = existing
              ? ' | action: update'
              : ' | action: skip (no slug in Dato)'
          } else {
            upsertHint = existing ? ' | action: update' : ' | action: create'
          }
        }
        const tagsPreview = buildTagsField(row)
        const tagsLabel = tagsPreview
          ? tagsPreview.includes('#')
            ? `${(tagsPreview.match(/#/g) ?? []).length} #tags`
            : `${tagsPreview.length} chars`
          : '—'
        console.log(
          `[dry-run] ${slug} | desc cs/en: ${descCsLen}/${descEnLen} chars | date: ${dateStr ?? '—'} | category: ${catLabel} subcategory: ${subLabel} | tags: ${tagsLabel}${upsertHint}`
        )
        dryOk++
        continue
      }

      if (updateOnly && !existing) {
        console.warn(`Skipped (update-only, unknown slug): ${slug}`)
        skippedUpdateOnly++
        continue
      }

      const subtitleLocales =
        shortSubtitle.length > 0
          ? { cs: shortSubtitle, en: shortSubtitle }
          : undefined

      const tagsField = buildTagsField(row)

      const baseFields = {
        title,
        slug,
        video,
        client: (row.klient ?? '').trim() || null,
        location: (row.lokace ?? '').trim() || null,
        ...(dateStr ? { date: dateStr } : {}),
        category: categoryIds,
        subcategory: subcategoryIds,
        ...(subtitleLocales ? { subtitle: subtitleLocales } : {}),
        ...(description ? { description } : {}),
        ...(tagsField ? { tags: tagsField } : {}),
        meta: { status: 'published' as const },
      }

      if (existing) {
        await client.items.update(existing.id, baseFields)
        updated++
        console.log(`Updated: ${slug}`)
      } else {
        await client.items.create({
          item_type: { type: 'item_type' as const, id: itemTypeId },
          ...baseFields,
        })
        created++
        console.log(`Created: ${slug}`)
      }

      await new Promise((r) => setTimeout(r, 150))
    } catch (e) {
      errors++
      console.error(`Line ${line}:`, e instanceof Error ? e.message : e)
    }
  }

  if (dryRun) {
    const mode = updateOnly ? ' [update-only]' : ''
    console.log(`Dry run${mode}: ${dryOk} rows OK, ${errors} skipped/errors`)
  } else {
    const skipPart =
      updateOnly && skippedUpdateOnly > 0
        ? `, ${skippedUpdateOnly} skipped (unknown slug)`
        : ''
    console.log(
      `Done: ${created} created, ${updated} updated${skipPart}, ${errors} errors`
    )
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
