/**
 * Export Portfolio records from DatoCMS to CSV (Content Management API).
 *
 * Columns match scripts/import-portfolio.ts (11 columns, no canonical_tags).
 *
 * Usage:
 *   pnpm export:portfolio -- path/to/out.csv
 *   pnpm export:portfolio -- path/to/out.csv --published-only
 *
 * Requires DATOCMS_MANAGEMENT_API_TOKEN (or DATOCMS_API_TOKEN with CMA access).
 */

import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { buildClient } from '@datocms/cma-client-node'
import {
  buildTaxonomyIdToNameMaps,
  fetchAllItemsOfType,
} from './import-taxonomy-lookup'
import { localizedDescriptionToPlainCsEn } from './dast-to-plain'

const HEADER_ROW =
  'ODKAZ,Titulek videa,,,Slug,Rok,Kategorie 1,Kategorie 2,Klient,Lokace,Štítky'

function escapeCsvField(s: string): string {
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function parseArgs(argv: string[]) {
  const args = argv.slice(2).filter((a) => a !== '--')
  const publishedOnly = args.includes('--published-only')
  const paths = args.filter((a) => a !== '--published-only')
  const outPath = paths[0]
  return { outPath, publishedOnly }
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

function firstLinkId(raw: unknown): string | null {
  if (raw == null) {
    return null
  }
  if (Array.isArray(raw)) {
    const first = raw[0]
    if (typeof first === 'string') {
      return first
    }
    if (first && typeof first === 'object' && 'id' in first) {
      return String((first as { id: string }).id)
    }
  }
  return null
}

function yearFromDate(raw: unknown): string {
  const s = strField(raw).trim()
  const m = /^(\d{4})-\d{2}-\d{2}/.exec(s)
  if (m) {
    return m[1]
  }
  if (/^\d{4}$/.test(s)) {
    return s
  }
  return ''
}

function getMetaStatus(item: Record<string, unknown>): string | undefined {
  const meta = item.meta as { status?: string } | undefined
  if (meta?.status) {
    return meta.status
  }
  const attrs = item.attributes as Record<string, unknown> | undefined
  const inner = attrs?.meta as { status?: string } | undefined
  return inner?.status
}

function getAttrNumber(
  item: Record<string, unknown>,
  key: string
): number | null {
  const v = getItemField(item, key)
  if (typeof v === 'number' && !Number.isNaN(v)) {
    return v
  }
  if (typeof v === 'string') {
    const n = parseInt(v, 10)
    return Number.isNaN(n) ? null : n
  }
  return null
}

type Client = ReturnType<typeof buildClient>

async function fetchAllPortfolios(
  client: Client
): Promise<Record<string, unknown>[]> {
  return fetchAllItemsOfType(client, 'portfolio')
}

function portfolioToRow(
  item: Record<string, unknown>,
  catNames: Map<string, string>,
  subNames: Map<string, string>
): string[] {
  const video = strField(getItemField(item, 'video'))
  const title = strField(getItemField(item, 'title'))
  const slug = strField(getItemField(item, 'slug'))
  const rok = yearFromDate(getItemField(item, 'date'))
  const klient = strField(getItemField(item, 'client'))
  const lokace = strField(getItemField(item, 'location'))
  const stitky = strField(getItemField(item, 'tags'))

  const catId = firstLinkId(getItemField(item, 'category'))
  const subId = firstLinkId(getItemField(item, 'subcategory'))
  const kategorie1 = catId ? (catNames.get(catId) ?? '') : ''
  const kategorie2 = subId ? (subNames.get(subId) ?? '') : ''

  const description = getItemField(item, 'description')
  const { cs: popisCs, en: popisEn } =
    localizedDescriptionToPlainCsEn(description)

  return [
    video,
    title,
    popisCs,
    popisEn,
    slug,
    rok,
    kategorie1,
    kategorie2,
    klient,
    lokace,
    stitky,
  ].map((f) => escapeCsvField(f ?? ''))
}

async function main() {
  const { outPath, publishedOnly } = parseArgs(process.argv)
  if (!outPath) {
    console.error(
      'Usage: pnpm export:portfolio -- <path-to-output.csv> [--published-only]'
    )
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

  const client = buildClient({ apiToken: token })
  const [{ category: catNames, subcategory: subNames }, portfolios] =
    await Promise.all([
      buildTaxonomyIdToNameMaps(client),
      fetchAllPortfolios(client),
    ])

  let list = portfolios
  if (publishedOnly) {
    list = list.filter((item) => getMetaStatus(item) === 'published')
  }

  list.sort((a, b) => {
    const pa = getAttrNumber(a, 'position')
    const pb = getAttrNumber(b, 'position')
    if (pa != null && pb != null && pa !== pb) {
      return pa - pb
    }
    if (pa != null && pb == null) {
      return -1
    }
    if (pa == null && pb != null) {
      return 1
    }
    const ta = strField(getItemField(a, 'title'))
    const tb = strField(getItemField(b, 'title'))
    if (ta !== tb) {
      return ta.localeCompare(tb)
    }
    return strField(getItemField(a, 'slug')).localeCompare(
      strField(getItemField(b, 'slug'))
    )
  })

  const lines = [
    HEADER_ROW,
    ...list.map((item) => portfolioToRow(item, catNames, subNames).join(',')),
  ]
  const resolved = path.resolve(outPath)
  fs.writeFileSync(resolved, lines.join('\n') + '\n', 'utf8')
  console.log(`Wrote ${list.length} rows to ${resolved}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
