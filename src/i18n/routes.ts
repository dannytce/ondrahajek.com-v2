import {
  getAlternateLocale,
  localePath,
  type Locale,
} from './index'

/** Logical site pages with per-locale URL segments */
export type SitePageKey = 'drone' | 'video' | 'gallery' | 'about'

const PORTFOLIO: Record<Locale, string> = {
  en: 'portfolio',
  cs: 'projekty',
}

const LOCATIONS: Record<Locale, string> = {
  en: 'locations',
  cs: 'lokace',
}

const SITE_PAGE: Record<Locale, Record<SitePageKey, string>> = {
  en: {
    drone: 'drone-cinematography',
    video: 'video-production',
    gallery: 'gallery',
    about: 'about',
  },
  cs: {
    drone: 'letecka-kinematografie',
    video: 'video-produkce',
    gallery: 'galerie',
    about: 'o-mne',
  },
}

export function portfolioSegment(locale: Locale): string {
  return PORTFOLIO[locale]
}

export function locationsSegment(locale: Locale): string {
  return LOCATIONS[locale]
}

/** Path without locale prefix, e.g. `/portfolio/my-slug` or `/letecka-kinematografie` */
export function localizedPagePath(locale: Locale, key: SitePageKey): string {
  return `/${SITE_PAGE[locale][key]}`
}

export function portfolioCanonicalPath(locale: Locale, slug: string): string {
  return `/${portfolioSegment(locale)}/${slug}`
}

export function locationHubCanonicalPath(locale: Locale, locationSlug: string): string {
  return `/${locationsSegment(locale)}/${locationSlug}`
}

export function hreflangPairForPortfolio(slug: string): { en: string; cs: string } {
  return {
    en: portfolioCanonicalPath('en', slug),
    cs: portfolioCanonicalPath('cs', slug),
  }
}

export function hreflangPairForSitePage(key: SitePageKey): { en: string; cs: string } {
  return {
    en: localizedPagePath('en', key),
    cs: localizedPagePath('cs', key),
  }
}

export function hreflangPairForLocationHub(locationSlug: string): {
  en: string
  cs: string
} {
  return {
    en: locationHubCanonicalPath('en', locationSlug),
    cs: locationHubCanonicalPath('cs', locationSlug),
  }
}

/** Resolve URL segment to a logical key for the given locale */
export function sitePageKeyFromSegment(
  locale: Locale,
  segment: string
): SitePageKey | null {
  const map = SITE_PAGE[locale]
  for (const key of Object.keys(map) as SitePageKey[]) {
    if (map[key] === segment) return key
  }
  return null
}

/** Convert current pathname (no query) to the equivalent path in another locale */
export function pathnameToLocale(pathname: string, targetLocale: Locale): string {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return `/${targetLocale}`

  const sourceLocale = parts[0]
  if (sourceLocale !== 'en' && sourceLocale !== 'cs') {
    return `/${targetLocale}${pathname.startsWith('/') ? pathname : `/${pathname}`}`
  }

  const rest = parts.slice(1)

  if (rest.length === 0) return `/${targetLocale}`

  if (rest[0] === PORTFOLIO.en || rest[0] === PORTFOLIO.cs) {
    if (rest.length >= 2) {
      const slug = rest[1]
      return `/${targetLocale}/${portfolioSegment(targetLocale as Locale)}/${slug}`
    }
  }

  if (rest[0] === LOCATIONS.en || rest[0] === LOCATIONS.cs) {
    if (rest.length >= 2) {
      const locSlug = rest[1]
      return `/${targetLocale}/${locationsSegment(targetLocale as Locale)}/${locSlug}`
    }
  }

  if (rest.length === 1) {
    const key = sitePageKeyFromSegment(sourceLocale as Locale, rest[0])
    if (key) {
      return `/${targetLocale}${localizedPagePath(targetLocale, key)}`
    }
  }

  return `/${targetLocale}/${rest.join('/')}`
}

export function languageSwitchHref(locale: Locale, key: SitePageKey): string {
  const alt = getAlternateLocale(locale)
  return localePath(alt, localizedPagePath(alt, key))
}

export function languageSwitchHrefForPortfolio(locale: Locale, slug: string): string {
  const alt = getAlternateLocale(locale)
  return localePath(alt, portfolioCanonicalPath(alt, slug))
}

export function languageSwitchHrefForLocation(
  locale: Locale,
  locationSlug: string
): string {
  const alt = getAlternateLocale(locale)
  return localePath(alt, locationHubCanonicalPath(alt, locationSlug))
}
