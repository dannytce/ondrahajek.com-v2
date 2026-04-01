import { DatoImage } from '~/components/DatoImage'
import { localePath, type Locale } from '~/i18n'
import type { PortfolioListItem } from '~/api'

interface PortfolioCardProps {
  portfolio: PortfolioListItem
  locale: Locale
}

export function PortfolioCard({ portfolio, locale }: PortfolioCardProps) {
  const thumb = portfolio.thumbnail
  const responsiveImage = thumb?.responsiveImage
  if (!responsiveImage) return null

  const subtitle = locale === 'cs' ? (portfolio.subtitleCs || portfolio.subtitleEn) : (portfolio.subtitleEn || portfolio.subtitleCs)
  const transitionName = portfolio.slug ? `portfolio-media-${portfolio.slug}` : undefined

  return (
    <a
      href={localePath(locale, `/portfolio/${portfolio.slug}`)}
      className="portfolio-card block w-full relative no-underline group"
    >
      <div className="portfolio-card-frame relative overflow-hidden bg-black">
        <div
          className="portfolio-card-media"
          style={{ viewTransitionName: transitionName }}
        >
          <DatoImage
            data={{
              ...responsiveImage,
              alt: '',
            }}
            className="w-full"
            imgClassName="block h-auto w-full"
          />
        </div>
        <div className="portfolio-card-overlay absolute inset-0 pointer-events-none" />
      </div>
      <h3 className="portfolio-card-title text-white text-[2.4rem] xs:text-[2.6rem] md:text-[3rem] lg:text-[4rem] font-teko font-semibold uppercase -mt-[0.5em] leading-none ml-5 relative z-10">
        {portfolio.title}
      </h3>
      <h4 className="portfolio-card-subtitle text-secondary text-[1.5rem] font-normal ml-5 relative z-10">
        {subtitle}
      </h4>
    </a>
  )
}
