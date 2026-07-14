import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF',
        secondary: '#F1F2F6',
        accent: '#E11D49',
      },
      spacing: {
        '150': '37.5rem',
        '200': '50rem',
      },
      fontSize: {
        'title-lg': '2.125rem',
        'body-sm': '0.875rem',
      },
      borderRadius: {
        'lg': '0.75rem',
        'full': '9999px',
      },
      keyframes: {
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'spin-slow': 'spin-slow 15s linear infinite',
      },
    },
  },
  plugins: [forms, typography],
}