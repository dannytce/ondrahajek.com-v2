import React from 'react'
import { Image } from 'react-datocms'

import { Wrapper, Figure, Figcaption, Description } from './styled'

export const Gallery = ({ photos }) => (
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
