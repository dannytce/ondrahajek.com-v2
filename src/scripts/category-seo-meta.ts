import {
  fillTemplate,
  t,
  type Locale,
  type TranslationKey,
} from '~/i18n'
import { pathnameToLocale } from '~/i18n/routes'

const SITE = 'https://ondrahajek.com'

function hasActiveFilters(): boolean {
  const p = new URLSearchParams(window.location.search)
  return Boolean(
    p.get('sub') ||
      p.get('year') ||
      p.get('loc') ||
      p.get('cl') ||
      p.get('location') ||
      p.get('client') ||
      p.get('q') ||
      p.get('tag')
  )
}

function setMetaProperty(property: string, content: string) {
  const el = document.querySelector(
    `meta[property="${property}"]`
  ) as HTMLMetaElement | null
  if (el) el.setAttribute('content', content)
}

function setMetaName(name: string, content: string) {
  const el = document.querySelector(
    `meta[name="${name}"]`
  ) as HTMLMetaElement | null
  if (el) el.setAttribute('content', content)
}

function updateHrefById(id: string, href: string) {
  const el = document.getElementById(id) as HTMLLinkElement | null
  if (el) el.href = href
}

function syncCanonicalAndAlternates() {
  const locale = document.documentElement.lang as Locale
  const pathname = window.location.pathname
  const pathEn = pathnameToLocale(pathname, 'en')
  const pathCs = pathnameToLocale(pathname, 'cs')
  const enUrl = `${SITE}${pathEn}`
  const csUrl = `${SITE}${pathCs}`
  const canonical = locale === 'cs' ? csUrl : enUrl

  updateHrefById('seo-canonical', canonical)
  updateHrefById('alternate-en', enUrl)
  updateHrefById('alternate-cs', csUrl)
  updateHrefById('alternate-x-default', enUrl)
}

function optionLabelForSlug(
  select: HTMLSelectElement | null,
  slugOrLegacy: string
): string {
  if (!slugOrLegacy) return ''
  if (!select) return slugOrLegacy
  const opt = Array.from(select.querySelectorAll('option')).find(
    (o) => o.value === slugOrLegacy
  )
  return opt?.textContent?.trim() ?? slugOrLegacy
}

function computeFilteredTitleDescription(
  locale: Locale,
  categorySlug: 'video-production' | 'drone-cinematography'
): { title: string; description: string } {
  const params = new URLSearchParams(window.location.search)
  const locSelect = document.querySelector<HTMLSelectElement>(
    '[data-filter-location]'
  )
  const clientSelect = document.querySelector<HTMLSelectElement>(
    '[data-filter-client]'
  )

  const locParam =
    params.get('loc')?.trim() ?? params.get('location')?.trim() ?? ''
  const clParam =
    params.get('cl')?.trim() ?? params.get('client')?.trim() ?? ''

  const location = locParam
    ? optionLabelForSlug(locSelect, locParam)
    : ''
  const client = clParam ? optionLabelForSlug(clientSelect, clParam) : ''
  const siteTitle = t(locale, 'meta.title')

  let titleKey: TranslationKey
  let descKey: TranslationKey

  if (categorySlug === 'video-production') {
    if (location && client) {
      titleKey = 'category.video.seoTitleLocationClient'
      descKey = 'category.video.seoDescLocationClient'
    } else if (location) {
      titleKey = 'category.video.seoTitleLocation'
      descKey = 'category.video.seoDescLocation'
    } else if (client) {
      titleKey = 'category.video.seoTitleClient'
      descKey = 'category.video.seoDescClient'
    } else {
      titleKey = 'category.video.seoTitleFiltered'
      descKey = 'category.video.seoDescFiltered'
    }
  } else {
    if (location && client) {
      titleKey = 'category.drone.seoTitleLocationClient'
      descKey = 'category.drone.seoDescLocationClient'
    } else if (location) {
      titleKey = 'category.drone.seoTitleLocation'
      descKey = 'category.drone.seoDescLocation'
    } else if (client) {
      titleKey = 'category.drone.seoTitleClient'
      descKey = 'category.drone.seoDescClient'
    } else {
      titleKey = 'category.drone.seoTitleFiltered'
      descKey = 'category.drone.seoDescFiltered'
    }
  }

  const titleTpl = t(locale, titleKey)
  const descTpl = t(locale, descKey)

  const vars: Record<string, string> = { siteTitle }
  if (location) vars.location = location
  if (client) vars.client = client

  return {
    title: fillTemplate(titleTpl, vars),
    description: fillTemplate(descTpl, vars),
  }
}

function applyCategorySeo() {
  const grid = document.querySelector<HTMLElement>(
    '[data-portfolio-grid][data-category-slug]'
  )
  if (!grid) return

  const categorySlug = grid.dataset.categorySlug as
    | 'video-production'
    | 'drone-cinematography'
  const locale = grid.dataset.locale as Locale
  const defaultTitle = grid.dataset.defaultSeoTitle ?? ''
  const defaultDesc = grid.dataset.defaultSeoDescription ?? ''

  if (!hasActiveFilters()) {
    document.title = defaultTitle
    setMetaName('description', defaultDesc)
    setMetaProperty('og:title', defaultTitle)
    setMetaProperty('og:description', defaultDesc)
    syncCanonicalAndAlternates()
    return
  }

  const computed = computeFilteredTitleDescription(locale, categorySlug)

  document.title = computed.title
  setMetaName('description', computed.description)
  setMetaProperty('og:title', computed.title)
  setMetaProperty('og:description', computed.description)
  syncCanonicalAndAlternates()
}

function initCategorySeoMeta() {
  applyCategorySeo()
}

document.addEventListener('portfoliofilterschange', applyCategorySeo)
document.addEventListener('astro:page-load', initCategorySeoMeta)
if (document.readyState !== 'loading') {
  initCategorySeoMeta()
} else {
  document.addEventListener('DOMContentLoaded', initCategorySeoMeta, {
    once: true,
  })
}
