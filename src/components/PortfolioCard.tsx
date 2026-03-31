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

  return (
    <a
      href={localePath(locale, `/portfolio/${portfolio.slug}`)}
      className="block w-full relative no-underline group"
    >
      <div className="relative -z-10 group-hover:before:opacity-0 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:bg-black before:opacity-25 before:z-10 before:transition-opacity">
        <DatoImage
          data={{
            ...responsiveImage,
            alt: `Cover Image for ${portfolio.title ?? ''}. ${
              Array.isArray(thumb?.smartTags)
                ? thumb.smartTags.filter(Boolean).join(', ')
                : ''
            }`,
          }}
        />
      </div>
      <h3 className="text-white text-[2.4rem] xs:text-[2.6rem] md:text-[3rem] lg:text-[4rem] font-teko font-semibold uppercase -mt-[0.5em] leading-none ml-5 relative z-10 transition-opacity group-hover:opacity-25">
        {portfolio.title}
      </h3>
      <h4 className="text-secondary text-[1.5rem] font-normal ml-5 relative z-10 transition-opacity group-hover:opacity-25">
        {subtitle}
      </h4>
    </a>
  )
}
