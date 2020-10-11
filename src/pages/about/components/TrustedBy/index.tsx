import React from 'react'

import { Container } from '~/components/Page/styled'

import { Wrapper, Title, List, ListItem } from './styled'

export const TrustedBy = () => (
  <Wrapper>
    <Container>
      <Title>Trusted by</Title>

      <List>
        <ListItem>
          <img src="/logos/jagermaister.svg" alt="Jagermaister" />
        </ListItem>
        <ListItem>
          <img src="/logos/lexus.svg" alt="Lexus" />
        </ListItem>
        <ListItem>
          <img src="/logos/vans.svg" alt="Vans" />
        </ListItem>
        <ListItem>
          <img src="/logos/jameson.svg" alt="Jameson" />
        </ListItem>
        <ListItem>
          <img src="/logos/skoda.svg" alt="Škoda Auto" />
        </ListItem>
        <ListItem>
          <img
            src="/logos/dawson.png"
            srcSet="/logos/dawson.png 1x, /logos/dawson@2x.png 2x"
            width="108"
            height="32"
            alt="Dawson"
          />
        </ListItem>
        <ListItem>
          <img
            src="/logos/bubble.png"
            srcSet="/logos/bubble.png 1x, /logos/bubble@2x.png 2x"
            width="67"
            height="67"
            alt="Bubble"
          />
        </ListItem>
        <ListItem>
          <img
            src="/logos/etnetera.png"
            srcSet="/logos/etnetera.png 1x, /logos/etnetera@2x.png 2x"
            width="89"
            height="44"
            alt="Etnetera & Motion"
          />
        </ListItem>
        <ListItem>
          <img src="/logos/cd.svg" alt="České dráhy" />
        </ListItem>
      </List>
    </Container>
  </Wrapper>
)
