import React from 'react'
import styled, { css } from 'styled-components'

import { Container } from '~/components/Page/styled'
import { font, zIndex, sizes } from '~/styles/variables'
import { mq } from '~/styles/mq'

const backgroundImage = ({ title }) =>
  css`
    background-image: url('/header-${title}.jpg');
  `

export const StyledHeader = styled(({ title, ...rest }) => (
  <header {...rest} />
))`
  top: 0;
  width: 100%;
  height: ${sizes.header.height};
  background: url('/header-Aerial.jpg') no-repeat top center;
  ${backgroundImage};
  background-attachment: fixed;
  background-size: cover;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: fixed;
  z-index: ${zIndex.header};

  ${Container} {
    width: 100%;
    position: relative;
    z-index: ${zIndex.headerContainer};
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: center;

    ${mq.tablet} {
      flex: 0;
      justify-content: flex-start;
      flex-direction: row;
    }
  }
`

export const HeaderGroup = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`

export const H1 = styled.h1`
  font-size: 6rem;
  ${mq.tablet} {
    font-size: 10rem;
  }

  ${font.Teko};
  ${font.semibold};

  text-transform: uppercase;
  margin: 0;
  padding: 0;
`

export const H2 = styled.h2`
  font-size: 1.8rem;
  ${font.regular};
  margin: -1em 0 0;
  padding: 0;
  color: rgba(255, 255, 255, 0.6);
`

export const VideoContainer = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: ${zIndex.video};
`

export const Iframe = styled.iframe`
  box-sizing: border-box;
  height: 56.25vw;
  left: 50%;
  min-height: 100%;
  min-width: 100%;
  transform: translate(-50%, -50%);
  position: absolute;
  top: 50%;
  width: 177.77777778vh;
  pointer-events: none;
`

export const Video = Iframe.withComponent('video')
