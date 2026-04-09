/**
 * Portfolio grid filters. Subcategory `?sub=` uses Dato **slug** for the active locale
 * (not record IDs); old bookmarked URLs with numeric/sub-id tokens will no longer apply.
 */
function normalize(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase()
}

function getResultLabel(
  locale: string,
  count: number,
  labels: { one: string; few: string; other: string }
): string {
  const category = new Intl.PluralRules(locale).select(count)
  if (category === 'one') return labels.one
  if (category === 'few') return labels.few
  return labels.other
}

/** Match legacy bookmark URLs where option value was the raw label, not a slug. */
function setSelectFromUrlParam(
  select: HTMLSelectElement | null | undefined,
  rawParam: string
): void {
  if (!select || !rawParam) return
  const decoded = decodeURIComponent(rawParam.replace(/\+/g, ' '))
  if (Array.from(select.options).some((o) => o.value === decoded)) {
    select.value = decoded
    return
  }
  for (const o of select.options) {
    if (o.textContent?.trim() === decoded) {
      select.value = o.value
      return
    }
  }
}

/** Year / location / client / search in URL — open advanced filter panel */
function hasUrlAdvancedFilterParams(): boolean {
  const p = new URLSearchParams(window.location.search)
  return Boolean(
    p.get('year') ||
    p.get('loc') ||
    p.get('location') ||
    p.get('cl') ||
    p.get('client') ||
    p.get('q') ||
    p.get('tag')
  )
}

function applyFiltersPanelOpen(
  panel: HTMLElement,
  open: boolean,
  toggle: HTMLButtonElement | null
): void {
  panel.classList.toggle('hidden', !open)
  toggle?.setAttribute('aria-expanded', open ? 'true' : 'false')
}

function syncUrlFromState(pathname: string, params: URLSearchParams) {
  const qs = params.toString()
  const next = qs ? `${pathname}?${qs}` : pathname
  const current = window.location.pathname + window.location.search
  if (next !== current) {
    history.replaceState(null, '', next)
  }
}

interface FilterState {
  sub: string
  year: string
  locSlug: string
  clientSlug: string
  q: string
  /** Canonical tag key from `portfolio.tags` (see `data-tag-keys`). */
  tag: string
}

function countActiveFilters(st: FilterState): number {
  let n = 0
  if (st.sub) n += 1
  if (st.year) n += 1
  if (st.locSlug) n += 1
  if (st.clientSlug) n += 1
  if (st.q) n += 1
  if (st.tag) n += 1
  return n
}

function readStateFromControls(
  subcategoryButtons: HTMLButtonElement[],
  categorySelect: HTMLSelectElement | null | undefined,
  yearSelect: HTMLSelectElement | null | undefined,
  locationSelect: HTMLSelectElement | null | undefined,
  clientSelect: HTMLSelectElement | null | undefined,
  searchInput: HTMLInputElement | null | undefined,
  grid: HTMLElement
): FilterState {
  const activeSubcategory =
    categorySelect?.value ||
    (subcategoryButtons.find((button) => button.dataset.active === 'true')
      ?.dataset.filterSubcategory ??
      '')
  return {
    sub: activeSubcategory,
    year: yearSelect?.value ?? '',
    locSlug: locationSelect?.value ?? '',
    clientSlug: clientSelect?.value ?? '',
    q: normalize(searchInput?.value),
    tag: (grid.dataset.filterTag ?? '').trim(),
  }
}

function itemMatchesExcept(
  item: HTMLElement,
  st: FilterState,
  except?: 'sub' | 'year' | 'loc' | 'client' | 'q' | 'tag'
): boolean {
  const subcategories =
    item.dataset.subcategories?.split(',').filter(Boolean) ?? []
  const year = item.dataset.year ?? ''
  const locSlug = item.dataset.locationSlug ?? ''
  const clientSlug = item.dataset.clientSlug ?? ''
  const haystack = item.dataset.search ?? ''
  const tagKeys = item.dataset.tagKeys?.split(',').filter(Boolean) ?? []

  if (except !== 'sub' && st.sub && !subcategories.includes(st.sub)) {
    return false
  }
  if (except !== 'year' && st.year && year !== st.year) return false
  if (except !== 'loc' && st.locSlug && locSlug !== st.locSlug) return false
  if (except !== 'client' && st.clientSlug && clientSlug !== st.clientSlug) {
    return false
  }
  if (except !== 'q' && st.q && !haystack.includes(st.q)) return false
  if (except !== 'tag' && st.tag && !tagKeys.includes(st.tag)) return false
  return true
}

