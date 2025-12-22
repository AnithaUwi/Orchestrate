/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#0f36a5',
          600: '#0d2e8c',
          700: '#0b2573',
        },
        accent: {
          500: '#f24d12',
          600: '#e3390a',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          500: '#6b7280',
          700: '#374151',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Source Sans Pro', 'sans-serif'],
      },
      borderRadius: {
        'sm': '0.125rem',
        'lg': '0.5rem',
      }
    },
  },
  plugins: [],
}