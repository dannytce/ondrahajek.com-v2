import styled from 'styled-components'

import { mq } from '~/styles/mq'
import { color, font } from '~/styles/variables'

export const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 20px 20px;
  width: 100%;
  grid-template-columns: 1fr;
  ${mq.tablet} {
    grid-template-columns: 1fr 1fr;
  }
  ${mq.desktop} {
    grid-template-columns: 1fr 1fr 1fr;
  }
`

export const ListItem = styled.li``

export const ImageWrapper = styled.div`
  position: relative;
  z-index: -1;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000;
    opacity: 0.25;
    z-index: 1;
    transition: opacity 0.2s;
  }
`

export const Title = styled.h3`
  color: #fff;
  font-size: 2.4rem;

  ${mq.phoneSmall} {
    font-size: 2.6rem;
  }
  ${mq.tablet} {
    font-size: 3rem;
  }
  ${mq.desktop} {
    font-size: 4rem;
  }

  ${font.Teko};
  ${font.semibold};
  text-transform: uppercase;
  margin-top: -0.5em;
  line-height: 1;
  margin-left: 20px;
  position: relative;
  z-index: 1;
  transition: opacity 0.2s;
`

export const Description = styled.h4`
  color: ${color.secondary};
  font-size: 1.5rem;
  ${font.regular};
  margin-top: -1.4em;
  ${mq.tablet} {
    margin-top: -1.8em;
  }
  ${mq.desktop} {
    margin-top: -2.5em;
  }

  margin-left: 20px;
  position: relative;
  z-index: 1;
  transition: opacity 0.2s;
`

export const Link = styled.a`
  display: block;
  width: 100%;
  position: relative;
  text-decoration: none;

  &:hover {
    /* stylelint-disable  */
    ${ImageWrapper}::before {
      opacity: 0;
    }

    ${Title}, ${Description} {
      opacity: 0.25;
    }
    /* stylelint-enable  */
  }
`
