import React from 'react'
import { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'

import allPortfolios from '~/components/Portfolio/data'

import { Home } from '../home'

function PortfolioPage() {
  const router = useRouter()
  const { portfolioUrl }: { portfolioUrl?: string } = router.query

  return <Home portfolioUrl={portfolioUrl} />
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  return { props: { portfolioUrl: params?.portfolioUrl } }
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: allPortfolios.map((portfolio) => `/portfolio/${portfolio.href}`),
    fallback: true,
  }
}

export default PortfolioPage
