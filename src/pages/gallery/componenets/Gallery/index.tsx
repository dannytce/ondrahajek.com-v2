import React from 'react'

import { Wrapper, Figure, Figcaption, Img, Description } from './styled'
import { galleryItems } from './data'

export const Gallery = () => (
  <Wrapper>
    {galleryItems.map((item, key) => (
      // eslint-disable-next-line react/no-array-index-key
      <Figure key={key}>
        <Img src={item.src} alt="" />
        <Figcaption>{item.caption}</Figcaption>
        <Description>{item.description}</Description>
      </Figure>
    ))}
  </Wrapper>
)
