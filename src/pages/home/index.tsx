import React from 'react'
import { NextPage } from 'next'

import { Page } from '~/components/Page'
import { Portfolio } from '~/components/Portfolio'

type iProps = {
  portfolioUrl?: string
}

export const Home: NextPage<iProps> = ({ portfolioUrl = '' }) => {
  return (
    <Page title="Aerial" subTitle="Video, Photography" isHomepage>
      <Portfolio portfolioUrl={portfolioUrl} />
    </Page>
  )
}
