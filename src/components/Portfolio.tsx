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
          const transitionName = portfolio.slug ? `portfolio-media-${portfolio.slug}` : undefined
          return (
            <li key={portfolio.slug ?? `portfolio-${index}`}>
              <a
                href={`/portfolio/${portfolio.slug}`}
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
                <h4 className="portfolio-card-subtitle text-secondary text-[1.5rem] font-normal  ml-5 relative z-10">
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
