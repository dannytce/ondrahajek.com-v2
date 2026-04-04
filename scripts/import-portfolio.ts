/**
 * Import portfolio rows from PORTFOLIO-list.csv into DatoCMS Portfolio records (CMA).
 *
 * CSV columns: same layout as Phase 1 (see `portfolio-csv-columns.ts`).
 *
 * Matching (existing Dato rows):
 *   Tier 1 — canonical video key (YouTube / Vimeo) from `link` vs stored `video`.
 *   Tier 2 — same Client (linked or legacy string) + title similarity (optional, --no-fuzzy disables).
 *
 * Requires DATOCMS_MANAGEMENT_API_TOKEN (or DATOCMS_API_TOKEN with CMA access).
 * Optional: DATOCMS_GRAPHQL_TOKEN (read-only with Content Delivery API) for admin `_editingUrl` in duplicate errors;
 * DATOCMS_ENVIRONMENT if not using the primary Dato environment (same value for CMA + GraphQL).
 *
 * Usage:
 *   pnpm import:portfolio -- path/to/PORTFOLIO-list.csv
 *   pnpm import:portfolio -- path/to/PORTFOLIO-list.csv --dry-run
 *   pnpm import:portfolio -- path/to/PORTFOLIO-list.csv --update-only
 *   pnpm import:portfolio -- path/to/PORTFOLIO-list.csv --no-fuzzy
 *   pnpm import:portfolio -- path/to/PORTFOLIO-list.csv --update-only --verify-skipped
 *   pnpm import:portfolio -- path/to/PORTFOLIO-list.csv --update-only --skipped-report skipped.csv
 *
 * Tag keys (canonical EN slugs, `;`-separated) are written to the Portfolio string field `tags`
 * (override with `DATOCMS_PORTFOLIO_TAGS_FIELD` if your API identifier differs).
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
  fetchAllItemsOfType,
} from './import-taxonomy-lookup'
import {
  parseVideoKey,
  normalizeVideoEmbedUrl,
  slugifyAscii,
  bestTitleScore,
  pickTier2Match,
  YEAR_BOOST,
  SIMILARITY_THRESHOLD,
  type VideoKey,
} from './portfolio-match'
import {
  fetchPortfolioEditingHints,
  resolveDatocmsEnvironment,
  resolveGraphqlContentToken,
} from './datocms-portfolio-editing-url'
import { PORTFOLIO_CSV_COLUMNS } from './portfolio-csv-columns'

/** CMA attribute for semicolon-separated tag keys; must match Portfolio single-line string field (default `tags`). */
const PORTFOLIO_TAGS_CMA_FIELD =
  process.env.DATOCMS_PORTFOLIO_TAGS_FIELD?.trim() || 'tags'

/** Same as `CATEGORY_IDS['selected-work']` in `src/i18n/index.ts` — "Selected Work (homepage)" in CMS. */
const SELECTED_WORK_CATEGORY_ID = 'MB-MnGx_RlWwUyXvE4LNPQ'

const COLUMN_NAMES = PORTFOLIO_CSV_COLUMNS

type Row = Record<(typeof COLUMN_NAMES)[number], string>

const warnedMissingTaxonomy = new Set<string>()

function parseArgs(argv: string[]) {
  const args = argv.slice(2).filter((a) => a !== '--')
  const dryRun = args.includes('--dry-run')
  const updateOnly = args.includes('--update-only')
  const noFuzzy = args.includes('--no-fuzzy')
  const verifySkipped = args.includes('--verify-skipped')
  let skippedReportPath: string | undefined
  const rest: string[] = []
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--skipped-report') {
      const next = args[i + 1]
      if (next && !next.startsWith('--')) {
        skippedReportPath = next
        i++
      }
      continue
    }
    if (
      [
        '--dry-run',
        '--update-only',
        '--no-fuzzy',
        '--verify-skipped',
      ].includes(a)
    ) {
      continue
    }
    rest.push(a)
  }
  const csvPath = rest[0]
  return {
    csvPath,
    dryRun,
    updateOnly,
    noFuzzy,
    verifySkipped,
    skippedReportPath,
  }
}