function itemMatchesAll(item: HTMLElement, st: FilterState): boolean {
  return itemMatchesExcept(item, st)
}

function shouldShowSubcategoryButton(
  items: HTMLElement[],
  st: FilterState,
  subSlug: string
): boolean {
  for (const item of items) {
    const subs = item.dataset.subcategories?.split(',').filter(Boolean) ?? []
    if (!subs.includes(subSlug)) continue
    if (itemMatchesExcept(item, st, 'sub')) return true
  }
  return false
}

function collectAvailableYears(
  items: HTMLElement[],
  st: FilterState
): string[] {
  const s = new Set<string>()
  for (const item of items) {
    if (!itemMatchesExcept(item, st, 'year')) continue
    const y = item.dataset.year
    if (y) s.add(y)
  }
  return Array.from(s).sort((a, b) => Number(b) - Number(a))
}

function collectAvailableLocationOptions(
  items: HTMLElement[],
  st: FilterState
): { slug: string; label: string }[] {
  const map = new Map<string, string>()
  for (const item of items) {
    if (!itemMatchesExcept(item, st, 'loc')) continue
    const slug = item.dataset.locationSlug?.trim()
    const label = item.dataset.location?.trim()
    if (slug && label && !map.has(slug)) map.set(slug, label)
  }
  return [...map.entries()]
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([slug, label]) => ({ slug, label }))
}

function collectAvailableClientOptions(
  items: HTMLElement[],
  st: FilterState
): { slug: string; label: string }[] {
  const map = new Map<string, string>()
  for (const item of items) {
    if (!itemMatchesExcept(item, st, 'client')) continue
    const slug = item.dataset.clientSlug?.trim()
    const label = item.dataset.client?.trim()
    if (slug && label && !map.has(slug)) map.set(slug, label)
  }
  return [...map.entries()]
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([slug, label]) => ({ slug, label }))
}

function rebuildYearSelect(
  yearSelect: HTMLSelectElement | null | undefined,
  items: HTMLElement[],
  st: FilterState,
  yearLabel: string
): void {
  if (!yearSelect) return
  const current = yearSelect.value
  const years = collectAvailableYears(items, st)
  const emptyOpt = document.createElement('option')
  emptyOpt.value = ''
  emptyOpt.textContent = yearLabel
  yearSelect.replaceChildren(emptyOpt)
  for (const y of years) {
    const o = document.createElement('option')
    o.value = y
    o.textContent = y
    yearSelect.appendChild(o)
  }
  if (current && years.includes(current)) yearSelect.value = current
  else yearSelect.value = ''
}

function rebuildLocationSelect(
  locationSelect: HTMLSelectElement | null | undefined,
  items: HTMLElement[],
  st: FilterState,
  emptyLabel: string
): void {
  if (!locationSelect) return
  const current = locationSelect.value
  const opts = collectAvailableLocationOptions(items, st)
  const emptyOpt = document.createElement('option')
  emptyOpt.value = ''
  emptyOpt.textContent = emptyLabel
  locationSelect.replaceChildren(emptyOpt)
  for (const { slug, label } of opts) {
    const o = document.createElement('option')
    o.value = slug
    o.textContent = label
    locationSelect.appendChild(o)
  }
  if (current && opts.some((o) => o.slug === current)) {
    locationSelect.value = current
  } else {
    locationSelect.value = ''
  }
}

