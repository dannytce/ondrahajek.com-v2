declare global {
  interface Window {
    gtag: any
    fbq: any
  }
}

export const FB_PIXEL_ID = '895557671255172'

export const GA_TRACKING_ID = 'UA-111398537-1'

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageView = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  })
  window.fbq('track', 'PageView')
}

type gtagEvent = {
  action?: string
  category?: string
  label?: string
  value?: string
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: gtagEvent) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })

  // https://developers.facebook.com/docs/facebook-pixel/advanced/
  window.fbq('track', action)
}