function escapeCsvField(s: string): string {
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

type SkippedUpdateOnlyEntry = { line: number; row: Row }

type SkippedVerification = {
  /** No slug/title hit and no video key map — probably missing in Dato */
  likelyAbsent: boolean
  videoTier1Id: string | null
  slugMatchIds: string[]
  titleMatchIds: string[]
  hints: string[]
}

/** Cross-check a CSV row that was skipped in --update-only against data already loaded from Dato. */
function verifySkippedAgainstDato(
  row: Row,
  videoKeyToId: Map<VideoKey, string>,
  enriched: PortfolioEnriched[]
): SkippedVerification {
  const vk = parseVideoKey(row.link)
  const slugEn = row.slug_en?.trim() ?? ''
  const slugCs = row.slug_cs?.trim() ?? ''
  const titleEn = row.title_en?.trim() ?? ''
  const titleCs = row.title_cs?.trim() ?? ''

  const videoTier1Id = vk && videoKeyToId.has(vk) ? videoKeyToId.get(vk)! : null

  const slugMatchIds = enriched
    .filter(
      (p) =>
        (slugEn &&
          (p.slugEn === slugEn || p.slugCs === slugEn)) ||
        (slugCs && (p.slugCs === slugCs || p.slugEn === slugCs))
    )
    .map((p) => p.id)

  const titleMatchIds = enriched
    .filter(
      (p) =>
        (titleEn &&
          (p.titleEn === titleEn ||
            p.titleCs === titleEn ||
            p.titleFallback === titleEn)) ||
        (titleCs &&
          (p.titleCs === titleCs ||
            p.titleEn === titleCs ||
            p.titleFallback === titleCs))
    )
    .map((p) => p.id)

  const hints: string[] = []
  if (videoTier1Id) {
    hints.push(
      `Unexpected: CSV video key maps to Dato id ${videoTier1Id} (tier1 should have matched — check assigned/excluded logic).`
    )
  }
  if (slugMatchIds.length) {
    hints.push(
      `Same slug exists on Dato record(s): ${slugMatchIds.join(', ')} — video URL or title/client likely differs from CSV.`
    )
  }
  if (titleMatchIds.length && !slugMatchIds.length) {
    hints.push(
      `Same title exists on Dato record(s): ${titleMatchIds.join(', ')} — slugs differ or tier2 did not match.`
    )
  }

  const likelyAbsent =
    !videoTier1Id &&
    slugMatchIds.length === 0 &&
    titleMatchIds.length === 0

  return {
    likelyAbsent,
    videoTier1Id,
    slugMatchIds,
    titleMatchIds,
    hints,
  }
}

function printAndReportSkipped(
  entries: SkippedUpdateOnlyEntry[],
  videoKeyToId: Map<VideoKey, string>,
  enriched: PortfolioEnriched[],
  verify: boolean,
  reportPath: string | undefined
) {
  if (entries.length === 0) {
    return
  }

  const rows: string[] = []
  const header = [
    'line',
    'likely_absent_in_dato',
    'video_key',
    'slug_en',
    'title_en',
    'link',
    'dato_slug_ids',
    'dato_title_ids',
    'dato_video_tier1_id',
    'notes',
  ].join(',')

  console.log(
    `\n── Skipped (${entries.length} row(s), --update-only with no tier1/tier2 match) ──`
  )

  for (const { line, row } of entries) {
    const v = verifySkippedAgainstDato(row, videoKeyToId, enriched)
    const vk = parseVideoKey(row.link) ?? ''
    const notes = v.hints.join(' | ')
    console.log(
      `  line ${line}  slug_en=${row.slug_en?.trim() ?? ''}  likely_absent_in_dato=${v.likelyAbsent ? 'yes' : 'no'}`
    )
    if ((verify || reportPath) && v.hints.length) {
      for (const h of v.hints) {
        console.log(`    ${h}`)
      }
    }
    rows.push(
      [
        String(line),
        v.likelyAbsent ? 'yes' : 'no',
        escapeCsvField(vk),
        escapeCsvField(row.slug_en?.trim() ?? ''),
        escapeCsvField(row.title_en?.trim() ?? ''),
        escapeCsvField(row.link?.trim() ?? ''),
        escapeCsvField(v.slugMatchIds.join(';')),
        escapeCsvField(v.titleMatchIds.join(';')),
        escapeCsvField(v.videoTier1Id ?? ''),
        escapeCsvField(notes),
      ].join(',')
    )
  }

  if (reportPath) {
    const out = path.resolve(reportPath)
    fs.writeFileSync(out, [header, ...rows].join('\n') + '\n', 'utf8')
    console.log(`Wrote skipped report: ${out}`)
  }

  if (!verify && !reportPath) {
    console.log(
      '  Tip: add --verify-skipped for overlap hints, or --skipped-report <file.csv> to export.'
    )
  }
}

function yearToIsoDate(rok: string): string | null {
  const y = parseInt(rok.trim(), 10)
  if (Number.isNaN(y) || y < 1900 || y > 2100) {
    return null
  }
  return `${y}-01-01`
}

/** CSV `priorita` → Dato integer field `priority` (display order / importance). */
function parsePriority(priorita: string): number | undefined {
  const n = parseInt(priorita?.trim() ?? '', 10)
  return Number.isFinite(n) ? n : undefined
}

/** `video na titulní stránce?` — add Selected Work category when truthy. */
function parseHomepageFlag(homepage: string): boolean {
  const s = homepage?.trim().toLowerCase()
  return s === 'ano' || s === 'yes' || s === '1' || s === 'true'
}

function yearFromDateField(raw: unknown): number | null {
  const s = strField(raw).trim()
  const m = /^(\d{4})-\d{2}-\d{2}/.exec(s)
  if (m) {
    return parseInt(m[1]!, 10)
  }
  if (/^\d{4}$/.test(s)) {
    return parseInt(s, 10)
  }
  return null
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

function localizedLocale(raw: unknown, locale: 'cs' | 'en'): string {
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

function itemId(it: Record<string, unknown>): string {
  const top = it.id
  if (typeof top === 'string' && top) {
    return top
  }
  return strField(getItemField(it, 'id'))
}

/** Single link field (client, location). */
function linkId(raw: unknown): string | null {
  if (raw == null) {
    return null
  }
  if (typeof raw === 'string') {
    return raw
  }
  if (typeof raw === 'object' && !Array.isArray(raw) && 'id' in raw) {
    return String((raw as { id: string }).id)
  }
  if (Array.isArray(raw) && raw[0]) {
    return linkId(raw[0])
  }
  return null
}

function splitTagList(raw: string): string[] {
  if (!raw?.trim()) {
    return []
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function buildShortSubtitle(row: Row): string {
  const parts = [row.client, row.země].map((s) => s?.trim()).filter(Boolean)
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

function buildLocalizedDescription(row: Row) {
  const cs = plainTextToStructuredTextRequest(row.desc_cs ?? '')
  const en = plainTextToStructuredTextRequest(row.desc_en ?? '')
  const out: { cs?: StructuredTextRequest; en?: StructuredTextRequest } = {}
  if (cs) {
    out.cs = cs
  }
  if (en) {
    out.en = en
  }
  return Object.keys(out).length ? out : null
}

type PortfolioEnriched = {
  id: string
  videoKey: VideoKey | null
  clientId: string | null
  clientLegacy: string
  titleCs: string
  titleEn: string
  titleFallback: string
  year: number | null
  slugCs: string
  slugEn: string
}

function enrichPortfolio(item: Record<string, unknown>): PortfolioEnriched {
  const id = itemId(item)
  const videoRaw = strField(getItemField(item, 'video'))
  const titleRaw = getItemField(item, 'title')
  const slugRaw = getItemField(item, 'slug')
  const titleCs =
    localizedLocale(titleRaw, 'cs') || localizedString(titleRaw)
  const titleEn =
    localizedLocale(titleRaw, 'en') || localizedString(titleRaw)
  const titleFallback = localizedString(titleRaw)
  const slugCs =
    localizedLocale(slugRaw, 'cs') || localizedString(slugRaw)
  const slugEn =
    localizedLocale(slugRaw, 'en') || localizedString(slugRaw)
  let videoKey = parseVideoKey(videoRaw)
  if (!videoKey && videoRaw) {
    const norm = normalizeVideoEmbedUrl(videoRaw)
    if (norm) {
      videoKey = parseVideoKey(norm)
    }
  }
  const clientId = linkId(getItemField(item, 'client'))
  const clientLegacy = strField(getItemField(item, 'clientLegacy'))
  const year = yearFromDateField(getItemField(item, 'date'))
  return {
    id,
    videoKey,
    clientId,
    clientLegacy,
    titleCs,
    titleEn,
    titleFallback,
    year,
    slugCs,
    slugEn,
  }
}

function csvClientSlug(row: Row): string | null {
  const c = row.client?.trim()
  return c ? slugifyAscii(c) : null
}

function portfolioMatchesCsvClient(
  p: PortfolioEnriched,
  csvSlug: string,
  clientIdForCsv: string | null
): boolean {
  if (!clientIdForCsv) {
    return false
  }
  if (p.clientId === clientIdForCsv) {
    return true
  }
  if (!p.clientId && p.clientLegacy?.trim()) {
    return slugifyAscii(p.clientLegacy) === csvSlug
  }
  return false
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function formatEnrichedForDuplicateHint(
  e: PortfolioEnriched | undefined,
  cmaId: string
): string[] {
  if (!e) {
    return [`    (no local title — CMA id: ${cmaId})`]
  }
  const title =
    [e.titleEn, e.titleCs].filter(Boolean).join(' / ') || e.titleFallback
  const slug = [e.slugEn, e.slugCs].filter(Boolean).join(' / ')
  const bits = [
    `    title: ${title || '—'}`,
    slug ? `    slug: ${slug}` : null,
    `    CMA record id (API): ${cmaId}`,
  ].filter(Boolean) as string[]
  return bits
}

async function duplicateVideoKeyError(
  apiToken: string,
  videoKey: VideoKey,
  cmaIdA: string,
  cmaIdB: string,
  enrichedList: PortfolioEnriched[]
): Promise<Error> {
  const gqlToken = resolveGraphqlContentToken(apiToken)
  const gqlEnv = resolveDatocmsEnvironment()
  const gqlOpts = gqlEnv ? { environment: gqlEnv } : undefined

  const [ra, rb] = await Promise.all([
    fetchPortfolioEditingHints(gqlToken, cmaIdA, gqlOpts),
    fetchPortfolioEditingHints(gqlToken, cmaIdB, gqlOpts),
  ])

  const ea = enrichedList.find((x) => x.id === cmaIdA)
  const eb = enrichedList.find((x) => x.id === cmaIdB)

  const lines = [
    `Duplicate video key "${videoKey}" on two portfolio records.`,
    '',
    'Record A:',
    ...(ra.editingUrl
      ? [
          `  Admin UI #${ra.adminNumericId ?? '—'} — ${ra.editingUrl}`,
          ...formatEnrichedForDuplicateHint(ea, cmaIdA),
        ]
      : [
          ...formatEnrichedForDuplicateHint(ea, cmaIdA),
          `  Admin link: (not loaded — see below)`,
        ]),
    '',
    'Record B:',
    ...(rb.editingUrl
      ? [
          `  Admin UI #${rb.adminNumericId ?? '—'} — ${rb.editingUrl}`,
          ...formatEnrichedForDuplicateHint(eb, cmaIdB),
        ]
      : [
          ...formatEnrichedForDuplicateHint(eb, cmaIdB),
          `  Admin link: (not loaded — see below)`,
        ]),
    '',
    'Deduplicate in Dato: delete one record or change the video on one of them.',
  ]

  const gqlProblems = [...ra.graphqlErrors, ...rb.graphqlErrors]
  const uniqGql = [...new Set(gqlProblems)]
  if (ra.portfolioWasNull || rb.portfolioWasNull) {
    uniqGql.push(
      'GraphQL returned no portfolio for this id (check X-Environment matches the environment you use in CMA, or use primary env).'
    )
  }

  if (!ra.editingUrl && !rb.editingUrl) {
    lines.push(
      '',
      'Why no admin links: GraphQL `_editingUrl` needs a token with Content Delivery API (CDA) access.',
      'Fix: Dato → Settings → API tokens → enable “Content Delivery API” on your token,',
      'or add a read-only token and set DATOCMS_GRAPHQL_TOKEN (or DATOCMS_CDA_TOKEN) in .env.',
      'Import uses CMA; GraphQL is separate — CMA-only tokens often cannot read graphql.datocms.com.'
    )
    if (uniqGql.length) {
      lines.push('', 'GraphQL diagnostics:', ...uniqGql.map((m) => `  • ${m}`))
    }
  }

  return new Error(lines.join('\n'))
}

async function main() {
  const {
    csvPath,
    dryRun,
    updateOnly,
    noFuzzy,
    verifySkipped,
    skippedReportPath,
  } = parseArgs(process.argv)
  if (!csvPath) {
    console.error(
      'Usage: pnpm import:portfolio -- <path-to.csv> [--dry-run] [--update-only] [--no-fuzzy] [--verify-skipped] [--skipped-report <file.csv>]'
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
      'Set DATOCMS_MANAGEMENT_API_TOKEN (or DATOCMS_API_TOKEN) in .env (required for tier matching and writes)'
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

  const cmaEnv = resolveDatocmsEnvironment()
  const client = buildClient({
    apiToken: token,
    ...(cmaEnv ? { environment: cmaEnv } : {}),
  })
  const itemTypeId = dryRun ? '' : await findPortfolioItemTypeId(client)
  const taxonomyAliases = loadTaxonomyAliasesFromDisk()
  const taxonomyMaps = await buildTaxonomyMaps(client)

  /** Tier 1: videoKey → portfolio id (first wins; duplicates throw). */
  let videoKeyToId = new Map<VideoKey, string>()
  let portfolioEnriched: PortfolioEnriched[] = []
  const clientBySlug = new Map<string, string>()
  const locByCsName = new Map<string, string>()

  {
    const [portfolios, clients, locations] = await Promise.all([
      fetchAllItemsOfType(client, 'portfolio'),
      fetchAllItemsOfType(client, 'client'),
      fetchAllItemsOfType(client, 'location'),
    ])

    for (const it of clients) {
      const slug = localizedString(getItemField(it, 'slug'))
      const id = itemId(it)
      if (slug && id) {
        clientBySlug.set(slugifyAscii(slug), id)
      }
    }

    for (const it of locations) {
      const nameCs = localizedLocale(getItemField(it, 'name'), 'cs')
      const id = itemId(it)
      if (nameCs && id) {
        locByCsName.set(nameCs, id)
      }
    }

    portfolioEnriched = portfolios.map((p) =>
      enrichPortfolio(p as Record<string, unknown>)
    )

    for (const p of portfolioEnriched) {
      if (!p.videoKey) {
        continue
      }
      const prev = videoKeyToId.get(p.videoKey)
      if (prev && prev !== p.id) {
        throw await duplicateVideoKeyError(
          token,
          p.videoKey,
          prev,
          p.id,
          portfolioEnriched
        )
      }
      videoKeyToId.set(p.videoKey, p.id)
    }
  }

  const portfolioById = new Map<string, PortfolioEnriched>(
    portfolioEnriched.map((p) => [p.id, p])
  )

  let created = 0
  let updated = 0
  let skippedUpdateOnly = 0
  let errors = 0
  let dryOk = 0
  const assignedPortfolioIds = new Set<string>()
  const skippedUpdateOnlyRows: SkippedUpdateOnlyEntry[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!
    const line = i + 2
    try {
      const slugCs = row.slug_cs?.trim()
      const slugEn = row.slug_en?.trim()
      const titleCs = row.title_cs?.trim()
      const titleEn = row.title_en?.trim()
      if (!slugCs || !slugEn || !titleCs || !titleEn) {
        console.warn(`Line ${line}: skipping — missing slug_cs/slug_en/title`)
        errors++
        continue
      }

      const csvVk = parseVideoKey(row.link)
      const videoUrl =
        normalizeVideoEmbedUrl(row.link) ?? row.link.trim()

      const shortSubtitle = buildShortSubtitle(row)
      const dateStr = yearToIsoDate(row.rok ?? '')
      const description = buildLocalizedDescription(row)
      const priority = parsePriority(row.priorita ?? '')
      const onHomepage = parseHomepageFlag(row.homepage ?? '')

      let categoryIds: string[] = []
      let subcategoryIds: string[] = []
      {
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
        if (
          onHomepage &&
          !categoryIds.includes(SELECTED_WORK_CATEGORY_ID)
        ) {
          categoryIds = [...categoryIds, SELECTED_WORK_CATEGORY_ID]
        }
      }

      if (row.link?.trim() && !csvVk) {
        console.warn(
          `Line ${line}: link is not a recognized YouTube/Vimeo URL; sending raw value to Dato`
        )
      }

      const csvClientS = csvClientSlug(row)
      const clientIdForCsv = csvClientS
        ? (clientBySlug.get(csvClientS) ?? null)
        : null

      const zem = row.země?.trim()
      const locationId = zem ? (locByCsName.get(zem) ?? null) : null

      const czTags = splitTagList(row.stitky_cz)
      const enTags = splitTagList(row.stitky_en)
      const tagPairCount = Math.min(czTags.length, enTags.length)
      const tagKeys: string[] = []
      for (let t = 0; t < tagPairCount; t++) {
        const enLab = enTags[t]!
        tagKeys.push(slugifyAscii(enLab))
      }
      const tagsValue = tagKeys.join(';')

      let existingId: string | null = null
      let matchTier: 'tier1' | 'tier2' | null = null
      let matchScore: number | undefined
      let matchReason = ''

      if (csvVk) {
        const t1 = videoKeyToId.get(csvVk)
        if (t1) {
          existingId = t1
          matchTier = 'tier1'
          matchReason = `video:${csvVk}`
        }
      }

      if (
        !existingId &&
        !noFuzzy &&
        csvClientS &&
        clientIdForCsv
      ) {
        const candidates: Array<{ id: string; score: number }> = []
        const csvYear = parseInt(row.rok?.trim() ?? '', 10)
        const yearOk = Number.isFinite(csvYear)

        for (const p of portfolioEnriched) {
          if (assignedPortfolioIds.has(p.id)) {
            continue
          }
          if (!portfolioMatchesCsvClient(p, csvClientS, clientIdForCsv)) {
            continue
          }
          let score = bestTitleScore(
            titleCs,
            titleEn,
            p.titleCs,
            p.titleEn,
            p.titleFallback
          )
          if (
            yearOk &&
            p.year != null &&
            p.year === csvYear
          ) {
            score = Math.min(1, score + YEAR_BOOST)
          }
          if (score >= SIMILARITY_THRESHOLD) {
            candidates.push({ id: p.id, score })
          }
        }

        const picked = pickTier2Match(candidates)
        if (picked.kind === 'ambiguous') {
          console.warn(
            `Line ${line}: Tier2 ambiguous between ids ${picked.ids.join(', ')} scores ${picked.scores.join(', ')} — skipping row`
          )
          errors++
          continue
        }
        if (picked.kind === 'ok') {
          existingId = picked.id
          matchTier = 'tier2'
          matchScore = picked.score
          matchReason = `client+title:${picked.score.toFixed(3)}`
        }
      }

      if (existingId) {
        assignedPortfolioIds.add(existingId)
      }

      const action =
        existingId != null
          ? 'update'
          : updateOnly
            ? 'skip'
            : 'create'

      if (updateOnly && !existingId) {
        skippedUpdateOnlyRows.push({ line, row: { ...row } })
      }

      if (dryRun) {
        const prev = existingId
          ? portfolioById.get(existingId)
          : undefined
        const slugDelta =
          prev && (prev.slugCs || prev.slugEn)
            ? `cs "${prev.slugCs}"→"${slugCs}" | en "${prev.slugEn}"→"${slugEn}"`
            : existingId
              ? '(no prior slug in Dato)'
              : '—'
        const tierLabel =
          matchTier ??
          (csvVk ? 'create' : 'create-no-video-key')
        const scoreLabel =
          matchScore != null ? matchScore.toFixed(3) : '—'
        const tagPart = `${PORTFOLIO_TAGS_CMA_FIELD}=${tagsValue || '—'}`
        console.log(
          `[dry-run] line ${line} videoKey=${csvVk ?? '—'} match=${tierLabel} id=${existingId ?? '—'} reason=${matchReason || '—'} score=${scoreLabel} | slugs ${slugDelta} | priority=${priority ?? '—'} | homepage=${onHomepage ? 'yes' : '—'} | client=${clientIdForCsv ? 'yes' : '—'} loc=${locationId ? 'yes' : '—'} ${tagPart} | cat=${categoryIds.length ? 'yes' : '—'} sub=${subcategoryIds.length ? 'yes' : '—'} | action=${action}`
        )
        dryOk++
        continue
      }

      if (updateOnly && !existingId) {
        console.warn(`Skipped (update-only, no tier1/tier2 match): ${slugEn}`)
        skippedUpdateOnly++
        continue
      }

      const subtitleLocales =
        shortSubtitle.length > 0
          ? { cs: shortSubtitle, en: shortSubtitle }
          : undefined

      // CMA `items.update` only serializes `item_type` + `creator` as JSON:API relationships.
      // Link fields (client, location, category, …) are sent as *attributes* and must be
      // record id string(s), not `{ type: 'item', id }`. See INVALID_FIELD in API errors.
      // Portfolio `slug` is localized in Dato (`slug_cs` / `slug_en` from CSV).
      // `tags` is a single-line string (canonical keys, `;`-separated).
      const baseFields: Record<string, unknown> = {
        title: { cs: titleCs, en: titleEn },
        slug: { cs: slugCs, en: slugEn },
        video: videoUrl,
        ...(clientIdForCsv ? { client: clientIdForCsv } : {}),
        ...(locationId ? { location: locationId } : {}),
        [PORTFOLIO_TAGS_CMA_FIELD]: tagsValue || null,
        ...(dateStr ? { date: dateStr } : {}),
        ...(priority != null ? { priority } : {}),
        category: categoryIds,
        subcategory: subcategoryIds,
        ...(subtitleLocales ? { subtitle: subtitleLocales } : {}),
        ...(description ? { description } : {}),
        meta: { status: 'published' as const },
      }

      if (existingId) {
        await client.items.update(existingId, baseFields)
        updated++
        console.log(
          `Updated (${matchTier}): ${slugEn} ← ${matchReason}`
        )
      } else {
        await client.items.create({
          item_type: { type: 'item_type' as const, id: itemTypeId },
          ...baseFields,
        })
        created++
        console.log(`Created: ${slugEn}`)
      }

      await sleep(150)
    } catch (e) {
      errors++
      console.error(`Line ${line}:`, e instanceof Error ? e.message : e)
    }
  }

  if (skippedUpdateOnlyRows.length > 0) {
    printAndReportSkipped(
      skippedUpdateOnlyRows,
      videoKeyToId,
      portfolioEnriched,
      verifySkipped,
      skippedReportPath
    )
  }

  if (dryRun) {
    const mode = updateOnly ? ' [update-only]' : ''
    const fz = noFuzzy ? ' [no-fuzzy]' : ''
    console.log(
      `Dry run${mode}${fz}: ${dryOk} rows OK, ${errors} skipped/errors`
    )
  } else {
    const skipPart =
      updateOnly && skippedUpdateOnly > 0
        ? `, ${skippedUpdateOnly} skipped (no match)`
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
