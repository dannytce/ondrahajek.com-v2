import React from 'react'

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

export const GalleryPage = ({ photos = [], headerBackground }) => (
  <Page title="Gallery" headerBackground={headerBackground}>
    <Gallery photos={photos} />
  </Page>
)

export default GalleryPage
