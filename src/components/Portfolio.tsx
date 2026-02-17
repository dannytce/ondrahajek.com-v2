import { DatoImage } from '~/components/DatoImage'
import type { PortfolioRecord } from '~/api/generated/types'

interface PortfolioProps {
  portfolios: PortfolioRecord[]
}

export function Portfolio({ portfolios }: PortfolioProps) {
  return (
    <div className="w-full max-w-container mx-auto px-[15px] xl:px-0">
      <ul className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 w-full">
        {portfolios.map((portfolio, index) => {
          const thumb = portfolio.thumbnail
          const responsiveImage = thumb?.responsiveImage
          if (!responsiveImage) return null
          return (
            <li key={portfolio.slug ?? `portfolio-${index}`}>
              <a
                href={`/portfolio/${portfolio.slug}`}
                className="block w-full relative no-underline group"
              >
                <div className="relative -z-10 group-hover:before:opacity-0 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:bg-black before:opacity-25 before:z-10 before:transition-opacity">
                  <DatoImage
                    data={{
                      ...responsiveImage,
                      alt: `Cover Image for ${portfolio.title ?? ''}. ${Array.isArray(thumb.smartTags) ? thumb.smartTags.filter(Boolean).join(', ') : ''}`,
                    }}
                  />
                </div>
                <h3 className="text-white text-[2.4rem] xs:text-[2.6rem] md:text-[3rem] lg:text-[4rem] font-teko font-semibold uppercase -mt-[0.5em] leading-none ml-5 relative z-10 transition-opacity group-hover:opacity-25">
                  {portfolio.title}
                </h3>
                <h4 className="text-secondary text-[1.5rem] font-normal  ml-5 relative z-10 transition-opacity group-hover:opacity-25">
                  {portfolio.subtitle}
                </h4>
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
