import React, { FC } from 'react'
import { Image } from 'react-datocms'

import { Wrapper, Figure, Figcaption, Description } from './styled'

import { ResponsiveImage } from 'next-env'

type Photo = {
  id: string
  responsiveImage: ResponsiveImage
  alt: string
  title: string
  smartTags: string[]
}

type Props = {
  photos: Photo[]
}

export const Gallery: FC<Props> = ({ photos }) => (
  <Wrapper>
    {photos.map((item) => (
      <Figure key={item.id}>
        <Image
          data={{
            ...item.responsiveImage,
            alt: `${item.smartTags}`,
          }}
        />
        <Figcaption>{item.title}</Figcaption>
        <Description>{item.alt}</Description>
      </Figure>
    ))}
  </Wrapper>
)
