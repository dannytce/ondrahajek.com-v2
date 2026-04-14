/**
 * Homepage hero: single responsive background video with CMS image as placeholder.
 * Breakpoints match Tailwind (tailwind.config.mjs): md 48em, xl 82.875em @ 16px root.
 * Re-encode hero MP4s to ~2–5MB each for acceptable LCP (see HeaderHero comment).
 */
const MD_PX = 768 // 48em
const XL_PX = 1326 // 82.875em

function getSrcForWidth(w: number): string {
  if (w >= XL_PX) return '/bg-desktop.mp4'
  if (w >= MD_PX) return '/bg-tablet.mp4'
  return '/bg-mobile.mp4'
}

function initHeroVideoRoot(root: HTMLElement) {
  if (root.dataset.heroVideoBound === 'true') return
  root.dataset.heroVideoBound = 'true'

  const video = root.querySelector<HTMLVideoElement>('[data-hero-video]')
  const poster = root.querySelector<HTMLElement>('[data-hero-poster]')
  const source = video?.querySelector<HTMLSourceElement>('source')

  if (!video || !poster || !source) return

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  let currentSrc = ''
  let onPlaying: (() => void) | null = null

  const fadeIn = () => {
    poster.classList.add('opacity-0')
    video.classList.remove('opacity-0')
    video.classList.add('opacity-100')
  }

  const applySource = (width: number) => {
    const next = getSrcForWidth(width)
    if (next === currentSrc) return

    if (onPlaying) {
      video.removeEventListener('playing', onPlaying)
      onPlaying = null
    }

    currentSrc = next
    source.src = next

    poster.classList.remove('opacity-0')
    video.classList.add('opacity-0')
    video.classList.remove('opacity-100')

    const handlePlaying = () => {
      fadeIn()
      video.removeEventListener('playing', handlePlaying)
      onPlaying = null
    }
    onPlaying = handlePlaying

    video.addEventListener('playing', handlePlaying)
    video.load()
  }

  applySource(window.innerWidth)

  let resizeDebounce: ReturnType<typeof setTimeout> | null = null
  window.addEventListener('resize', () => {
    if (resizeDebounce) clearTimeout(resizeDebounce)
    resizeDebounce = setTimeout(() => {
      applySource(window.innerWidth)
    }, 150)
  })

  video.addEventListener('error', () => {
    // Keep poster visible if the asset fails to load or decode
  })
}

function initAll() {
  document
    .querySelectorAll<HTMLElement>('[data-hero-video-root]')
    .forEach(initHeroVideoRoot)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll)
} else {
  initAll()
}
