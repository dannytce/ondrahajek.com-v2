import type { CdaStructuredTextValue } from 'datocms-structured-text-utils'
import type { PortfolioRecord, FileField, ResponsiveImage } from './generated/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Single portfolio detail – localized subtitles & descriptions. */
export type PortfolioDetail = PortfolioRecord & {
  subtitleCs?: string | null
  subtitleEn?: string | null
  descriptionCs?: CdaStructuredTextValue | null
  descriptionEn?: CdaStructuredTextValue | null
}

/** Lightweight portfolio item for list/grid pages. */
export interface PortfolioListItem {
  title: string | null
  subtitle: string | null
  subtitleCs: string | null
  subtitleEn: string | null
  slug: string | null
  tags: string | null
  video: string | null
  date: string | null
  client: string | null
  location: string | null
  position: number | null
  category: Array<{ id: string; name: string | null }>
  subcategory: Array<{ id: string; name: string | null }>
  thumbnail: {
    responsiveImage: ResponsiveImage | null
    smartTags: string[]
  } | null
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_URL = 'https://graphql.datocms.com'
const API_TOKEN = import.meta.env.DATOCMS_API_TOKEN
const PORTFOLIO_LIST_FIRST = 100

// See: https://www.datocms.com/blog/offer-responsive-progressive-lqip-images-in-2020
const responsiveImageFragment = `
  fragment responsiveImageFragment on ResponsiveImage {
    srcSet
    webpSrcSet
    sizes
    src
    width
    height
    aspectRatio
    alt
    title
    bgColor
    base64
  }
`

const portfolioListFields = `
  title
  subtitleCs: subtitle(locale: cs)
  subtitleEn: subtitle(locale: en)
  subtitle
  slug
  tags
  video
  date
  client
  location
  position
  category { id name }
  subcategory { id name }
  thumbnail {
    responsiveImage(imgixParams: {h: "460", w: "836", fit: crop }) {
      ...responsiveImageFragment
    }
    smartTags
  }
`

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------

const fetchAPI = async (
  query: string,
  { variables, preview }: { variables?: any; preview?: boolean } = {}
) => {
  const res = await fetch(API_URL + (preview ? '/preview' : ''), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  })

  const json = await res.json()

  if (json.errors) {
    console.error(json.errors)
    throw new Error('Failed to fetch API')
  }

  return json.data
}

// ---------------------------------------------------------------------------
// Portfolio queries
// ---------------------------------------------------------------------------

export async function getAllPortfoliosWithSlug() {
  const data = await fetchAPI(`
    {
      allPortfolios(first: ${PORTFOLIO_LIST_FIRST}) {
        slug
      }
    }
  `)
  return data?.allPortfolios as Array<{ slug: string }>
}

/** Fetch all portfolios (full list fields). Used on old homepage fallback. */
export async function getAllPortfolios(): Promise<PortfolioListItem[]> {
  const data = await fetchAPI(`
    {
      allPortfolios(first: ${PORTFOLIO_LIST_FIRST}, orderBy: position_ASC) {
        ${portfolioListFields}
      }
    }
    ${responsiveImageFragment}
  `)
  return data?.allPortfolios ?? []
}

/** Fetch portfolios filtered by DatoCMS category ID. */
export async function getPortfoliosByCategory(categoryId: string): Promise<PortfolioListItem[]> {
  const data = await fetchAPI(`
    {
      allPortfolios(
        first: ${PORTFOLIO_LIST_FIRST}
        filter: { category: { anyIn: ["${categoryId}"] } }
        orderBy: position_ASC
      ) {
        ${portfolioListFields}
      }
    }
    ${responsiveImageFragment}
  `)
  return data?.allPortfolios ?? []
}

/** Fetch "Selected Work" / featured portfolios for homepage. */
export async function getFeaturedPortfolios(categoryId: string): Promise<PortfolioListItem[]> {
  return getPortfoliosByCategory(categoryId)
}

/** Fetch full portfolio detail by slug. */
export async function getPortfolioBySlug(slug: string): Promise<PortfolioDetail | null> {
  const data = await fetchAPI(`
    {
      portfolio(filter: { slug: { eq: "${slug}" } }) {
        title
        subtitleCs: subtitle(locale: cs)
        subtitleEn: subtitle(locale: en)
        subtitle
        slug
        video
        tags
        date
        client
        location
        position
        category { id name }
        subcategory { id name }
        thumbnail {
          responsiveImage(imgixParams: {h: "900", w: "1600", fit: crop }) {
            ...responsiveImageFragment
          }
          smartTags
        }
        descriptionCs: description(locale: cs) {
          value
        }
        descriptionEn: description(locale: en) {
          value
        }
      }
    }
    ${responsiveImageFragment}
  `)
  return data?.portfolio ?? null
}

// ---------------------------------------------------------------------------
// Taxonomy queries
// ---------------------------------------------------------------------------

export interface TaxonomyItem {
  id: string
  name: string | null
}

export async function getAllCategories(): Promise<TaxonomyItem[]> {
  const data = await fetchAPI(`{ allPortfolioCategories { id name } }`)
  return data?.allPortfolioCategories ?? []
}

export async function getAllSubcategories(): Promise<TaxonomyItem[]> {
  const data = await fetchAPI(`{ allPortfolioSubcategories { id name } }`)
  return data?.allPortfolioSubcategories ?? []
}

// ---------------------------------------------------------------------------
// Gallery & header
// ---------------------------------------------------------------------------

export async function getGallery() {
  const data = await fetchAPI(`
    {
      gallery {
        photos {
          id
          alt
          title
          responsiveImage(imgixParams: {h: "1300", w: "2100", fit: crop }) {
            ...responsiveImageFragment
          }
          smartTags
        }
      }
    }
    ${responsiveImageFragment}
  `)
  return data.gallery.photos as FileField[]
}

export async function getHeaderBackgroundByPage(page: string) {
  const data = await fetchAPI(`
    {
      headerBackground(filter: {page: {eq: "${page}"}}) {
        photo {
          responsiveImage {
            ...responsiveImageFragment
          }
        }
      }
    }
    ${responsiveImageFragment}
  `)
  return data.headerBackground.photo.responsiveImage as ResponsiveImage
}
