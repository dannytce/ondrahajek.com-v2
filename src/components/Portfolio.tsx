import { useState, useEffect, type MouseEvent } from 'react'
import { Modal } from '~/components/Modal'
import { Player } from '~/components/Player'
import { DatoImage } from '~/components/DatoImage'
import { pageView } from '~/service/analytics'
import type { PortfolioRecord } from '~/api/generated/types'

interface PortfolioProps {
  slug?: string
  portfolios: PortfolioRecord[]
}

function getPortfolioDetail(portfolios: PortfolioRecord[], slug: string) {
  return portfolios.find((item) => item.slug === slug)!
}

export function Portfolio({ slug: incomingSlug, portfolios }: PortfolioProps) {
  const [slug, setSlug] = useState(incomingSlug ?? '')

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    const element = event.currentTarget
    const href = element.getAttribute('href')
    if (href) {
      setSlug(href.replace('/portfolio/', ''))
      pageView(href)
      window.history.pushState({}, '', href)
    }
  }

  function handleClose() {
    window.history.pushState({}, '', '/')
    setSlug('')
  }

  const portfolioDetail = slug ? getPortfolioDetail(portfolios, slug) : null

  useEffect(() => {
    if (portfolioDetail) {
      document.title = `${portfolioDetail.title} - ondrahajek.com | AERIAL Video & Photography`
    }
  }, [portfolioDetail])

  return (
    <div className="w-full max-w-container mx-auto px-[15px] xl:px-0">
      {slug && portfolioDetail ? (
        <Modal isOpen onRequestClose={handleClose}>
          <Player
            title={portfolioDetail.title ?? 'Video'}
            video={portfolioDetail.video ?? ''}
          />
        </Modal>
      ) : null}
      <ul className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 w-full">
        {portfolios.map((portfolio, index) => {
          const thumb = portfolio.thumbnail
          const responsiveImage = thumb?.responsiveImage
          if (!responsiveImage) return null
          return (
            <li key={portfolio.slug ?? `portfolio-${index}`}>
              <a
                href={`/portfolio/${portfolio.slug}`}
                onClick={handleClick}
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
