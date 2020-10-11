import styled from 'styled-components'

import { mq } from '~/styles/mq'
import { color, font } from '~/styles/variables'

const offset = 10

export const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`

export const ListItem = styled.li`
  width: 100%;
  ${mq.tablet} {
    width: calc(50% - ${2 * offset}px);
    margin: 10px;
  }
  ${mq.desktop} {
    width: calc(33.33333% - ${2 * offset}px);
    max-width: 418px;
  }
`

export const Image = styled.img`
  height: auto;
  width: 100%;
`

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
    background: rgba(0, 0, 0, 0.2);
    z-index: 0;
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
  font-size: 1.8rem;
  ${font.regular};
  margin-top: -1.4em;
  ${mq.tablet} {
    margin-top: -1.8em;
  }
  ${mq.desktop} {
    margin-top: -2em;
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
    ${ImageWrapper}::before {
      opacity: 0;
    }

    /* stylelint-disable  */
    ${Title}, ${Description} {
      opacity: 0.25;
    }
    /* stylelint-enable  */
  }
`
