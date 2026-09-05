/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#FDFBF7',
          100: '#FAF6EF',
          200: '#F3ECE0',
          300: '#E7DCB9',
          400: '#D5C4A1',
          500: '#B8A375',
        },
        primary: {
          50: '#FDF4FF',
          100: '#FAE8FF',
          200: '#F5D0FE',
          300: '#F0ABFC',
          400: '#E879F9',
          500: '#D946EF',
          600: '#C026D3',
          700: '#A21CAF',
        },
        festive: {
          amber: '#F59E0B',
          orange: '#F97316',
          coral: '#FB7185',
          rose: '#F43F5E',
          purple: '#8B5CF6',
          indigo: '#6366F1',
          teal: '#14B8A6',
          emerald: '#10B981',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(139, 92, 246, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'soft-hover': '0 12px 32px -4px rgba(139, 92, 246, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
        'glow-primary': '0 0 25px -5px rgba(192, 38, 211, 0.3)',
        'glow-festive': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
      },
      animation: {
        'bounce-subtle': 'bounce-subtle 2s infinite ease-in-out',
        'pulse-glow': 'pulse-glow 2.5s infinite ease-in-out',
      },
      keyframes: {
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        }
      }
    },
  },
  plugins: [],
}
