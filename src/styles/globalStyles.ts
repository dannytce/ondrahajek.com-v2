import styledSanitize from 'styled-sanitize'
import { createGlobalStyle } from 'styled-components'

import { color, background, font, sizes } from './variables'

export const GlobalStyle = createGlobalStyle`
  ${styledSanitize}

  html {
    font-size: 62.5%;
    width: 100%;
    overflow-x: hidden;
  }

  body {
    margin: 0;
    background-color: ${background.main};
    color: ${color.primary};
    font-size: 1.8rem;
    ${font.baseFamily};
    padding-top: ${sizes.header.height};
  }
`
