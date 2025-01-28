/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7C3AED',
          dark: '#6D28D9',
          light: '#8B5CF6'
        },
        secondary: {
          DEFAULT: '#F5E6D3',
          dark: '#E7D5BE',
          light: '#FFF1E5'
        }
      }
    },
  },
  plugins: [],
};