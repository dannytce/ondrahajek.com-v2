import React from 'react'

import { Page } from '~/components/Page'
import { Gallery } from '~/components/Gallery'
import { getGallery } from '~/api'

export async function getStaticProps() {
  const photos = await getGallery()

  return {
    props: {
      photos,
    },
  }
}

export const GalleryPage = ({ photos = [] }) => (
  <Page title="Gallery">
    <Gallery photos={photos} />
  </Page>
)

export default GalleryPage
