// tailwind.config.ts — CR AudioViz AI Official Brand Colors
// Navy #1E3A5F | Candy Apple Red #FF0800 | Cyan #00B4D8
// Locked: January 2026 · VERSION 3.0 FINAL
import type { Config } from "tailwindcss"
const config: Config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // PRIMARY — Navy Blue (from logo circle)
        navy: {
          50:  '#F0F3F7',
          100: '#D9E1EB',
          200: '#B3C3D7',
          300: '#8CA5C3',
          400: '#6687AF',
          500: '#3F699B',
          600: '#1E3A5F',  // PRIMARY
          700: '#172D48',
          800: '#0F1F32',
          900: '#08121B',
          950: '#040912',
        },
        // ACCENT — Candy Apple Red (CTA, energy)
        brand: {
          red:   '#FF0800',
          navy:  '#1E3A5F',
          cyan:  '#00B4D8',
        },
        red: {
          50:  '#FFF0F0',
          100: '#FFD9D9',
          200: '#FFB3B3',
          300: '#FF8080',
          400: '#FF4040',
          500: '#FF1A1A',
          600: '#FF0800',  // CANDY APPLE RED
          700: '#CC0600',
          800: '#990400',
          900: '#660300',
          950: '#330100',
        },
        // SECONDARY — Cyan (from logo bars)
        cyan: {
          50:  '#E6F7FB',
          100: '#CCEFF7',
          200: '#99DFEF',
          300: '#66CFE7',
          400: '#33BFDF',
          500: '#00B4D8',  // SECONDARY
          600: '#0090AD',
          700: '#006C82',
          800: '#004856',
          900: '#00242B',
          950: '#001216',
        },
      },
      backgroundImage: {
        'brand-primary': 'linear-gradient(135deg, #1E3A5F 0%, #00B4D8 100%)',
        'brand-accent':  'linear-gradient(135deg, #1E3A5F 0%, #FF0800 100%)',
        'brand-hero':    'linear-gradient(135deg, #1E3A5F 0%, #00B4D8 50%, #FF0800 100%)',
      },
    },
  },
  plugins: [],
}
export default config
