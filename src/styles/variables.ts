export const color = {
  primary: '#fff',
  secondary: '#868687',
}

const fontFamily = (family) => `font-family: ${family}`
const fontWeight = (weight) => `font-weight: ${weight};`

export const font = {
  baseFamily: 'font-family: Impact, Arial, sans-serif',
  Teko: fontFamily('Teko'),
  montserratFamily: 'font-family: Montserrat',
  Montserrat: fontFamily('Montserrat'),
  regular: fontWeight(400),
  semibold: fontWeight(600),
  bold: fontWeight(700),
}

export const background = {
  main: '#0D0D10',
}

export const sizes = {
  container: {
    maxWidth: 1440,
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

export const hex2Rgba = (hex, alpha) => {
  const r = parseInt(hex.substring(1, 3), 16)
  const g = parseInt(hex.substring(3, 5), 16)
  const b = parseInt(hex.substring(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
