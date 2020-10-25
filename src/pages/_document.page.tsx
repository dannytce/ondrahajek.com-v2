import React from 'react'
import Document, {
  DocumentContext,
  Html,
  Head,
  Main,
  NextScript,
} from 'next/document' // eslint-disable-line no-shadow
import { ServerStyleSheet } from 'styled-components'

const fontsHref =
  'https://fonts.googleapis.com/css?family=Teko:400,600|Montserrat:400,700&display=swap'

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        })

      const initialProps = await Document.getInitialProps(ctx)

      const styles = (
        <>
          {initialProps.styles}
          {sheet.getStyleElement()}
        </>
      )

      return { ...initialProps, styles }
    } finally {
      sheet.seal()
    }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta
            name="description"
            content="Web portfolio of drone pilot Ondra Hajek, who will make your projects more interesting. He specialises in documentaries, film, music video, commercials and architecture."
          />
          <meta
            name="og:description"
            content="Web portfolio of drone pilot Ondra Hajek, who will make your projects more interesting. He specialises in documentaries, film, music video, commercials and architecture."
          />
          <meta
            name="keywords"
            content="aerial, drone, camera, 4k, phantom, phantom4pro, inspire, video, equipment, photography, studio, professional, uav, dji, copter, documentary, film, music video, promo, commercial, architecture, music video, aerial video, aerial photography, 360 photography, 360°,copter vision, coptervision, georgia, bali, indonesia, brazil, rio de janeiro, surf, paragliding, surfing, travel, dron, kamera, letecké záběry, koptéra, na zakázku, výškové práce, ze vzduchu, ucl, dokument, film, hudební klip, architektura"
          />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="true"
          />
          <link rel="preconnect" href="https://www.datocms-assets.com" />
          <link rel="preconnect" href="https://www.youtube.com" />
          <link rel="preconnect" href="https://i.ytimg.com" />
          <link rel="preconnect" href="https://i9.ytimg.com" />
          <link rel="preconnect" href="https://s.ytimg.com" />
          <link rel="preconnect" href="https://player.vimeo.com" />
          <link rel="preconnect" href="https://i.vimeocdn.com" />
          <link rel="preconnect" href="https://f.vimeocdn.com" />

          <link rel="preload" as="style" href={fontsHref} />
          <link
            rel="stylesheet"
            href={fontsHref}
            media="print"
            onLoad="this.media='all'"
          />
          <noscript>
            <link rel="stylesheet" href={fontsHref} />
          </noscript>
          <link href={fontsHref} rel="stylesheet" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
