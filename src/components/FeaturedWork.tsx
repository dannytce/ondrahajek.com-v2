import { PortfolioCard } from '~/components/PortfolioCard'
import { t, localePath, type Locale } from '~/i18n'
import type { PortfolioListItem } from '~/api'

interface FeaturedWorkProps {
  portfolios: PortfolioListItem[]
  locale: Locale
}

export function FeaturedWork({ portfolios, locale }: FeaturedWorkProps) {
  if (portfolios.length === 0) return null

  return (
    <div className="w-full max-w-container mx-auto px-[15px] xl:px-0">
      <h2 className="text-white text-[4rem] md:text-[6rem] font-teko font-semibold uppercase mb-8">
        {t(locale, 'home.featured')}
      </h2>
      <ul className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 w-full">
        {portfolios.map((portfolio, index) => (
          <li key={portfolio.slug ?? `featured-${index}`}>
            <PortfolioCard portfolio={portfolio} locale={locale} />
          </li>
        ))}
      </ul>

      <div className="flex gap-8 mt-16 justify-center">
        <a
          href={localePath(locale, '/drone-cinematography')}
          className="text-white font-teko text-[2.4rem] uppercase no-underline border border-white/20 px-8 py-3 transition-colors hover:bg-white/10"
        >
          {t(locale, 'nav.drone')}
        </a>
        <a
          href={localePath(locale, '/video-production')}
          className="text-white font-teko text-[2.4rem] uppercase no-underline border border-white/20 px-8 py-3 transition-colors hover:bg-white/10"
        >
          {t(locale, 'nav.video')}
        </a>
      </div>
    </div>
  )
}
