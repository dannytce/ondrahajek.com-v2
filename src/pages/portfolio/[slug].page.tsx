import React from 'react'
import ErrorPage from 'next/error'
import { GetStaticProps, GetStaticPaths, InferGetStaticPropsType } from 'next'
import { useRouter } from 'next/router'

import { getAllPortfoliosWithSlug } from '~/api'

import { Home } from '../index.page'

export { getStaticProps } from '../index.page'

export async function getStaticPaths() {
  const portfolios = await getAllPortfoliosWithSlug()
  return {
    paths: portfolios.map((portfolio) => `/portfolio/${portfolio.slug}`),
    fallback: true,
  }
}

export default function PortfolioPage({ portfolios }) {
  const router = useRouter()

  const { slug } = router.query

  // if (!router.isFallback && !portfolio) {
  //   return <ErrorPage statusCode={404} />
  // }

  return <Home portfolios={portfolios} slug={slug} />

  // return <Home portfolioUrl={portfolio} />
}
