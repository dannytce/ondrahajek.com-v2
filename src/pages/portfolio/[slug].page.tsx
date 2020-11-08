import React from 'react'
import { InferGetStaticPropsType } from 'next'
import { useRouter } from 'next/router'

import { getAllPortfoliosWithSlug } from '~/api'

import { Home, getStaticProps as homepageGetStaticProps } from '../index.page'

export { getStaticProps } from '../index.page'

export async function getStaticPaths() {
  const portfolios = await getAllPortfoliosWithSlug()
  return {
    paths: portfolios.map((portfolio) => `/portfolio/${portfolio.slug}`),
    fallback: false,
  }
}

export default function PortfolioPage({
  headerBackground,
  portfolios,
}: InferGetStaticPropsType<typeof homepageGetStaticProps>) {
  const router = useRouter()

  const { slug } = router.query

  return (
    <Home
      headerBackground={headerBackground}
      portfolios={portfolios}
      slug={slug as string}
    />
  )
}
