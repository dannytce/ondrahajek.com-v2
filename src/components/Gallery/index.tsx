import React, { FC } from 'react'
import { Image } from 'react-datocms'

import { FileField } from '~/api/generated/types'

import { Wrapper, Figure, Figcaption, Description } from './styled'

type Props = {
  photos: FileField[]
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
