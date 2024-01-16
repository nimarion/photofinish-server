import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tourLightOrange': '#ff8040',
        'tourDarkBlue': '#293847',
        'tourOrange': '#fa4517',
        'tourRed': '#d12630'
      },
      fontFamily: {
        'wa-bold': ['wa-bold'],
        'wa-regular': ['wa-regular'],
        'wa-headline': ['wa-headline'],
      },
    },
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
} satisfies Config

