function normalize(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase()
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
}

function readStateFromControls(
  subcategoryButtons: HTMLButtonElement[],
  yearSelect: HTMLSelectElement | null | undefined,
  locationSelect: HTMLSelectElement | null | undefined,
  clientSelect: HTMLSelectElement | null | undefined,
  searchInput: HTMLInputElement
): FilterState {
  const activeSubcategory =
    subcategoryButtons.find((button) => button.dataset.active === 'true')
      ?.dataset.filterSubcategory ?? ''
  return {
    sub: activeSubcategory,
    year: yearSelect?.value ?? '',
    locSlug: locationSelect?.value ?? '',
    clientSlug: clientSelect?.value ?? '',
    q: normalize(searchInput.value),
  }
}

function itemMatchesExcept(
  item: HTMLElement,
  st: FilterState,
  except?: 'sub' | 'year' | 'loc' | 'client' | 'q'
): boolean {
  const subcategories =
    item.dataset.subcategories?.split(',').filter(Boolean) ?? []
  const year = item.dataset.year ?? ''
  const locSlug = item.dataset.locationSlug ?? ''
  const clientSlug = item.dataset.clientSlug ?? ''
  const haystack = item.dataset.search ?? ''

  if (except !== 'sub' && st.sub && !subcategories.includes(st.sub)) {
    return false
  }
  if (except !== 'year' && st.year && year !== st.year) return false
  if (except !== 'loc' && st.locSlug && locSlug !== st.locSlug) return false
  if (except !== 'client' && st.clientSlug && clientSlug !== st.clientSlug) {
    return false
  }
  if (except !== 'q' && st.q && !haystack.includes(st.q)) return false
  return true
}

function itemMatchesAll(item: HTMLElement, st: FilterState): boolean {
  return itemMatchesExcept(item, st)
}

function shouldShowSubcategoryButton(
  items: HTMLElement[],
  st: FilterState,
  subId: string
): boolean {
  for (const item of items) {
    const subs = item.dataset.subcategories?.split(',').filter(Boolean) ?? []
    if (!subs.includes(subId)) continue
    if (itemMatchesExcept(item, st, 'sub')) return true
  }
  return false
}

