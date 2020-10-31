import React, { FC } from 'react'
import styled from 'styled-components'

import { mq } from '~/styles/mq'
import { font } from '~/styles/variables'

export const NumbersList = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
  ${mq.tablet} {
    display: flex;
    justify-content: space-around;
  }
`

const Li = styled.li`
  flex: 1;
`

const Title = styled.h3`
  text-transform: uppercase;
  ${font.Teko};
  color: #49494b;
  font-size: 2rem;
  ${mq.tablet} {
    font-size: 3rem;
  }
  ${mq.desktop} {
    font-size: 4rem;
  }

  strong {
    color: #fff;
    display: block;
    line-height: 1;
    font-size: 6rem;

    ${mq.phone} {
      font-size: 7rem;
      line-height: 1.25;
    }

    ${mq.tablet} {
      font-size: 8rem;
    }
    ${mq.desktop} {
      font-size: 10rem;
      line-height: 1.35;
    }

    ${mq.desktopWide} {
      font-size: 12rem;
    }

    span {
      font-size: 5rem;
    }
  }
`

export const NumbersListItem: FC = ({ children }) => (
  <Li>
    <Title>{children}</Title>
  </Li>
)
