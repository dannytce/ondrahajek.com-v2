import React from 'react'
import { useRouter } from 'next/router'

import { getAllPortfoliosWithSlug } from '~/api'

import { Home } from '../index.page'

export { getStaticProps } from '../index.page'

export async function getStaticPaths() {
  const portfolios = await getAllPortfoliosWithSlug()
  return {
    paths: portfolios.map((portfolio) => `/portfolio/${portfolio.slug}`) || [],
    fallback: false,
  }
}

export default function PortfolioPage({ portfolios }) {
  const router = useRouter()

  const { slug } = router.query

  return <Home portfolios={portfolios} slug={slug} />
}