function rebuildClientSelect(
  clientSelect: HTMLSelectElement | null | undefined,
  items: HTMLElement[],
  st: FilterState,
  emptyLabel: string
): void {
  if (!clientSelect) return
  const current = clientSelect.value
  const opts = collectAvailableClientOptions(items, st)
  const emptyOpt = document.createElement('option')
  emptyOpt.value = ''
  emptyOpt.textContent = emptyLabel
  clientSelect.replaceChildren(emptyOpt)
  for (const { slug, label } of opts) {
    const o = document.createElement('option')
    o.value = slug
    o.textContent = label
    clientSelect.appendChild(o)
  }
  if (current && opts.some((o) => o.slug === current)) {
    clientSelect.value = current
  } else {
    clientSelect.value = ''
  }
}

/** Keeps apply + URL reader for popstate sync */
const gridFilterActions = new WeakMap<
  HTMLElement,
  { readUrl: () => void; apply: () => void }
>()

function tagParamAllowed(raw: string): string {
  const v = raw.trim()
  if (!v) return ''
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(v)) return ''
  return v
}

/** Drop `tag` if no grid item carries that canonical key. */
function tagMatchesGrid(grid: HTMLElement, tag: string): string {
  if (!tag) return ''
  const items = grid.querySelectorAll<HTMLElement>('[data-portfolio-item]')
  for (const item of items) {
    const keys = item.dataset.tagKeys?.split(',').filter(Boolean) ?? []
    if (keys.includes(tag)) return tag
  }
  return ''
}

function readUrlIntoGrid(grid: HTMLElement) {
  const subcategoryButtons = Array.from(
    grid.querySelectorAll<HTMLButtonElement>('[data-filter-subcategory]')
  )
  const categorySelect = grid.querySelector<HTMLSelectElement>(
    '[data-filter-category]'
  )
  const yearSelect = grid.querySelector<HTMLSelectElement>('[data-filter-year]')
  const locationSelect = grid.querySelector<HTMLSelectElement>(
    '[data-filter-location]'
  )
  const clientSelect = grid.querySelector<HTMLSelectElement>(
    '[data-filter-client]'
  )
  const searchInput = grid.querySelector<HTMLInputElement>(
    '[data-filter-search]'
  )

  if (!searchInput && !categorySelect) return

  const validSubSlugs = new Set(
    subcategoryButtons
      .map((b) => b.dataset.filterSubcategory ?? '')
      .filter(Boolean)
  )

  const params = new URLSearchParams(window.location.search)
  let sub = params.get('sub') ?? ''
  if (sub && !validSubSlugs.has(sub)) sub = ''

  if (categorySelect) {
    categorySelect.value = sub
  } else {
    subcategoryButtons.forEach((button) => {
      const val = button.dataset.filterSubcategory ?? ''
      button.dataset.active = val === sub ? 'true' : 'false'
    })
  }

  const year = params.get('year') ?? ''
  if (yearSelect) yearSelect.value = year

  const locParam = params.get('loc') ?? params.get('location') ?? ''
  setSelectFromUrlParam(locationSelect, locParam)

  const clParam = params.get('cl') ?? params.get('client') ?? ''
  setSelectFromUrlParam(clientSelect, clParam)

  const q = params.get('q') ?? ''
  if (searchInput) searchInput.value = q

  const rawTag = params.get('tag') ?? ''
  grid.dataset.filterTag = tagMatchesGrid(grid, tagParamAllowed(rawTag))
}

