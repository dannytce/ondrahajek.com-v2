import styled from 'styled-components'

export const Wrapper = styled.div`
  height: 100%;
`

export const VideoContainer = styled.div`
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;
  position: relative;
`

export const Iframe = styled.iframe`
  position: absolute;
  width: 100%;
  height: 100%;
  max-height: calc(100vh - 120px);
  top: 0;
  left: 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.75);
`
