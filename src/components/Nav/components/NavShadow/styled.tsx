import styled from 'styled-components'

import { background, hex2Rgba } from '~/styles/variables'

export const StyledShadow = styled.div`
  position: absolute;
  top: -63px;
  width: 100%;
  height: 250px;
  z-index: -1;
  pointer-events: none;
  /* stylelint-disable declaration-colon-newline-after */
  background: linear-gradient(
    to bottom,
    ${hex2Rgba(background.main, 100)},
    ${hex2Rgba(background.main, 0)}
  );
  /* stylelint-enable */
`
