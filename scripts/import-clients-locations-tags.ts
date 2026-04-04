/**
 * Phase 1: Upsert Client and Location records from PORTFOLIO-list.csv (DatoCMS CMA).
 * Locations use localized slugs: distinct `cs` and `en` URL segments (SEO).
 * Does not create Portfolio items. Tags are stored on Portfolio as a string field via import:portfolio.
 *
 * Usage:
 *   pnpm import:references -- path/to/PORTFOLIO-list.csv
 *   pnpm import:references -- path/to/PORTFOLIO-list.csv --dry-run
 *
 * Requires DATOCMS_MANAGEMENT_API_TOKEN (or DATOCMS_API_TOKEN with CMA access).
 *
 * @see https://www.datocms.com/docs/content-management-api
 */

import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'csv-parse/sync'
import { buildClient } from '@datocms/cma-client-node'
import { fetchAllItemsOfType } from './import-taxonomy-lookup'
import { PORTFOLIO_CSV_COLUMNS } from './portfolio-csv-columns'

const CSV_COLUMNS = PORTFOLIO_CSV_COLUMNS

type CsvRow = Record<(typeof CSV_COLUMNS)[number], string>

function parseArgs(argv: string[]) {
  const args = argv.slice(2).filter((a) => a !== '--')
  const dryRun = args.includes('--dry-run')
  const paths = args.filter((a) => a !== '--dry-run')
  return { csvPath: paths[0], dryRun }
}

function loadLocationEnMap(): Record<string, string> {
  const p = path.join(process.cwd(), 'data/location-en-names.json')
  if (!fs.existsSync(p)) {
    return {}
  }
  return JSON.parse(fs.readFileSync(p, 'utf8')) as Record<string, string>
}

/** ASCII slug: strip diacritics, lowercase, non-alphanumerics → hyphen. */
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

function getItemField(item: Record<string, unknown>, key: string): unknown {
  const attrs = item.attributes as Record<string, unknown> | undefined
  if (attrs && key in attrs) {
    return attrs[key]
  }
  if (key in item) {
    return item[key]
  }
  return undefined
}

function strField(raw: unknown): string {
  if (raw == null) {
    return ''
  }
  if (typeof raw === 'string') {
    return raw
  }
  if (typeof raw === 'number' || typeof raw === 'boolean') {
    return String(raw)
  }
  return ''
}

/** Localized string field: first non-empty locale (en preferred for slug identity). */
function localizedString(raw: unknown): string {
  if (typeof raw === 'string') {
    return raw.trim()
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>
    for (const k of ['en', 'cs', 'default']) {
      const v = o[k]
      if (typeof v === 'string' && v.trim()) {
        return v.trim()
      }
    }
    for (const v of Object.values(o)) {
      if (typeof v === 'string' && v.trim()) {
        return v.trim()
      }
    }
  }
  return ''
}

function localizedLocale(
  raw: unknown,
  locale: 'cs' | 'en'
): string {
  if (typeof raw === 'string') {
    return raw.trim()
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const v = (raw as Record<string, unknown>)[locale]
    if (typeof v === 'string' && v.trim()) {
      return v.trim()
    }
  }
  return ''
}

