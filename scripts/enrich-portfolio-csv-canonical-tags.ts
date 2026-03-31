/**
 * Reads portfolio CSV (same columns as import-portfolio), appends canonical_tags column.
 * Run: pnpm exec tsx scripts/enrich-portfolio-csv-canonical-tags.ts [path/to.csv]
 */

import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'csv-parse/sync'
import { stitkyToCanonicalTags } from './portfolio-tag-canonical'

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
  'canonical_tags',
] as const

function escapeCsvField(s: string): string {
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function main() {
  const csvPath = path.resolve(process.argv[2] ?? 'PORTFOLIO.FINAL.csv')
  if (!fs.existsSync(csvPath)) {
    console.error(`File not found: ${csvPath}`)
    process.exit(1)
  }

  const raw = fs.readFileSync(csvPath, 'utf8')
  const rows = parse(raw, {
    columns: [...COLUMN_NAMES],
    from_line: 2,
    relax_quotes: true,
    trim: true,
    skip_empty_lines: true,
  }) as Record<(typeof COLUMN_NAMES)[number], string>[]

  const header =
    'ODKAZ,Titulek videa,,,Slug,Rok,Kategorie 1,Kategorie 2,Klient,Lokace,Štítky,canonical_tags'

  const lines: string[] = [header]
  for (const row of rows) {
    const canonical = stitkyToCanonicalTags(row.stitky ?? '')
    const fields = [
      row.odkaz,
      row.titulek,
      row.popis_cs,
      row.popis_en,
      row.slug,
      row.rok,
      row.kategorie1,
      row.kategorie2,
      row.klient,
      row.lokace,
      row.stitky,
      canonical,
    ].map((f) => escapeCsvField(f ?? ''))
    lines.push(fields.join(','))
  }

  fs.writeFileSync(csvPath, lines.join('\n') + '\n', 'utf8')
  console.log(`Wrote ${rows.length} rows to ${csvPath}`)
}

main()
