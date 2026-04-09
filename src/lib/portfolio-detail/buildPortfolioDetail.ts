import type { PortfolioDetail, PortfolioListItem } from '~/api'
import {
  t,
  localePath,
  getCategorySlug,
  getAlternateLocale,
  fillTemplate,
  CATEGORY_IDS,
  type Locale,
} from '~/i18n'
import {
  portfolioCanonicalPath,
  hreflangPairForPortfolio,
  languageSwitchHrefForPortfolio,
  localizedPagePath,
  type SitePageKey,
} from '~/i18n/routes'
import { buildSlugMapsFromPortfolios } from '~/lib/portfolio-filter-slugs'
import {
  resolveTagDisplayForLocale,
  splitPortfolioTags,
} from '~/lib/portfolio-tags'

const SITE_URL = 'https://ondrahajek.com'

function categoryToPageKey(
  categorySlug: ReturnType<typeof getCategorySlug>
): SitePageKey | null {
  if (categorySlug === 'drone-cinematography') return 'drone'
  if (categorySlug === 'video-production') return 'video'
  return null
}

export interface TagLinkPair {
  key: string
  label: string
}

/** Derived data for portfolio detail page (SEO, JSON-LD, nav, related links). */
export interface PortfolioDetailModel {
  tagLinkPairs: TagLinkPair[]
  pageKey: SitePageKey | null
  backPath: string
  backLinkText: string
  moreForClientHref: string | undefined
  moreInLocationHref: string | undefined
  moreForClientLabel: string | undefined
  moreInLocationLabel: string | undefined
  subtitle: string | null | undefined
  mediaTransitionName: string | undefined
  switchUrl: string
  year: number | null
  hasDetailMeta: boolean
  titleSeo: string
  descSeo: string
  jsonLd: Record<string, unknown> | undefined
  hrefPair: { en: string; cs: string } | undefined
  locationLabel: string
  locationH2: string | undefined
}

