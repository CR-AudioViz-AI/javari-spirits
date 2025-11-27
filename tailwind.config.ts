import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        barrel: {
          50: '#fdf8f3',
          100: '#f9ede0',
          200: '#f2d7be',
          300: '#e9bb93',
          400: '#de9560',
          500: '#d57a3e',
          600: '#c76233',
          700: '#a54c2c',
          800: '#853f2a',
          900: '#6c3525',
        },
        whiskey: {
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
      },
    },
  },
  plugins: [],
}
export default config
