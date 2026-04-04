import type { CdaStructuredTextValue } from 'datocms-structured-text-utils'
import { buildTagsSearchBlob } from '~/lib/portfolio-tags'
import {
  PORTFOLIO_TAGS_FIELD,
  readTagsStringFromRecord,
} from '~/lib/datocms-portfolio-tags-field'
import type { Locale } from '~/i18n'
import type {
  PortfolioRecord,
  FileField,
  ResponsiveImage,
} from './generated/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Single portfolio detail – localized subtitles & descriptions. */
export type PortfolioDetail = Omit<PortfolioRecord, 'client' | 'location'> & {
  subtitleCs?: string | null
  subtitleEn?: string | null
  descriptionCs?: CdaStructuredTextValue | null
  descriptionEn?: CdaStructuredTextValue | null
  /** Resolved display name from linked Client. */
  client: string | null
  /** Resolved display name from linked Location (locale-aware). */
  location: string | null
}

/** Lightweight portfolio item for list/grid pages. */
export interface PortfolioListItem {
  title: string | null
  subtitle: string | null
  subtitleCs: string | null
  subtitleEn: string | null
  slug: string | null
  /** Semicolon-separated canonical tag keys (see `portfolio-tag-labels.json`). */
  tags: string | null
  /** Keys + localized labels for client-side search. */
  tagsSearchText: string
  video: string | null
  date: string | null
  client: string | null
  location: string | null
  position: number | null
  /** CSV `priorita` / Dato `priority` (1 = top). Falls back to `position` when sorting. */
  priority: number | null
  category: Array<{ id: string; name: string | null }>
  subcategory: Array<{
    id: string
    name: string | null
    slug: string | null
  }>
  thumbnail: {
    responsiveImage: ResponsiveImage | null
    smartTags: string[]
  } | null
}

type RawPortfolioListRow = {
  title: string | null
  subtitle: string | null
  subtitleCs: string | null
  subtitleEn: string | null
  slug: string | null
  video: string | null
  date: string | null
  client?: { name?: string | null } | null
  location?: {
    nameCs?: string | null
    nameEn?: string | null
  } | null
  position: number | null
  priority: number | null
  category: Array<{ id: string; name: string | null }>
  subcategory: Array<{ id: string; name: string | null; slug: string | null }>
  thumbnail: PortfolioListItem['thumbnail']
} & Record<string, unknown>

function mapPortfolioListItem(
  raw: RawPortfolioListRow,
  locale: Locale
): PortfolioListItem {
  const tags = readTagsStringFromRecord(raw)
  const clientStr = raw.client?.name?.trim() ? raw.client.name.trim() : null
  const nameCs = raw.location?.nameCs?.trim() ?? ''
  const nameEn = raw.location?.nameEn?.trim() ?? ''
  const locationStr =
    locale === 'cs'
      ? nameCs || nameEn || null
      : nameEn || nameCs || null

  return {
    title: raw.title,
    subtitle: raw.subtitle,
    subtitleCs: raw.subtitleCs,
    subtitleEn: raw.subtitleEn,
    slug: raw.slug,
    tags,
    tagsSearchText: buildTagsSearchBlob(tags).toLowerCase(),
    video: raw.video,
    date: raw.date,
    client: clientStr,
    location: locationStr,
    position: raw.position,
    priority: raw.priority ?? null,
    category: raw.category,
    subcategory: raw.subcategory,
    thumbnail: raw.thumbnail,
  }
}

function portfolioYear(item: PortfolioListItem): number {
  if (!item.date) return 0
  const y = new Date(item.date).getFullYear()
  return Number.isNaN(y) ? 0 : y
}

