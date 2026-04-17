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
        gold: {
          DEFAULT: '#c9a84c',
          light: '#e8c96a',
          dim: '#8a6f30',
          muted: 'rgba(201,168,76,0.12)',
        },
        violet: {
          DEFAULT: '#A855F7',
          dim: '#7c3aed',
          muted: 'rgba(168,85,247,0.12)',
        },
        silver: '#A9A9A9',
        dark: {
          DEFAULT: '#111111',
          2: '#1a1a1a',
          3: '#222222',
          4: '#2a2a2a',
        },
        base: '#0a0a0a',
        onyx: '#0A0A0A',
        card: '#111111',
        border: '#1e1e1e',
        muted: '#555555',
      },
      fontFamily: {
        bebas: ['var(--font-bebas)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #c9a84c 100%)',
      },
    },
  },
  plugins: [],
}

export default config
