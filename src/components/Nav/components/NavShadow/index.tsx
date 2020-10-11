import React, { Component } from 'react'

import { StyledShadow } from './styled'

// TODO: refactor to IntersectionObserver
class NavShadow extends Component {
  state = {
    opacity: 0,
  }

  componentDidMount() {
    document.addEventListener('scroll', this.handleScroll)
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll = () => {
    requestAnimationFrame(this.updateOpacity)
  }

  updateOpacity = () => {
    const headerHeight = document.documentElement.clientHeight * 0.9

    let opacity = window.pageYOffset / headerHeight

    if (opacity > 1) {
      opacity = 1
    }

    this.setState({ opacity })
  }

  render() {
    const { opacity } = this.state

    return <StyledShadow style={{ opacity }} />
  }
}

export default NavShadow
