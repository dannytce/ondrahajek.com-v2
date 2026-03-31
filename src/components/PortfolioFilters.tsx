import { t, type Locale } from '~/i18n'

interface FilterOption {
  value: string
  label: string
}

interface PortfolioFiltersProps {
  locale: Locale
  subcategories: FilterOption[]
  years: FilterOption[]
  locations: FilterOption[]
  activeSubcategory: string | null
  activeYear: string | null
  activeLocation: string | null
  searchQuery: string
  resultCount: number
  totalCount: number
  onSubcategoryChange: (value: string | null) => void
  onYearChange: (value: string | null) => void
  onLocationChange: (value: string | null) => void
  onSearchChange: (value: string) => void
  onClear: () => void
}

export function PortfolioFilters({
  locale,
  subcategories,
  years,
  locations,
  activeSubcategory,
  activeYear,
  activeLocation,
  searchQuery,
  resultCount,
  totalCount,
  onSubcategoryChange,
  onYearChange,
  onLocationChange,
  onSearchChange,
  onClear,
}: PortfolioFiltersProps) {
  const hasActiveFilter = activeSubcategory || activeYear || activeLocation || searchQuery

  return (
    <div className="mb-10 flex flex-col gap-6">
      {/* Subcategory pills */}
      {subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSubcategoryChange(null)}
            className={`px-4 py-1 font-teko text-[1.6rem] uppercase border transition-colors cursor-pointer ${
              !activeSubcategory
                ? 'bg-white text-background border-white'
                : 'bg-transparent text-secondary border-secondary/40 hover:border-white hover:text-white'
            }`}
          >
            {t(locale, 'filter.all')}
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub.value}
              onClick={() =>
                onSubcategoryChange(activeSubcategory === sub.value ? null : sub.value)
              }
              className={`px-4 py-1 font-teko text-[1.6rem] uppercase border transition-colors cursor-pointer ${
                activeSubcategory === sub.value
                  ? 'bg-white text-background border-white'
                  : 'bg-transparent text-secondary border-secondary/40 hover:border-white hover:text-white'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}

      {/* Dropdowns + search row */}
      <div className="flex flex-wrap gap-3 items-center">
        {years.length > 0 && (
          <select
            value={activeYear ?? ''}
            onChange={(e) => onYearChange(e.target.value || null)}
            className="bg-transparent border border-secondary/40 text-secondary font-teko text-[1.6rem] uppercase px-3 py-1 cursor-pointer hover:border-white hover:text-white transition-colors focus:outline-none focus:border-white"
          >
            <option value="">{t(locale, 'filter.year')}</option>
            {years.map((y) => (
              <option key={y.value} value={y.value}>
                {y.label}
              </option>
            ))}
          </select>
        )}

        {locations.length > 0 && (
          <select
            value={activeLocation ?? ''}
            onChange={(e) => onLocationChange(e.target.value || null)}
            className="bg-transparent border border-secondary/40 text-secondary font-teko text-[1.6rem] uppercase px-3 py-1 cursor-pointer hover:border-white hover:text-white transition-colors focus:outline-none focus:border-white"
          >
            <option value="">{t(locale, 'filter.location')}</option>
            {locations.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        )}

        <input
          type="text"
          placeholder={t(locale, 'filter.search')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-transparent border border-secondary/40 text-white font-roboto text-[1.4rem] px-3 py-[5px] min-w-[200px] placeholder:text-secondary/60 hover:border-white transition-colors focus:outline-none focus:border-white"
        />

        {hasActiveFilter && (
          <button
            onClick={onClear}
            className="text-secondary font-teko text-[1.4rem] uppercase hover:text-white transition-colors cursor-pointer bg-transparent border-none"
          >
            {t(locale, 'filter.clear')}
          </button>
        )}

        <span className="text-secondary/60 font-roboto text-[1.3rem] ml-auto">
          {resultCount} / {totalCount} {t(locale, 'filter.results')}
        </span>
      </div>
    </div>
  )
}
