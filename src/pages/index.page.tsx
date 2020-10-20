import React from 'react'
import { NextPage, InferGetStaticPropsType } from 'next'

import { Page } from '~/components/Page'
import { Portfolio } from '~/components/Portfolio'
import { getAllPortfolios } from '~/api'

export async function getStaticProps() {
  const portfolios = await getAllPortfolios()

  return {
    props: {
      portfolios,
    },
  }
}

const Home = ({
  portfolios,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <Page title="Aerial" subTitle="Video, Photography" isHomepage>
      <Portfolio portfolios={portfolios} />
    </Page>
  )
}

export default Home
