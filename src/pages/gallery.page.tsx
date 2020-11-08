import React from 'react'
import { InferGetStaticPropsType } from 'next'
import Head from 'next/head'

import { Page } from '~/components/Page'
import { Gallery } from '~/components/Gallery'
import { getGallery, getHeaderBackgroundByPage } from '~/api'

export async function getStaticProps() {
  const photos = await getGallery()
  const headerBackground = await getHeaderBackgroundByPage('/gallery')

  return {
    props: {
      photos,
      headerBackground,
    },
  }
}

export const GalleryPage = ({
  photos,
  headerBackground,
}: InferGetStaticPropsType<typeof getStaticProps>) => (
  <Page title="Gallery" headerBackground={headerBackground}>
    <Head>
      <title>Gallery - ondrahajek.com | AERIAL Video & Photography</title>
      <meta
        property="og:title"
        content="Gallery - ondrahajek.com | AERIAL Video & Photography"
      />
    </Head>
    <Gallery photos={photos} />
  </Page>
)

export default GalleryPage
