import { useState } from 'react'
import { useWindowSize } from '~/hooks/useWindowSize'
import { useScrollDirection } from '~/hooks/useScrollDirection'
import { usePastHero } from '~/hooks/usePastHero'
import { DatoImage } from '~/components/DatoImage'
import { PlayShowreel } from '~/components/PlayShowreel'
import { TrustedBy } from '~/components/About/TrustedBy'
import type { ResponsiveImage } from '~/api/generated/types'

interface HeaderProps {
  isAboutPage?: boolean
  isHomepage?: boolean
  title: string
  subTitle?: string
  headerBackground: ResponsiveImage
  currentPath?: string
}

export function Header({
  title,
  subTitle,
  isAboutPage,
  isHomepage,
  headerBackground,
  currentPath = '/',
}: HeaderProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const windowWidth = useWindowSize()
  const videoSrc =
    windowWidth !== undefined && windowWidth < 768
      ? windowWidth > 375
        ? '/bg-tablet.mp4'
        : '/bg-mobile.mp4'
      : '/bg-desktop.mp4'

  return (
    <>
      <header className="top-0 w-full h-header flex flex-col justify-center fixed z-header">
        <div className="w-full max-w-container mx-auto px-[15px] xl:px-0 relative z-headerContainer flex flex-col flex-1 justify-center md:flex-none md:justify-start md:flex-row">
          {subTitle ? (
            <div className="flex flex-col justify-center">
              <h1 className="text-[6rem] md:text-[10rem] font-teko font-semibold uppercase m-0 p-0">
                {title}
              </h1>
              <h2 className="text-[1.8rem] md:text-[3rem] font-teko uppercase -mt-[0.75em] m-0 p-0">
                {subTitle}
              </h2>
            </div>
          ) : (
            <h1 className="text-[6rem] md:text-[10rem] font-teko font-semibold uppercase m-0 p-0">
              {title}
            </h1>
          )}
          {isHomepage ? <PlayShowreel /> : null}
        </div>

        {isHomepage && windowWidth !== undefined ? (
          <div className="fixed top-0 w-full h-full overflow-hidden z-video">
            <video
              onCanPlay={() => setIsVideoLoaded(true)}
              style={{ opacity: isVideoLoaded ? 1 : 0 }}
              autoPlay
              playsInline
              loop
              muted
              className="box-border h-[56.25vw] left-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 absolute top-1/2 w-[177.78vh] pointer-events-none object-cover"
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          </div>
        ) : null}
        <div
          className="absolute top-0 left-0 right-0 bottom-0 z-header transition-opacity duration-[400ms] ease-[ease]"
          style={{ opacity: isVideoLoaded ? 0 : 1 }}
        >
          <div className="min-h-header">
            <DatoImage
              data={{ ...headerBackground, alt: '' }}
              className="absolute min-w-full min-h-header pointer-events-none object-cover z-[2]"
            />
          </div>
        </div>
      </header>
      {isAboutPage ? <TrustedBy /> : null}
      <Nav currentPath={currentPath} />
    </>
  )
}

function Nav({ currentPath }: { currentPath: string }) {
  const isNavVisible = useScrollDirection()
  const isPastHero = usePastHero()
  const navLinks = [
    { text: 'Drone Cinematography', link: '/drone-cinematography' },
    { text: 'Video Production', link: '/video-production' },
    { text: 'Gallery', link: '/gallery' },
    { text: 'About', link: '/about' },
  ]

  return (
    <div
      className="fixed left-0 right-0 top-0 z-nav pointer-events-none transition-[transform,opacity] duration-300 ease-out"
      style={{
        transform: isNavVisible ? 'translateY(0)' : 'translateY(-100%)',
        opacity: isNavVisible ? 1 : 0,
      }}
    >
      {/* Gradient only when hero is scrolled out – softer overlap with content */}
      {isPastHero && (
        <div
          className="absolute inset-x-0 h-48 pointer-events-none -z-10 transition-opacity duration-300"
          style={{
            background:
              'linear-gradient(to bottom, rgba(13,13,16,0.95) 0%, rgba(13,13,16,0.7) 35%, rgba(13,13,16,0.3) 70%, transparent 100%)',
          }}
        />
      )}
      <nav className="w-full top-[30px] md:top-[63px] relative">
        <div className="w-full max-w-container mx-auto px-[15px] xl:px-0 flex justify-between">
          <a href="/" className="pointer-events-auto">
            <img src="/logo-ondrahajek.svg" alt="ONDRAHAJEK.COM" />
          </a>
          <ul className="p-0 m-0 list-none">
            {navLinks.map((item) => (
              <li key={item.link} className="first:[&_a]:pt-0">
                <a
                  href={item.link}
                  className={`block text-[2rem] font-teko text-white no-underline uppercase text-right pointer-events-auto py-[clamp(5px,1.2vh,10px)] link-animation ${
                    currentPath === item.link ? 'active' : ''
                  }`}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  )
}
