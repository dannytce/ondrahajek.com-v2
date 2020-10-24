import React from 'react'
import type { AppProps } from 'next/app'
import { Head } from 'next/head'

const App: React.FC<AppProps> = ({ Component, pageProps }) => (
  <>
    <Head>
      <title>ondrahajek.com</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <Component {...pageProps} />
  </>
)

export default App
