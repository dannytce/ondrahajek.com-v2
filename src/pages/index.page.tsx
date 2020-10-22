import React from 'react'
import { InferGetStaticPropsType } from 'next'

import { Page } from '~/components/Page'
import { Portfolio } from '~/components/Portfolio'
import { getAllPortfolios } from '~/api'

export async function getStaticProps() {
  const portfolios = await getAllPortfolios()

  return {
    props: {
      portfolios: portfolios || [],
    },
  }
}

export const Home = ({
  portfolios,
  slug,
}: { slug: string } & InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <Page title="Aerial" subTitle="Video, Photography" isHomepage>
      <Portfolio portfolios={portfolios} slug={slug} />
    </Page>
  )
}

export default Home
