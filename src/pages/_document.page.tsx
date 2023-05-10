import React from 'react'
import Document, {
  DocumentContext,
  Html,
  Head,
  Main,
  NextScript,
} from 'next/document' // eslint-disable-line no-shadow
import { ServerStyleSheet } from 'styled-components'

import { FB_PIXEL_ID, GA_TRACKING_ID } from '~/service/analytics'

const fontsHref =
  'https://fonts.googleapis.com/css?family=Teko:400,600|Roboto:400,700&display=swap'

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
            property="og:description"
            content="Web portfolio of drone pilot Ondra Hajek, who will make your projects more interesting. He specialises in documentaries, film, music video, commercials and architecture."
          />
          <meta property="og:image" content="/social.jpg" />
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

          {/* https://csswizardry.com/2020/05/the-fastest-google-fonts/ */}
          <link rel="preload" as="style" href={fontsHref} />
          <link
            rel="stylesheet"
            href={fontsHref}
            media="print"
            // @ts-ignore
            onLoad="this.media='all'"
            // TODO: https://github.com/vercel/next.js/issues/12984
          />
          <noscript>
            <link rel="stylesheet" href={fontsHref} />
          </noscript>
          <link href={fontsHref} rel="stylesheet" />
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          />
          {/* eslint-disable react/no-danger */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-T58QC9G');
              `
            }}
          />
          {/* eslint-enable react/no-danger */}
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window,document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');

                fbq('init', ${FB_PIXEL_ID});
              `,
            }}
          />
          <noscript>
            {/* eslint-disable jsx-a11y/alt-text */}
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
            />
            {/* eslint-enable jsx-a11y/alt-text */}
          </noscript>
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
          <meta name="msapplication-TileColor" content="#ffc40d" />
          <meta name="theme-color" content="#ffffff"></meta>
        </Head>
        <body>
          <noscript>
            <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T58QC9G" height="0" width="0" style="display:none;visibility:hidden"></iframe>
          </noscript>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
