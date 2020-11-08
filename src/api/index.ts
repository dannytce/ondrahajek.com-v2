import { PortfolioRecord, FileField, ResponsiveImage } from './generated/types'

const API_URL = 'https://graphql.datocms.com'
const API_TOKEN = process.env.DATOCMS_API_TOKEN

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
      allPortfolios(first: "40") {
        slug
      }
    }
  `)

  return data?.allPortfolios as Array<{ slug: string }>
}

export async function getAllPortfolios() {
  const data = await fetchAPI(`
    {
      allPortfolios(first: "40") {
        title
        subtitle
        slug
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
