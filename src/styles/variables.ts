import { css } from 'styled-components'

export const color = {
  primary: '#fff',
  secondary: '#868687',
}

const fontFamily = (family: string) => `font-family: ${family}`
const fontWeight = (weight: number) => `font-weight: ${weight};`

export const font = {
  baseFamily: 'font-family: Roboto, Impact, Arial, sans-serif',
  Teko: fontFamily('Teko'),
  Roboto: fontFamily('Roboto'),
  regular: fontWeight(400),
  semibold: fontWeight(600),
  bold: fontWeight(700),
}

export const background = {
  main: '#0D0D10',
}

export const sizes = {
  container: {
    maxWidth: 1294,
  },
  header: {
    height: '90vh',
  },
}

export enum ScreenSize {
  XS = 400,
  SM = 500,
  MD = 768,
  D = 1080,
  XL = sizes.container.maxWidth,
}

export const zIndex = {
  modalCloseButton: 600,
  modal: 500,
  nav: 100,
  trustedBy: 3,
  headerContainer: 2,
  header: 1,
  main: 1,
  video: -1,
}

export const hex2Rgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.substring(1, 3), 16)
  const g = parseInt(hex.substring(3, 5), 16)
  const b = parseInt(hex.substring(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const linkAnimation = (transitionDuration: number = 275) => css`
  /*
    https://css-tricks.com/4-ways-to-animate-the-color-of-a-text-link-on-hover/
  */
  background: linear-gradient(to right, #ddd, #ddd 50%, #fff 50%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 100%;
  background-position: 100%;
  transition: background-position ${transitionDuration}ms ease;

  &:hover,
  &.active {
    background-position: 0 100%;
  }
`
