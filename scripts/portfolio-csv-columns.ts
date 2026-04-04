/**
 * Column names for PORTFOLIO-list.csv (must match header row order).
 *
 * After `Český video titulek` there is `video na titulní stránce?` (homepage).
 * The header has `priorita…,,země natáčení` — the unnamed column between commas is **client**
 * (production company), not a spare column.
 */

export const PORTFOLIO_CSV_COLUMNS = [
  'link',
  'title_cs',
  'homepage',
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

export type PortfolioCsvColumn = (typeof PORTFOLIO_CSV_COLUMNS)[number]
