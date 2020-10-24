import React from 'react'
import { InferGetStaticPropsType } from 'next'

import { Page } from '~/components/Page'
import { Portfolio } from '~/components/Portfolio'
import { getAllPortfolios, getHeaderBackgroundByPage } from '~/api'

export async function getStaticProps() {
  const portfolios = await getAllPortfolios()
  const headerBackground = await getHeaderBackgroundByPage('/')

  return {
    props: {
      portfolios: portfolios || [],
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
      <Portfolio portfolios={portfolios} slug={slug} />
    </Page>
  )
}

export default Home
