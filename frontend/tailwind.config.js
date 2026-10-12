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
        dark: {
          bg: '#05090D',
          secondary: '#0A1118',
          sidebar: '#080E13',
          card: '#0D171F',
          elevated: '#111F28',
        },
        brand: {
          emerald: '#00D084',
          teal: '#21E6C1',
          warning: '#FFB547',
          critical: '#FF5C68',
        },
        text: {
          primary: '#F4F7FA',
          secondary: '#9BAAB6',
        },
        border: {
          dark: '#203039',
        },
        medinova: {
          emerald: '#00D084',
          teal: '#21E6C1',
          cyan: '#06b6d4',
          accent: '#00D084',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 208, 132, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(33, 230, 193, 0.16)',
        'orb': '0 0 50px rgba(0, 208, 132, 0.35)',
        'glow-emerald': '0 0 25px rgba(0, 208, 132, 0.4)',
        'glow-teal': '0 0 25px rgba(33, 230, 193, 0.4)',
        'glow-cyan': '0 0 25px rgba(6, 182, 212, 0.4)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.6), 0 0 0 1px #203039',
      },
      keyframes: {
        'blob-float': {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
        'scan-laser': {
          '0%': { top: '0%' },
          '50%': { top: '95%' },
          '100%': { top: '0%' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'heartbeat': {
          '0%, 100%': { transform: 'scale(1)' },
          '15%': { transform: 'scale(1.12)' },
          '30%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.08)' },
          '60%': { transform: 'scale(1)' },
        }
      },
      animation: {
        'blob-1': 'blob-float 16s ease-in-out infinite',
        'blob-2': 'blob-float 20s ease-in-out 4s infinite reverse',
        'blob-3': 'blob-float 18s ease-in-out 2s infinite',
        'scan-laser': 'scan-laser 2.5s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'heartbeat': 'heartbeat 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
