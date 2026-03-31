import { useState, useMemo } from 'react'
import { PortfolioCard } from '~/components/PortfolioCard'
import { PortfolioFilters } from '~/components/PortfolioFilters'
import { t, type Locale } from '~/i18n'
import type { PortfolioListItem } from '~/api'

interface CategoryPortfolioGridProps {
  portfolios: PortfolioListItem[]
  locale: Locale
}

export function CategoryPortfolioGrid({ portfolios, locale }: CategoryPortfolioGridProps) {
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null)
  const [activeYear, setActiveYear] = useState<string | null>(null)
  const [activeLocation, setActiveLocation] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Derive filter options from the data
  const subcategories = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of portfolios) {
      for (const sub of p.subcategory) {
        if (sub.name) map.set(sub.id, sub.name)
      }
    }
    return Array.from(map, ([value, label]) => ({ value, label })).sort((a, b) =>
      a.label.localeCompare(b.label)
    )
  }, [portfolios])

  const years = useMemo(() => {
    const set = new Set<string>()
    for (const p of portfolios) {
      if (p.date) {
        const y = new Date(p.date).getFullYear().toString()
        if (y !== 'NaN') set.add(y)
      }
    }
    return Array.from(set)
      .sort((a, b) => Number(b) - Number(a))
      .map((y) => ({ value: y, label: y }))
  }, [portfolios])

  const locations = useMemo(() => {
    const set = new Set<string>()
    for (const p of portfolios) {
      if (p.location?.trim()) set.add(p.location.trim())
    }
    return Array.from(set)
      .sort()
      .map((l) => ({ value: l, label: l }))
  }, [portfolios])

  // Apply filters
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return portfolios.filter((p) => {
      if (activeSubcategory && !p.subcategory.some((s) => s.id === activeSubcategory)) return false
      if (activeYear && (!p.date || new Date(p.date).getFullYear().toString() !== activeYear))
        return false
      if (activeLocation && p.location?.trim() !== activeLocation) return false
      if (q) {
        const haystack = [p.title, p.subtitle, p.subtitleCs, p.subtitleEn, p.tags, p.client, p.location]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [portfolios, activeSubcategory, activeYear, activeLocation, searchQuery])

  const clearAll = () => {
    setActiveSubcategory(null)
    setActiveYear(null)
    setActiveLocation(null)
    setSearchQuery('')
  }

  return (
    <div className="w-full max-w-container mx-auto px-[15px] xl:px-0">
      <PortfolioFilters
        locale={locale}
        subcategories={subcategories}
        years={years}
        locations={locations}
        activeSubcategory={activeSubcategory}
        activeYear={activeYear}
        activeLocation={activeLocation}
        searchQuery={searchQuery}
        resultCount={filtered.length}
        totalCount={portfolios.length}
        onSubcategoryChange={setActiveSubcategory}
        onYearChange={setActiveYear}
        onLocationChange={setActiveLocation}
        onSearchChange={setSearchQuery}
        onClear={clearAll}
      />

      {filtered.length === 0 ? (
        <p className="text-secondary text-[1.8rem] font-roboto text-center py-20">
          {t(locale, 'filter.noResults')}
        </p>
      ) : (
        <ul className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 w-full">
          {filtered.map((portfolio, index) => (
            <li key={portfolio.slug ?? `portfolio-${index}`}>
              <PortfolioCard portfolio={portfolio} locale={locale} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
