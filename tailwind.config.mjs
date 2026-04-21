/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#fff',
        secondary: 'rgba(255,255,255,0.8)',
        background: '#0A0A0A',
        'surface-dark': '#0A0A0A',
        'surface-card': '#111111',
        'foreground-primary': '#FFFFFF',
        'foreground-muted': '#888888',
        'foreground-dim': '#555555',
        'border-subtle': '#222222',
        'accent-primary': '#4A9FD8',
      },
      fontFamily: {
        teko: ['Teko', 'sans-serif'],
        roboto: ['Roboto', 'Impact', 'Arial', 'sans-serif'],
        anton: ['Anton', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        geist: ['"Geist Mono"', 'monospace'],
      },
      screens: {
        xs: '25em',
        sm: '31.25em',
        md: '48em',
        lg: '67.5em',
        xl: '82.875em',
      },
      maxWidth: {
        container: '1294px',
      },
      spacing: {
        header: '90vh',
      },
      zIndex: {
        modalCloseButton: '600',
        modal: '500',
        nav: '100',
        trustedBy: '3',
        headerContainer: '2',
        header: '1',
        video: '-1',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.1)' },
          '100%': { transform: 'scale(1)' },
        },
        circleExpand: {
          '0%': { transform: 'scale(0, 0)', opacity: '1' },
          '95%': { transform: 'scale(3.75, 3.75)', opacity: '0.1' },
          '100%': { transform: 'scale(4, 4)', opacity: '0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease forwards',
        scaleIn: 'scaleIn 1s ease-in-out forwards',
        circleExpand: 'circleExpand 4s linear 0s infinite',
      },
    },
  },
  plugins: [],
};