function bindGrid(grid: HTMLElement) {
  const subcategoryButtons = Array.from(
    grid.querySelectorAll<HTMLButtonElement>('[data-filter-subcategory]')
  )
  const categorySelect = grid.querySelector<HTMLSelectElement>(
    '[data-filter-category]'
  )
  const yearSelect = grid.querySelector<HTMLSelectElement>('[data-filter-year]')
  const locationSelect = grid.querySelector<HTMLSelectElement>(
    '[data-filter-location]'
  )
  const clientSelect = grid.querySelector<HTMLSelectElement>(
    '[data-filter-client]'
  )
  const searchInput = grid.querySelector<HTMLInputElement>(
    '[data-filter-search]'
  )
  const clearButton = grid.querySelector<HTMLButtonElement>(
    '[data-filter-clear]'
  )
  const resultCount = grid.querySelector<HTMLElement>(
    '[data-filter-result-count]'
  )
  const resultLabel = grid.querySelector<HTMLElement>('[data-filter-result-label]')
  const noResults = grid.querySelector<HTMLElement>('[data-filter-empty]')
  const items = Array.from(
    grid.querySelectorAll<HTMLElement>('[data-portfolio-item]')
  )
  const filterPanel = grid.querySelector<HTMLElement>('[data-filter-panel]')
  const filterToggle = grid.querySelector<HTMLButtonElement>(
    '[data-filter-toggle]'
  )
  const activeBadge = grid.querySelector<HTMLElement>(
    '[data-filter-active-badge]'
  )

  if (!resultCount) return

  const pathname = window.location.pathname

  /** Advanced filters panel (year/location/client/search); synced from URL on readUrl */
  let filtersPanelOpen = false

  const syncFiltersPanelFromUrl = () => {
    if (!filterPanel || !filterToggle) return
    filtersPanelOpen = hasUrlAdvancedFilterParams()
    applyFiltersPanelOpen(filterPanel, filtersPanelOpen, filterToggle)
  }

  const yearPlaceholder =
    yearSelect?.querySelector('option[value=""]')?.textContent ?? 'Year'
  const locPlaceholder =
    locationSelect?.querySelector('option[value=""]')?.textContent ?? ''
  const clientPlaceholder =
    clientSelect?.querySelector('option[value=""]')?.textContent ?? ''

  const applyFilters = () => {
    let st = readStateFromControls(
      subcategoryButtons,
      categorySelect,
      yearSelect,
      locationSelect,
      clientSelect,
      searchInput,
      grid
    )

    for (let pass = 0; pass < 4; pass++) {
      rebuildYearSelect(yearSelect, items, st, yearPlaceholder)
      rebuildLocationSelect(locationSelect, items, st, locPlaceholder)
      rebuildClientSelect(clientSelect, items, st, clientPlaceholder)
      st = readStateFromControls(
        subcategoryButtons,
        categorySelect,
        yearSelect,
        locationSelect,
        clientSelect,
        searchInput,
        grid
      )
    }

    if (!categorySelect) {
      for (const button of subcategoryButtons) {
        const subSlug = button.dataset.filterSubcategory ?? ''
        if (subSlug === '') {
          button.hidden = false
          continue
        }
        button.hidden = !shouldShowSubcategoryButton(items, st, subSlug)
      }
    }

    const activeBtn = subcategoryButtons.find(
      (b) => b.dataset.active === 'true'
    )
    if (!categorySelect && activeBtn?.hidden) {
      const resetBtn = subcategoryButtons.find(
        (b) => (b.dataset.filterSubcategory ?? '') === ''
      )
      subcategoryButtons.forEach((b) => {
        b.dataset.active = 'false'
      })
      if (resetBtn) resetBtn.dataset.active = 'true'
      st = readStateFromControls(
        subcategoryButtons,
        categorySelect,
        yearSelect,
        locationSelect,
        clientSelect,
        searchInput,
        grid
      )
      rebuildYearSelect(yearSelect, items, st, yearPlaceholder)
      rebuildLocationSelect(locationSelect, items, st, locPlaceholder)
      rebuildClientSelect(clientSelect, items, st, clientPlaceholder)
      st = readStateFromControls(
        subcategoryButtons,
        categorySelect,
        yearSelect,
        locationSelect,
        clientSelect,
        searchInput,
        grid
      )
      for (const button of subcategoryButtons) {
        const subSlug = button.dataset.filterSubcategory ?? ''
        if (subSlug === '') {
          button.hidden = false
          continue
        }
        button.hidden = !shouldShowSubcategoryButton(items, st, subSlug)
      }
    }

    let visibleCount = 0

    if (!categorySelect) {
      subcategoryButtons.forEach((button) => {
        const val = button.dataset.filterSubcategory ?? ''
        button.dataset.active = val === st.sub ? 'true' : 'false'
      })
    }

    items.forEach((item) => {
      const visible = itemMatchesAll(item, st)
      item.hidden = !visible
      if (visible) visibleCount += 1
    })

    resultCount.textContent = String(visibleCount)
    if (resultLabel) {
      const locale = resultCount.dataset.locale ?? grid.dataset.locale ?? 'en'
      const labels = {
        one: resultCount.dataset.labelOne ?? 'project',
        few: resultCount.dataset.labelFew ?? resultCount.dataset.labelOther ?? 'projects',
        other: resultCount.dataset.labelOther ?? 'projects',
      }
      resultLabel.textContent = getResultLabel(locale, visibleCount, labels)
    }
    const activeCount = countActiveFilters(st)
    const hasActiveFilters = activeCount > 0
    if (clearButton) {
      clearButton.hidden = !hasActiveFilters
    }
    if (activeBadge) {
      activeBadge.hidden = !hasActiveFilters
      activeBadge.textContent = String(activeCount)
    }
    if (noResults) {
      noResults.hidden = visibleCount !== 0
    }

    const params = new URLSearchParams()
    if (st.sub) params.set('sub', st.sub)
    if (st.year) params.set('year', st.year)
    if (st.locSlug) params.set('loc', st.locSlug)
    if (st.clientSlug) params.set('cl', st.clientSlug)
    if (searchInput?.value.trim()) params.set('q', searchInput.value.trim())
    if (st.tag) params.set('tag', st.tag)

    syncUrlFromState(pathname, params)
    window.dispatchEvent(
      new CustomEvent('portfoliofilterschange', { bubbles: true })
    )
  }

  const readUrl = () => {
    readUrlIntoGrid(grid)
    syncFiltersPanelFromUrl()
  }

  gridFilterActions.set(grid, { readUrl, apply: applyFilters })

  readUrl()

  filterToggle?.addEventListener('click', () => {
    if (!filterPanel) return
    filtersPanelOpen = !filtersPanelOpen
    applyFiltersPanelOpen(filterPanel, filtersPanelOpen, filterToggle)
  })

  if (!categorySelect) {
    subcategoryButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const nextValue = button.dataset.filterSubcategory ?? ''
        const isActive = button.dataset.active === 'true'

        subcategoryButtons.forEach((candidate) => {
          candidate.dataset.active = 'false'
        })

        const resetButton = subcategoryButtons.find(
          (candidate) => (candidate.dataset.filterSubcategory ?? '') === ''
        )

        if (isActive || nextValue === '') {
          if (resetButton) resetButton.dataset.active = 'true'
        } else {
          button.dataset.active = 'true'
        }

        applyFilters()
      })
    })
  }

  categorySelect?.addEventListener('change', applyFilters)
  yearSelect?.addEventListener('change', applyFilters)
  locationSelect?.addEventListener('change', applyFilters)
  clientSelect?.addEventListener('change', applyFilters)
  searchInput?.addEventListener('input', applyFilters)
  clearButton?.addEventListener('click', () => {
    if (categorySelect) categorySelect.value = ''
    if (yearSelect) yearSelect.value = ''
    if (locationSelect) locationSelect.value = ''
    if (clientSelect) clientSelect.value = ''
    if (searchInput) searchInput.value = ''
    grid.dataset.filterTag = ''

    if (!categorySelect) {
      subcategoryButtons.forEach((button) => {
        button.dataset.active =
          button.dataset.filterSubcategory === '' ? 'true' : 'false'
      })
    }

    applyFilters()
  })

  applyFilters()
}

function initPortfolioFilters() {
  const grids = document.querySelectorAll<HTMLElement>('[data-portfolio-grid]')

  grids.forEach((grid) => {
    if (grid.dataset.bound === 'true') return
    bindGrid(grid)
    grid.dataset.bound = 'true'
  })
}

function onPopState() {
  document
    .querySelectorAll<HTMLElement>('[data-portfolio-grid]')
    .forEach((grid) => {
      const actions = gridFilterActions.get(grid)
      if (!actions) return
      actions.readUrl()
      actions.apply()
    })
}

window.addEventListener('popstate', onPopState)

document.addEventListener('astro:page-load', initPortfolioFilters)
if (document.readyState !== 'loading') {
  initPortfolioFilters()
} else {
  document.addEventListener('DOMContentLoaded', initPortfolioFilters, {
    once: true,
  })
}