/** Priority (1 = top), then newest year. Missing priority sorts after keyed items; ties by year desc. */
export function sortPortfolioListItems(
  items: PortfolioListItem[]
): PortfolioListItem[] {
  return [...items].sort((a, b) => {
    const pa = a.priority ?? a.position
    const pb = b.priority ?? b.position
    const hasA = pa != null
    const hasB = pb != null
    if (hasA && hasB) {
      if (pa !== pb) return pa - pb
      return portfolioYear(b) - portfolioYear(a)
    }
    if (hasA && !hasB) return -1
    if (!hasA && hasB) return 1
    return portfolioYear(b) - portfolioYear(a)
  })
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

function portfolioListFields(locale: Locale): string {
  const loc = locale === 'cs' ? 'cs' : 'en'
  return `
  title
  subtitleCs: subtitle(locale: cs)
  subtitleEn: subtitle(locale: en)
  subtitle
  slug
  ${PORTFOLIO_TAGS_FIELD}
  video
  date
  client {
    name
  }
  location {
    nameCs: name(locale: cs)
    nameEn: name(locale: en)
  }
  position
  priority
  category { id name }
  subcategory {
    id
    name(locale: ${loc})
    slug(locale: ${loc})
  }
  thumbnail {
    responsiveImage(imgixParams: {h: "460", w: "836", fit: crop }) {
      ...responsiveImageFragment
    }
    smartTags
  }
`
}

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------

const fetchAPI = async (
  query: string,
  {
    variables,
    preview,
  }: { variables?: Record<string, unknown>; preview?: boolean } = {}
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

/**
 * All portfolio slugs for static paths. Paginates past `PORTFOLIO_LIST_FIRST`
 * so detail pages exist for every item that can appear in category grids
 * (those queries are also capped per batch; see `getPortfoliosByCategory`).
 */
export async function getAllPortfoliosWithSlug(): Promise<Array<{ slug: string }>> {
  const all: Array<{ slug: string }> = []
  let skip = 0
  const batch = PORTFOLIO_LIST_FIRST
  while (true) {
    const data = await fetchAPI(`
      {
        allPortfolios(first: ${batch}, skip: ${skip}, orderBy: priority_ASC) {
          slug
        }
      }
    `)
    const rows = (data?.allPortfolios ?? []) as Array<{ slug: string | null }>
    if (rows.length === 0) break
    for (const r of rows) {
      if (r.slug) all.push({ slug: r.slug })
    }
    if (rows.length < batch) break
    skip += batch
  }
  return all
}

/** Fetch all portfolios (full list fields). Paginates to include every record. */
export async function getAllPortfolios(
  locale: Locale
): Promise<PortfolioListItem[]> {
  const all: PortfolioListItem[] = []
  let skip = 0
  const batch = PORTFOLIO_LIST_FIRST
  while (true) {
    const data = await fetchAPI(`
      {
        allPortfolios(first: ${batch}, skip: ${skip}, orderBy: priority_ASC) {
          ${portfolioListFields(locale)}
        }
      }
      ${responsiveImageFragment}
    `)
    const rows = (data?.allPortfolios ?? []) as RawPortfolioListRow[]
    if (rows.length === 0) break
    all.push(...rows.map((r) => mapPortfolioListItem(r, locale)))
    if (rows.length < batch) break
    skip += batch
  }
  return sortPortfolioListItems(all)
}

/** Fetch portfolios filtered by DatoCMS category ID. Paginates past 100 per category. */
export async function getPortfoliosByCategory(
  categoryId: string,
  locale: Locale
): Promise<PortfolioListItem[]> {
  const all: PortfolioListItem[] = []
  let skip = 0
  const batch = PORTFOLIO_LIST_FIRST
  while (true) {
    const data = await fetchAPI(`
      {
        allPortfolios(
          first: ${batch}
          skip: ${skip}
          filter: { category: { anyIn: ["${categoryId}"] } }
          orderBy: priority_ASC
        ) {
          ${portfolioListFields(locale)}
        }
      }
      ${responsiveImageFragment}
    `)
    const rows = (data?.allPortfolios ?? []) as RawPortfolioListRow[]
    if (rows.length === 0) break
    all.push(...rows.map((r) => mapPortfolioListItem(r, locale)))
    if (rows.length < batch) break
    skip += batch
  }
  return sortPortfolioListItems(all)
}

/** Fetch "Selected Work" / featured portfolios for homepage. */
export async function getFeaturedPortfolios(
  categoryId: string,
  locale: Locale
): Promise<PortfolioListItem[]> {
  return getPortfoliosByCategory(categoryId, locale)
}

/** Fetch full portfolio detail by slug. */
export async function getPortfolioBySlug(
  slug: string,
  locale: Locale
): Promise<PortfolioDetail | null> {
  const loc = locale === 'cs' ? 'cs' : 'en'
  const data = await fetchAPI(`
    {
      portfolio(filter: { slug: { eq: "${slug}" } }) {
        title
        subtitleCs: subtitle(locale: cs)
        subtitleEn: subtitle(locale: en)
        subtitle
        slug
        video
        ${PORTFOLIO_TAGS_FIELD}
        date
        client {
          name
        }
        location {
          nameCs: name(locale: cs)
          nameEn: name(locale: en)
        }
        position
        priority
        category { id name }
        subcategory {
          id
          name(locale: ${loc})
          slug(locale: ${loc})
        }
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
  const raw = data?.portfolio
  if (!raw) {
    return null
  }
  const p = raw as PortfolioRecord & {
    subtitleCs?: string | null
    subtitleEn?: string | null
    descriptionCs?: CdaStructuredTextValue | null
    descriptionEn?: CdaStructuredTextValue | null
    client?: { name?: string | null } | null
    location?: {
      nameCs?: string | null
      nameEn?: string | null
    } | null
  }
  const clientStr = p.client?.name?.trim() ? p.client.name.trim() : null
  const nameCs = p.location?.nameCs?.trim() ?? ''
  const nameEn = p.location?.nameEn?.trim() ?? ''
  const locationStr =
    locale === 'cs'
      ? nameCs || nameEn || null
      : nameEn || nameCs || null

  const asRecord = p as Record<string, unknown>
  return {
    ...p,
    tags: readTagsStringFromRecord(asRecord),
    client: clientStr,
    location: locationStr,
  } as PortfolioDetail
}

// ---------------------------------------------------------------------------
// Taxonomy queries
// ---------------------------------------------------------------------------

export interface TaxonomyItem {
  id: string
  name: string | null
  slug?: string | null
}

export async function getAllCategories(): Promise<TaxonomyItem[]> {
  const data = await fetchAPI(`{ allPortfolioCategories { id name } }`)
  return data?.allPortfolioCategories ?? []
}

export async function getAllSubcategories(): Promise<TaxonomyItem[]> {
  const data = await fetchAPI(`
    {
      allPortfolioSubcategories {
        id
        name(locale: en)
        slug(locale: en)
      }
    }
  `)
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
