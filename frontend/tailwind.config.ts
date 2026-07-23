import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f4c81',
          light: '#1a6cb0',
          dark: '#0a3660',
          50: '#e8f0fa',
          100: '#c5d8f0',
          200: '#9ebfe6',
          300: '#77a6dc',
          400: '#5991d4',
          500: '#0f4c81',
          600: '#0d4272',
          700: '#0a3660',
          800: '#082b4e',
          900: '#05203c',
        },
        accent: {
          DEFAULT: '#00d4aa',
          light: '#00f0c4',
          dark: '#00a884',
        },
        surface: {
          DEFAULT: '#161b22',
          light: '#1c2128',
          dark: '#0d1117',
          card: '#21262d',
        },
        'border-color': {
          DEFAULT: '#30363d',
          light: '#484f58',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideIn: { '0%': { transform: 'translateY(-10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 5px rgba(0,212,170,0.3)' }, '50%': { boxShadow: '0 0 20px rgba(0,212,170,0.7)' } },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-dark': 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config
