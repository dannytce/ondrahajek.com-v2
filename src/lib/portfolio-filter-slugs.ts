/**
 * URL-safe slugs for portfolio filter query params (`loc`, `cl`).
 * Keeps human-readable labels in CMS; slugs are derived at build time.
 */

import type { PortfolioListItem } from '~/api'

/** Slugify a single string; empty input yields "x" to avoid blank URLs. */
export function slugifyFilterValue(raw: string): string {
  const s = raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
  return s.length > 0 ? s : 'x'
}

/** Map each distinct value to a unique slug (handles collisions with -2, -3, …). */
export function uniqueSlugsForValues(values: string[]): Map<string, string> {
  const sorted = [...new Set(values)].sort((a, b) => a.localeCompare(b))
  const map = new Map<string, string>()
  const used = new Set<string>()
  for (const v of sorted) {
    let base = slugifyFilterValue(v)
    let slug = base
    let n = 2
    while (used.has(slug)) {
      slug = `${base}-${n}`
      n += 1
    }
    used.add(slug)
    map.set(v, slug)
  }
  return map
}

/** Same slug rules as the category grid (for detail-page deep links). */
export function buildSlugMapsFromPortfolios(portfolios: PortfolioListItem[]): {
  locationSlugByValue: Map<string, string>
  clientSlugByValue: Map<string, string>
} {
  const locs = portfolios
    .map((p) => p.location?.trim())
    .filter((v): v is string => Boolean(v))
  const clients = portfolios
    .map((p) => p.client?.trim())
    .filter((v): v is string => Boolean(v))
  return {
    locationSlugByValue: uniqueSlugsForValues(locs),
    clientSlugByValue: uniqueSlugsForValues(clients),
  }
}