async function findItemTypeId(
  client: ReturnType<typeof buildClient>,
  apiKey: string
): Promise<string> {
  const types = await client.itemTypes.list()
  const t = types.find((x) => x.api_key === apiKey)
  if (!t) {
    throw new Error(`No item type with api_key "${apiKey}" in this DatoCMS environment.`)
  }
  return t.id
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function collectFromRows(rows: CsvRow[], locationEn: Record<string, string>) {
  const clients = new Map<string, string>()
  const locations = new Map<
    string,
    { cs: string; en: string; slugCs: string; slugEn: string }
  >()
  const unknownLocations = new Set<string>()

  for (const row of rows) {
    const c = row.client?.trim()
    if (c) {
      const slug = slugifyAscii(c)
      if (!clients.has(slug)) {
        clients.set(slug, c)
      }
    }

    const z = row.země?.trim()
    if (z) {
      const en = locationEn[z]
      if (!en) {
        unknownLocations.add(z)
      } else if (!locations.has(z)) {
        locations.set(z, {
          cs: z,
          en,
          slugCs: slugifyAscii(z),
          slugEn: slugifyAscii(en),
        })
      }
    }
  }

  return {
    clients,
    locations,
    unknownLocations,
  }
}

async function main() {
  const { csvPath, dryRun } = parseArgs(process.argv)
  if (!csvPath) {
    console.error('Usage: pnpm import:references -- <path-to.csv> [--dry-run]')
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
    columns: [...CSV_COLUMNS],
    from_line: 2,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
    skip_empty_lines: true,
  }) as CsvRow[]

  const locationEn = loadLocationEnMap()
  const collected = collectFromRows(rows, locationEn)

  if (collected.unknownLocations.size > 0) {
    console.error(
      'Unknown země natáčení (add keys to data/location-en-names.json):'
    )
    for (const z of [...collected.unknownLocations].sort()) {
      console.error(`  - ${z}`)
    }
    process.exit(1)
  }

  console.log(
    `Collected: ${collected.clients.size} clients, ${collected.locations.size} locations (${rows.length} CSV rows)`
  )

  if (dryRun || !token) {
    console.log('\n[dry-run] Would upsert:')
    for (const [slug, name] of [...collected.clients].sort((a, b) =>
      a[0].localeCompare(b[0])
    )) {
      console.log(`  client  ${slug} ← ${name}`)
    }
    for (const { cs, en, slugCs, slugEn } of [
      ...collected.locations.values(),
    ].sort((a, b) => a.slugEn.localeCompare(b.slugEn))) {
      console.log(
        `  location cs/${slugCs} en/${slugEn} ← "${cs}" / "${en}"`
      )
    }
    console.log('\nDry run OK (no API calls).')
    process.exit(0)
  }

  const client = buildClient({ apiToken: token })
  const [clientTypeId, locationTypeId] = await Promise.all([
    findItemTypeId(client, 'client'),
    findItemTypeId(client, 'location'),
  ])

  const [existingClients, existingLocs] = await Promise.all([
    fetchAllItemsOfType(client, 'client'),
    fetchAllItemsOfType(client, 'location'),
  ])

  function itemId(it: Record<string, unknown>): string {
    const top = it.id
    if (typeof top === 'string' && top) {
      return top
    }
    return strField(getItemField(it, 'id'))
  }

  const clientBySlug = new Map<string, { id: string }>()
  for (const it of existingClients) {
    const slug = localizedString(getItemField(it, 'slug'))
    const id = itemId(it)
    if (slug && id) {
      clientBySlug.set(slugifyAscii(slug), { id })
    }
  }

  /** Match Location by CS country name (stable key from CSV). */
  const locByCsName = new Map<string, { id: string }>()
  for (const it of existingLocs) {
    const nameCs = localizedLocale(getItemField(it, 'name'), 'cs')
    const id = itemId(it)
    if (nameCs && id) {
      locByCsName.set(nameCs, { id })
    }
  }

  let created = 0
  let updated = 0

  for (const [slugKey, displayName] of collected.clients) {
    const body = {
      name: displayName,
      slug: slugKey,
      meta: { status: 'published' as const },
    }
    const existing = clientBySlug.get(slugKey)
    if (existing) {
      await client.items.update(existing.id, body)
      updated++
      console.log(`Updated client: ${slugKey}`)
    } else {
      await client.items.create({
        item_type: { type: 'item_type' as const, id: clientTypeId },
        ...body,
      })
      created++
      console.log(`Created client: ${slugKey}`)
    }
    await sleep(120)
  }

  for (const countryKey of collected.locations.keys()) {
    const { cs, en, slugCs, slugEn } = collected.locations.get(countryKey)!
    const body = {
      name: { cs, en },
      slug: { cs: slugCs, en: slugEn },
      meta: { status: 'published' as const },
    }
    const existing = locByCsName.get(cs)
    if (existing) {
      await client.items.update(existing.id, body)
      updated++
      console.log(`Updated location: cs/${slugCs} en/${slugEn}`)
    } else {
      await client.items.create({
        item_type: { type: 'item_type' as const, id: locationTypeId },
        ...body,
      })
      created++
      console.log(`Created location: cs/${slugCs} en/${slugEn}`)
    }
    await sleep(120)
  }

  console.log(`\nDone: ${created} created, ${updated} updated`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
