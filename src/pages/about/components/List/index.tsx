import React from 'react'
import styled from 'styled-components'

import { mq } from '~/styles/mq'
import { color, font } from '~/styles/variables'

export const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

const Li = styled.li``

const Title = styled.h3`
  text-transform: uppercase;
  font-size: 3rem;
  ${mq.tablet} {
    font-size: 4rem;
  }

  line-height: 1;
  ${font.Teko};
  ${font.semibold};
  color: ${color.secondary};
  margin: 0;
  padding: 10px 0;
  transition: 0.2s color;

  &:hover {
    color: #fff;
  }
`

// eslint-disable-next-line react/prop-types
export const ListItem = ({ children }) => (
  <Li>
    <Title>{children}</Title>
  </Li>
)
