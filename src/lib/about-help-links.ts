import type { PortfolioListItem } from '~/api'
import type { Locale } from '~/i18n'

export interface AboutHelpLinkItem {
  label: string
  subSlug: string
  targetPage: 'drone' | 'video'
}

interface CountEntry {
  slug: string
  label: string
  count: number
}

function collectSubcategoryStats(
  portfolios: PortfolioListItem[]
): Map<string, CountEntry> {
  const map = new Map<string, CountEntry>()

  for (const portfolio of portfolios) {
    for (const subcategory of portfolio.subcategory) {
      const slug = subcategory.slug?.trim()
      const label = subcategory.name?.trim()
      if (!slug || !label) continue

      const existing = map.get(slug)
      if (existing) {
        existing.count += 1
        continue
      }

      map.set(slug, { slug, label, count: 1 })
    }
  }

  return map
}

export function buildAboutHelpLinks(
  dronePortfolios: PortfolioListItem[],
  videoPortfolios: PortfolioListItem[],
  locale: Locale
): AboutHelpLinkItem[] {
  const droneStats = collectSubcategoryStats(dronePortfolios)
  const videoStats = collectSubcategoryStats(videoPortfolios)
  const linksBySlug = new Map<string, AboutHelpLinkItem>()

  for (const entry of droneStats.values()) {
    linksBySlug.set(entry.slug, {
      label: entry.label,
      subSlug: entry.slug,
      targetPage: entry.slug === 'interview' ? 'video' : 'drone',
    })
  }

  for (const entry of videoStats.values()) {
    const existing = linksBySlug.get(entry.slug)
    if (existing) {
      if (entry.slug === 'interview') {
        existing.targetPage = 'video'
      }
      continue
    }

    linksBySlug.set(entry.slug, {
      label: entry.label,
      subSlug: entry.slug,
      targetPage: 'video',
    })
  }

  const requiredItems: Array<{
    slugs: string[]
    fallbackLabel: { en: string; cs: string }
    targetPage: 'drone' | 'video'
  }> = [
    {
      slugs: ['interview'],
      fallbackLabel: { en: 'Interview', cs: 'Rozhovor' },
      targetPage: 'video',
    },
    {
      slugs: ['movie', 'film-production'],
      fallbackLabel: { en: 'Movie', cs: 'Film' },
      targetPage: 'video',
    },
    {
      slugs: ['music-video'],
      fallbackLabel: { en: 'Music video', cs: 'Hudební video' },
      targetPage: 'video',
    },
    {
      slugs: ['tv-series'],
      fallbackLabel: { en: 'TV series', cs: 'TV seriál' },
      targetPage: 'video',
    },
  ]

  for (const item of requiredItems) {
    const alreadyPresent = Array.from(linksBySlug.values()).some((entry) =>
      item.slugs.includes(entry.subSlug)
    )
    if (alreadyPresent) continue

    const source =
      item.slugs
        .map((slug) => videoStats.get(slug) ?? droneStats.get(slug))
        .find(Boolean) ?? null
    if (!source) continue

    const candidate: AboutHelpLinkItem = {
      label: source.label || item.fallbackLabel[locale],
      subSlug: source.slug,
      targetPage: item.targetPage,
    }

    linksBySlug.set(candidate.subSlug, candidate)
  }

  return Array.from(linksBySlug.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  )
}
