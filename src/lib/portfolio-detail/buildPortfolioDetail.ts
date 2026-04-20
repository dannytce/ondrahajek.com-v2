import type { PortfolioDetail, PortfolioListItem } from '~/api'
import {
  t,
  localePath,
  getCategorySlug,
  getAlternateLocale,
  fillTemplate,
  CATEGORY_IDS,
  type CategorySlug,
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

const SITE_URL = 'https://ondrahajek.com'

function categoryToPageKey(
  categorySlug: ReturnType<typeof getCategorySlug>
): SitePageKey | null {
  if (categorySlug === 'drone-cinematography') return 'drone'
  if (categorySlug === 'video-production') return 'video'
  return null
}

export type DetailFilterPillType = 'category' | 'client' | 'location' | 'year'

export interface DetailFilterPill {
  type: DetailFilterPillType
  label: string
  href: string | undefined
}

/** Derived data for portfolio detail page (SEO, JSON-LD, nav, related links). */
export interface PortfolioDetailModel {
  detailFilterPills: DetailFilterPill[]
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
  heroSubtitle: string | undefined
  thumbnailUrl: string | undefined
}

export async function buildPortfolioDetailModel(
  portfolio: PortfolioDetail,
  locale: Locale,
  getPortfoliosByCategory: (
    categoryId: string,
    locale: Locale
  ) => Promise<PortfolioListItem[]>
): Promise<PortfolioDetailModel> {
  const candidateCategorySlugs = Array.from(
    new Set(
      (portfolio.category ?? [])
        .map((category) => getCategorySlug(category.id))
        .filter(
          (slug): slug is CategorySlug =>
            slug === 'video-production' || slug === 'drone-cinematography'
        )
    )
  )

  const detailSubcategoryIds = new Set(
    (portfolio.subcategory ?? []).map((subcategory) => subcategory.id?.trim()).filter(Boolean)
  )

  let categorySlug: CategorySlug | null = null
  let categoryPortfoliosForLinks: PortfolioListItem[] = []
  let bestScore = -1

  for (const slug of candidateCategorySlugs) {
    const items = await getPortfoliosByCategory(CATEGORY_IDS[slug], locale)
    const hasPortfolioInCategory = items.some((item) => item.id === portfolio.id)
    const hasMatchingSubcategory = items.some((item) =>
      item.subcategory.some((subcategory) => detailSubcategoryIds.has(subcategory.id?.trim()))
    )
    const score =
      (hasPortfolioInCategory ? 2 : 0) + (hasMatchingSubcategory ? 1 : 0)
    if (score > bestScore) {
      bestScore = score
      categorySlug = slug
      categoryPortfoliosForLinks = items
    }
  }

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
  let categoryFilterSubSlug: string | undefined

  if (
    categoryForLink &&
    pageKey != null &&
    (categoryForLink === 'video-production' ||
      categoryForLink === 'drone-cinematography')
  ) {
    const categoryPortfolios =
      categoryPortfoliosForLinks.length > 0
        ? categoryPortfoliosForLinks
        : await getPortfoliosByCategory(CATEGORY_IDS[categoryForLink], locale)
    const subSlugBySubcategoryId = new Map<string, string>()
    for (const item of categoryPortfolios) {
      for (const subcategory of item.subcategory) {
        const subcategoryId = subcategory.id?.trim()
        const subcategorySlug = subcategory.slug?.trim()
        if (subcategoryId && subcategorySlug && !subSlugBySubcategoryId.has(subcategoryId)) {
          subSlugBySubcategoryId.set(subcategoryId, subcategorySlug)
        }
      }
    }

    for (const subcategory of portfolio.subcategory) {
      const subcategoryId = subcategory.id?.trim()
      if (!subcategoryId) continue
      const candidate = subSlugBySubcategoryId.get(subcategoryId)
      if (candidate) {
        categoryFilterSubSlug = candidate
        break
      }
    }

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
  const yearLabel = year != null && !Number.isNaN(year) ? String(year) : ''

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

  const heroSubtitle = locationLabel
    ? `Commercial Drone Filming in ${locationLabel}`
    : undefined

  const detailFilterPills: DetailFilterPill[] = []

  const firstSubcategory = portfolio.subcategory.find(
    (subcategory) => subcategory.slug?.trim() && subcategory.name?.trim()
  )
  if (firstSubcategory?.name?.trim()) {
    const subSlug = categoryFilterSubSlug ?? firstSubcategory.slug?.trim() ?? ''
    detailFilterPills.push({
      type: 'category',
      label: firstSubcategory.name.trim(),
      href:
        pageKey != null && subSlug
          ? localePath(
              locale,
              `${localizedPagePath(locale, pageKey)}?sub=${encodeURIComponent(subSlug)}`
            )
          : undefined,
    })
  }

  const clientLabel = portfolio.client?.trim()
  detailFilterPills.push({
    type: 'client',
    label: clientLabel ?? '',
    href:
      pageKey != null && moreForClientHref != null && clientLabel
        ? moreForClientHref
        : undefined,
  })

  const locationText = portfolio.location?.trim()
  detailFilterPills.push({
    type: 'location',
    label: locationText ?? '',
    href:
      pageKey != null && moreInLocationHref != null && locationText
        ? moreInLocationHref
        : undefined,
  })

  detailFilterPills.push({
    type: 'year',
    label: yearLabel,
    href:
      pageKey != null && yearLabel
        ? localePath(
            locale,
            `${localizedPagePath(locale, pageKey)}?year=${encodeURIComponent(yearLabel)}`
          )
        : undefined,
  })

  return {
    detailFilterPills: detailFilterPills.filter((pill) => pill.label),
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
    heroSubtitle,
    thumbnailUrl,
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