function collectAvailableYears(items: HTMLElement[], st: FilterState): string[] {
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

function readUrlIntoGrid(grid: HTMLElement) {
  const subcategoryButtons = Array.from(
    grid.querySelectorAll<HTMLButtonElement>('[data-filter-subcategory]')
  )
  const yearSelect =
    grid.querySelector<HTMLSelectElement>('[data-filter-year]')
  const locationSelect = grid.querySelector<HTMLSelectElement>(
    '[data-filter-location]'
  )
  const clientSelect =
    grid.querySelector<HTMLSelectElement>('[data-filter-client]')
  const searchInput = grid.querySelector<HTMLInputElement>(
    '[data-filter-search]'
  )

  if (!searchInput) return

  const validSubIds = new Set(
    subcategoryButtons
      .map((b) => b.dataset.filterSubcategory ?? '')
      .filter(Boolean)
  )

  const params = new URLSearchParams(window.location.search)
  let sub = params.get('sub') ?? ''
  if (sub && !validSubIds.has(sub)) sub = ''

  subcategoryButtons.forEach((button) => {
    const val = button.dataset.filterSubcategory ?? ''
    button.dataset.active = val === sub ? 'true' : 'false'
  })

  const year = params.get('year') ?? ''
  if (yearSelect) yearSelect.value = year

  const locParam = params.get('loc') ?? params.get('location') ?? ''
  setSelectFromUrlParam(locationSelect, locParam)

  const clParam = params.get('cl') ?? params.get('client') ?? ''
  setSelectFromUrlParam(clientSelect, clParam)

  const q = params.get('q') ?? ''
  searchInput.value = q
}

function bindGrid(grid: HTMLElement) {
  const subcategoryButtons = Array.from(
    grid.querySelectorAll<HTMLButtonElement>('[data-filter-subcategory]')
  )
  const yearSelect =
    grid.querySelector<HTMLSelectElement>('[data-filter-year]')
  const locationSelect = grid.querySelector<HTMLSelectElement>(
    '[data-filter-location]'
  )
  const clientSelect =
    grid.querySelector<HTMLSelectElement>('[data-filter-client]')
  const searchInput = grid.querySelector<HTMLInputElement>(
    '[data-filter-search]'
  )
  const clearButton = grid.querySelector<HTMLButtonElement>(
    '[data-filter-clear]'
  )
  const resultCount = grid.querySelector<HTMLElement>(
    '[data-filter-result-count]'
  )
  const noResults = grid.querySelector<HTMLElement>('[data-filter-empty]')
  const items = Array.from(
    grid.querySelectorAll<HTMLElement>('[data-portfolio-item]')
  )

  if (!resultCount || !searchInput) return

  const pathname = window.location.pathname

  const yearPlaceholder =
    yearSelect?.querySelector('option[value=""]')?.textContent ?? 'Year'
  const locPlaceholder =
    locationSelect?.querySelector('option[value=""]')?.textContent ?? ''
  const clientPlaceholder =
    clientSelect?.querySelector('option[value=""]')?.textContent ?? ''

  const applyFilters = () => {
    let st = readStateFromControls(
      subcategoryButtons,
      yearSelect,
      locationSelect,
      clientSelect,
      searchInput
    )

    for (let pass = 0; pass < 4; pass++) {
      rebuildYearSelect(yearSelect, items, st, yearPlaceholder)
      rebuildLocationSelect(locationSelect, items, st, locPlaceholder)
      rebuildClientSelect(clientSelect, items, st, clientPlaceholder)
      st = readStateFromControls(
        subcategoryButtons,
        yearSelect,
        locationSelect,
        clientSelect,
        searchInput
      )
    }

    for (const button of subcategoryButtons) {
      const subId = button.dataset.filterSubcategory ?? ''
      if (subId === '') {
        button.hidden = false
        continue
      }
      button.hidden = !shouldShowSubcategoryButton(items, st, subId)
    }

    const activeBtn = subcategoryButtons.find((b) => b.dataset.active === 'true')
    if (activeBtn?.hidden) {
      const resetBtn = subcategoryButtons.find(
        (b) => (b.dataset.filterSubcategory ?? '') === ''
      )
      subcategoryButtons.forEach((b) => {
        b.dataset.active = 'false'
      })
      if (resetBtn) resetBtn.dataset.active = 'true'
      st = readStateFromControls(
        subcategoryButtons,
        yearSelect,
        locationSelect,
        clientSelect,
        searchInput
      )
      rebuildYearSelect(yearSelect, items, st, yearPlaceholder)
      rebuildLocationSelect(locationSelect, items, st, locPlaceholder)
      rebuildClientSelect(clientSelect, items, st, clientPlaceholder)
      st = readStateFromControls(
        subcategoryButtons,
        yearSelect,
        locationSelect,
        clientSelect,
        searchInput
      )
      for (const button of subcategoryButtons) {
        const subId = button.dataset.filterSubcategory ?? ''
        if (subId === '') {
          button.hidden = false
          continue
        }
        button.hidden = !shouldShowSubcategoryButton(items, st, subId)
      }
    }

    let visibleCount = 0

    subcategoryButtons.forEach((button) => {
      const val = button.dataset.filterSubcategory ?? ''
      button.dataset.active = val === st.sub ? 'true' : 'false'
    })

    items.forEach((item) => {
      const visible = itemMatchesAll(item, st)
      item.hidden = !visible
      if (visible) visibleCount += 1
    })

    resultCount.textContent = String(visibleCount)
    if (clearButton) {
      clearButton.hidden = !(
        st.sub ||
        st.year ||
        st.locSlug ||
        st.clientSlug ||
        st.q
      )
    }
    if (noResults) {
      noResults.hidden = visibleCount !== 0
    }

    const params = new URLSearchParams()
    if (st.sub) params.set('sub', st.sub)
    if (st.year) params.set('year', st.year)
    if (st.locSlug) params.set('loc', st.locSlug)
    if (st.clientSlug) params.set('cl', st.clientSlug)
    if (searchInput.value.trim()) params.set('q', searchInput.value.trim())

    syncUrlFromState(pathname, params)
    window.dispatchEvent(
      new CustomEvent('portfoliofilterschange', { bubbles: true })
    )
  }

  const readUrl = () => readUrlIntoGrid(grid)

  gridFilterActions.set(grid, { readUrl, apply: applyFilters })

  readUrlIntoGrid(grid)

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

  yearSelect?.addEventListener('change', applyFilters)
  locationSelect?.addEventListener('change', applyFilters)
  clientSelect?.addEventListener('change', applyFilters)
  searchInput.addEventListener('input', applyFilters)
  clearButton?.addEventListener('click', () => {
    if (yearSelect) yearSelect.value = ''
    if (locationSelect) locationSelect.value = ''
    if (clientSelect) clientSelect.value = ''
    searchInput.value = ''

    subcategoryButtons.forEach((button) => {
      button.dataset.active =
        button.dataset.filterSubcategory === '' ? 'true' : 'false'
    })

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
  document.querySelectorAll<HTMLElement>('[data-portfolio-grid]').forEach(
    (grid) => {
      const actions = gridFilterActions.get(grid)
      if (!actions) return
      actions.readUrl()
      actions.apply()
    }
  )
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
