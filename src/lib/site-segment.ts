import type { PortfolioListItem } from '~/api'
import { t, type Locale } from '~/i18n'
import { portfolioCanonicalPath, type SitePageKey } from '~/i18n/routes'

const SITE_URL = 'https://ondrahajek.com'

export function buildCategoryCollectionJsonLd(
  locale: Locale,
  pageKey: Extract<SitePageKey, 'drone' | 'video'>,
  portfolios: PortfolioListItem[],
  canonicalPath: string,
  defaultSeoDescription: string
): Record<string, unknown> {
  const currentFull = `${SITE_URL}/${locale}${canonicalPath}`
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t(
      locale,
      pageKey === 'drone' ? 'category.drone.title' : 'category.video.title'
    ),
    description: defaultSeoDescription,
    url: currentFull,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: portfolios.filter((p) => p.slug).length,
      itemListElement: portfolios
        .filter((p) => p.slug)
        .map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}/${locale}${portfolioCanonicalPath(locale, p.slug!)}`,
          name: p.title ?? undefined,
        })),
    },
  }
}

export function categoryHubSeo(
  locale: Locale,
  pageKey: Extract<SitePageKey, 'drone' | 'video'>
): {
  defaultSeoTitle: string
  defaultSeoDescription: string
  categoryTitle: string
} {
  const defaultSeoTitle =
    pageKey === 'drone'
      ? `${t(locale, 'category.drone.title')} - ${t(locale, 'meta.title')}`
      : `${t(locale, 'category.video.title')} - ${t(locale, 'meta.title')}`
  const defaultSeoDescription =
    pageKey === 'drone'
      ? t(locale, 'category.drone.description')
      : t(locale, 'category.video.description')
  const categoryTitle =
    pageKey === 'drone'
      ? t(locale, 'category.drone.title')
      : t(locale, 'category.video.title')
  return { defaultSeoTitle, defaultSeoDescription, categoryTitle }
}
