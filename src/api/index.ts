import type { CdaStructuredTextValue } from 'datocms-structured-text-utils'
import type { PortfolioRecord, FileField, ResponsiveImage } from './generated/types'

/** Single portfolio detail query (localized subtitle + descriptions). */
export type PortfolioDetail = PortfolioRecord & {
  descriptionCs?: CdaStructuredTextValue | null
  descriptionEn?: CdaStructuredTextValue | null
}

const API_URL = 'https://graphql.datocms.com'
const API_TOKEN = import.meta.env.DATOCMS_API_TOKEN

/** Max portfolio items to fetch (must cover full CSV import; Dato allows up to 100 per page). */
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
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  const json = await res.json()

  if (json.errors) {
    // eslint-disable-next-line
    console.error(json.errors)
    throw new Error('Failed to fetch API')
  }

  return json.data
}

export async function getAllPortfoliosWithSlug() {
  const data = await fetchAPI(`
    {
      allPortfolios(first: "${PORTFOLIO_LIST_FIRST}") {
        slug
      }
    }
  `)

  return data?.allPortfolios as Array<{ slug: string }>
}

export async function getPortfolioBySlug(slug: string) {
  const data = await fetchAPI(`
    {
      portfolio(filter: { slug: { eq: "${slug}" } }) {
        title
        subtitle(locale: cs)
        slug
        video
        tags
        descriptionCs: description(locale: cs) {
          value
        }
        descriptionEn: description(locale: en) {
          value
        }
      }
    }
  `)

  return data?.portfolio as PortfolioDetail | null
}

export async function getAllPortfolios() {
  const data = await fetchAPI(`
    {
      allPortfolios(first: "${PORTFOLIO_LIST_FIRST}") {
        title
        subtitle
        slug
        tags
        thumbnail {
          responsiveImage(imgixParams: {h: "460", w: "836", fit: crop }) {
            ...responsiveImageFragment
          }
          smartTags
        }
        video
      }
    }
    ${responsiveImageFragment}
  `)

  return data?.allPortfolios as PortfolioRecord[]
}

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
