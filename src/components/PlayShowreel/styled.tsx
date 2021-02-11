import React, { FC } from 'react'
import styled, { keyframes } from 'styled-components'

import { mq } from '~/styles/mq'
import { font } from '~/styles/variables'

export const PlayShowreelWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 125px 0 -125px;

  ${mq.tablet} {
    flex: 1;
    margin: 0;
  }
`

export const PlayIcon: FC = (props) => (
  <svg width="14" height="16" viewBox="0 0 14 16" {...props}>
    <path
      d="M1.50389526,0.136099186 L13.5032156,7.13615397 L13.5032156,7.13615397 C13.9802597,7.41444764 14.1413788,8.02676989 13.8630851,8.50381399 C13.7761718,8.65279876 13.6522004,8.77677011 13.5032156,8.8636835 L1.50389526,15.8637383 L1.50389526,15.8637383 C1.02685115,16.1420319 0.414528904,15.9809129 0.136235236,15.5038688 C0.0470134485,15.350927 -5.14889621e-16,15.1770377 -2.22044605e-16,14.9999735 L0,0.99986395 L-4.4408921e-16,0.99986395 C-2.66460887e-16,0.4475792 0.44771525,-0.000136050417 1,-0.000136050417 C1.17706415,-0.000136050417 1.35095348,0.0468773981 1.50389526,0.136099186 Z"
      fill="#212327"
      fillRule="evenodd"
    />
  </svg>
)

export const StyledPlayIcon = styled(PlayIcon)`
  margin-left: 5px;
`

export const Circle = styled.span`
  position: relative;
  display: flex;
  text-align: center;
  width: 70px;
  height: 70px;
  margin-right: 25px;
  padding-right: 2px;
  border-radius: 70px;
  background: #fff;
  border: 8px solid rgba(255, 255, 255, 0.2);
  background-clip: padding-box;
  transition: 0.8s all;
  align-items: center;
  justify-content: center;
`

export const circleExpand = keyframes`
  0% {
    transform: scale(0, 0);
    opacity: 1;
  }

  95% {
    transform: scale(3.75, 3.75);
    opacity: 0.1;
  }

  100% {
    transform: scale(4, 4);
    opacity: 0;
  }
`

export const BeaconCircle = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  height: 40px;
  width: 40px;
  margin-left: -20px;
  margin-top: -20px;
  z-index: -1;

  ${mq.tablet} {
    height: 80px;
    width: 80px;
    margin-left: -40px;
    margin-top: -40px;
    opacity: 0;
    animation: ${circleExpand} 4s linear 0s infinite;

    &:nth-of-type(2) {
      animation: ${circleExpand} 4s linear 2s infinite;
    }
  }
`

export const A = styled.a`
  color: #fff;
  ${font.bold};
  ${font.Teko};
  text-transform: uppercase;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  padding: 0;

  ${mq.tablet} {
    padding: 50px;
  }

  ${mq.tablet} {
    &:hover {
      ${Circle} {
        border-color: rgba(255, 255, 255, 0.8);
      }
    }
  }
`
