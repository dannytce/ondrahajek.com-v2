import React from 'react'
import { InferGetStaticPropsType } from 'next'
import Head from 'next/head'

import { Page } from '~/components/Page'
import { Portfolio } from '~/components/Portfolio'
import { getAllPortfolios, getHeaderBackgroundByPage } from '~/api'

export async function getStaticProps() {
  const portfolios = await getAllPortfolios()
  const headerBackground = await getHeaderBackgroundByPage('/')

  return {
    props: {
      portfolios,
      headerBackground,
    },
  }
}

export const Home = ({
  portfolios,
  headerBackground,
  slug,
}: { slug: string } & InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <Page
      title="Aerial"
      subTitle="Video, Photography"
      headerBackground={headerBackground}
      isHomepage
    >
      <Head>
        <title>ondrahajek.com | AERIAL Video & Photography</title>
        <meta
          property="og:title"
          content="ondrahajek.com | AERIAL Video & Photography"
        />
      </Head>
      <Portfolio portfolios={portfolios} slug={slug} />
    </Page>
  )
}

export default Home
