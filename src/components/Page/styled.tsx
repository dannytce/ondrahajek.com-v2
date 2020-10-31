import styled from 'styled-components'

import { background, sizes, zIndex, hex2Rgba } from '~/styles/variables'
import { mq } from '~/styles/mq'

export const Container = styled.div`
  width: 100%;
  max-width: ${sizes.container.maxWidth}px;
  margin: 0 auto;
  padding: 0 15px;
  ${mq.desktopWide} {
    padding: 0;
  }
`

export const Main = styled.main`
  position: relative;
  z-index: ${zIndex.main};
  background: ${background.main};

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 2px;
    width: 100%;
    height: 45vh;
    transform: translateY(-100%);
    pointer-events: none;
    background: linear-gradient(
      to bottom,
      ${hex2Rgba(background.main, 0)},
      ${hex2Rgba(background.main, 100)}
    );
  }
`
