import type { PortfolioListItem } from '~/api'
import { buildSlugMapsFromPortfolios } from '~/lib/portfolio-filter-slugs'

export interface FilterOption {
  value: string
  label: string
}

export interface PortfolioFilterOptions {
  subcategories: FilterOption[]
  years: FilterOption[]
  locations: FilterOption[]
  clients: FilterOption[]
  locationSlugByValue: Map<string, string>
  clientSlugByValue: Map<string, string>
}

export function buildFilterOptions(
  portfolios: PortfolioListItem[]
): PortfolioFilterOptions {
  const subcategoryMap = new Map<string, string>()
  for (const portfolio of portfolios) {
    for (const subcategory of portfolio.subcategory) {
      const slug = subcategory.slug?.trim()
      const label = subcategory.name?.trim()
      if (slug && label) {
        subcategoryMap.set(slug, label)
      }
    }
  }

  const subcategories: FilterOption[] = Array.from(
    subcategoryMap,
    ([value, label]) => ({
      value,
      label,
    })
  ).sort((a, b) => a.label.localeCompare(b.label))

  const yearSet = new Set<string>()
  for (const portfolio of portfolios) {
    if (!portfolio.date) continue

    const year = new Date(portfolio.date).getFullYear().toString()
    if (year !== 'NaN') {
      yearSet.add(year)
    }
  }

  const years: FilterOption[] = Array.from(yearSet)
    .sort((a, b) => Number(b) - Number(a))
    .map((value) => ({ value, label: value }))

  const { locationSlugByValue, clientSlugByValue } =
    buildSlugMapsFromPortfolios(portfolios)

  const locations: FilterOption[] = [...locationSlugByValue.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, value]) => ({ value, label }))

  const clients: FilterOption[] = [...clientSlugByValue.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, value]) => ({ value, label }))

  return {
    subcategories,
    years,
    locations,
    clients,
    locationSlugByValue,
    clientSlugByValue,
  }
}
