/**
 * Build src/data/portfolio-tag-labels.json from PORTFOLIO-list.csv (same tag pairing as Phase 1 import).
 * First CZ label wins per EN dedupe key (slugifyAscii(EN)).
 *
 * Usage:
 *   pnpm generate:tag-labels -- path/to/PORTFOLIO-list.csv
 * Default CSV path: ./PORTFOLIO-list.csv when present.
 */

import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'csv-parse/sync'
import { PORTFOLIO_CSV_COLUMNS } from './portfolio-csv-columns'

const CSV_COLUMNS = PORTFOLIO_CSV_COLUMNS

type CsvRow = Record<(typeof CSV_COLUMNS)[number], string>

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

function splitTagList(raw: string): string[] {
  if (!raw?.trim()) {
    return []
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseArgs(argv: string[]) {
  const args = argv.slice(2).filter((a) => a !== '--')
  const rest = args.filter((a) => !a.startsWith('--'))
  return { csvPath: rest[0] }
}

function main() {
  const { csvPath: argPath } = parseArgs(process.argv)
  const defaultCsv = path.join(process.cwd(), 'PORTFOLIO-list.csv')
  const csvPath = argPath
    ? path.resolve(argPath)
    : fs.existsSync(defaultCsv)
      ? defaultCsv
      : ''

  if (!csvPath || !fs.existsSync(csvPath)) {
    console.error(
      'Usage: pnpm generate:tag-labels -- <path-to-PORTFOLIO-list.csv>'
    )
    process.exit(1)
  }

  const raw = fs.readFileSync(csvPath, 'utf8')
  const rows = parse(raw, {
    columns: [...CSV_COLUMNS],
    from_line: 2,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
    skip_empty_lines: true,
  }) as CsvRow[]

  const labels: Record<string, { cs: string; en: string }> = {}
  for (const row of rows) {
    const czTags = splitTagList(row.stitky_cz)
    const enTags = splitTagList(row.stitky_en)
    const n = Math.min(czTags.length, enTags.length)
    for (let i = 0; i < n; i++) {
      const cs = czTags[i]!
      const en = enTags[i]!
      const key = slugifyAscii(en)
      if (!labels[key]) {
        labels[key] = { cs, en }
      }
    }
  }

  const outPath = path.join(
    process.cwd(),
    'src/data/portfolio-tag-labels.json'
  )
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(
    outPath,
    JSON.stringify(labels, null, 2) + '\n',
    'utf8'
  )
  console.log(
    `Wrote ${Object.keys(labels).length} tag keys → ${path.relative(process.cwd(), outPath)}`
  )
}

main()