export async function buildPortfolioDetailModel(
  portfolio: PortfolioDetail,
  locale: Locale,
  getPortfoliosByCategory: (
    categoryId: string,
    locale: Locale
  ) => Promise<PortfolioListItem[]>
): Promise<PortfolioDetailModel> {
  const tagKeys = splitPortfolioTags(portfolio.tags)
  const tagLabels = resolveTagDisplayForLocale(tagKeys, locale)
  const tagLinkPairs: TagLinkPair[] = tagKeys.map((key, i) => ({
    key,
    label: tagLabels[i] ?? key,
  }))

  const primaryCategoryId = portfolio.category?.[0]?.id
  const categorySlug = primaryCategoryId
    ? getCategorySlug(primaryCategoryId)
    : null

  const pageKey = categorySlug ? categoryToPageKey(categorySlug) : null
  const backPath =
    pageKey != null ? localizedPagePath(locale, pageKey) : '/'
  const backLabel =
    categorySlug === 'drone-cinematography'
      ? t(locale, 'nav.drone')
      : categorySlug === 'video-production'
        ? t(locale, 'nav.video')
        : 'Portfolio'
  const backLinkText = `${t(locale, 'detail.backTo')} ${backLabel}`

  const categoryForLink =
    categorySlug && categorySlug !== 'selected-work' ? categorySlug : null

  let moreForClientHref: string | undefined
  let moreInLocationHref: string | undefined

  if (
    categoryForLink &&
    pageKey != null &&
    (categoryForLink === 'video-production' ||
      categoryForLink === 'drone-cinematography')
  ) {
    const categoryPortfolios = await getPortfoliosByCategory(
      CATEGORY_IDS[categoryForLink],
      locale
    )
    const { locationSlugByValue, clientSlugByValue } =
      buildSlugMapsFromPortfolios(categoryPortfolios)

    const clientTrim = portfolio.client?.trim()
    if (clientTrim) {
      const cl = clientSlugByValue.get(clientTrim)
      if (cl) {
        moreForClientHref = localePath(
          locale,
          `${localizedPagePath(locale, pageKey)}?cl=${encodeURIComponent(cl)}`
        )
      }
    }

    const locTrim = portfolio.location?.trim()
    if (locTrim) {
      const loc = locationSlugByValue.get(locTrim)
      if (loc) {
        moreInLocationHref = localePath(
          locale,
          `${localizedPagePath(locale, pageKey)}?loc=${encodeURIComponent(loc)}`
        )
      }
    }
  }

  const moreForClientLabel = portfolio.client?.trim()
    ? fillTemplate(t(locale, 'detail.moreForClient'), {
        client: portfolio.client.trim(),
      })
    : undefined

  const moreInLocationLabel = portfolio.location?.trim()
    ? fillTemplate(t(locale, 'detail.moreInLocation'), {
        location: portfolio.location.trim(),
      })
    : undefined

  const subtitle =
    locale === 'cs'
      ? portfolio.subtitleCs || portfolio.subtitleEn
      : portfolio.subtitleEn || null

  const mediaTransitionName = portfolio.id
    ? `portfolio-media-${portfolio.id}`
    : portfolio.slug
      ? `portfolio-media-${portfolio.slug}`
      : undefined

  const switchUrl = languageSwitchHrefForPortfolio(
    locale,
    portfolio.slugEn,
    portfolio.slugCs
  )

  const year = portfolio.date ? new Date(portfolio.date).getFullYear() : null

  const hasDetailMeta =
    year != null ||
    Boolean(portfolio.client?.trim()) ||
    Boolean(portfolio.location?.trim())

  const locationLabel = portfolio.location?.trim() ?? ''
  const titleSeo = locationLabel
    ? `${portfolio.title ?? ''} | Aerial Cinematography in ${locationLabel} | Ondra Hajek`
    : `${portfolio.title ?? ''} | ${t(locale, 'meta.title')}`
  const descSeo = locationLabel
    ? `Watch ${portfolio.title ?? ''}, a premier commercial production shot in ${locationLabel}. Featuring 4K FPV drone cinematography by Ondra Hajek.`
    : subtitle ?? portfolio.title ?? ''

  const thumbSrc = portfolio.thumbnail?.responsiveImage?.src
  const thumbnailUrl =
    thumbSrc && thumbSrc.startsWith('http')
      ? thumbSrc
      : thumbSrc
        ? `${SITE_URL}${thumbSrc.startsWith('/') ? '' : '/'}${thumbSrc}`
        : undefined

  const uploadIso =
    portfolio.date != null ? new Date(portfolio.date).toISOString() : undefined

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: portfolio.title,
    description: descSeo,
    thumbnailUrl,
    uploadDate: uploadIso,
    embedUrl: portfolio.video ?? undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Ondra Hajek Cinematography',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo-ondrahajek.svg`,
      },
    },
    contentLocation: locationLabel
      ? {
          '@type': 'Place',
          name: locationLabel,
        }
      : undefined,
  }

  const hrefPair = hreflangPairForPortfolio(portfolio.slugEn, portfolio.slugCs)

  const locationH2 = locationLabel
    ? `Commercial Drone Filming in ${locationLabel}`
    : undefined

  return {
    tagLinkPairs,
    pageKey,
    backPath,
    backLinkText,
    moreForClientHref,
    moreInLocationHref,
    moreForClientLabel,
    moreInLocationLabel,
    subtitle,
    mediaTransitionName,
    switchUrl,
    year,
    hasDetailMeta,
    titleSeo,
    descSeo,
    jsonLd,
    hrefPair,
    locationLabel,
    locationH2,
  }
}

export function portfolioDetailSwitchUrlWhenMissing(
  locale: Locale
): string {
  return localePath(getAlternateLocale(locale), '/')
}

export function portfolioDetailCanonicalPath(
  locale: Locale,
  slug: string
): string {
  return portfolioCanonicalPath(locale, slug)
}
