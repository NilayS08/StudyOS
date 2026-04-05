/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',   // ← enables dark: utility classes
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef0ff',
          100: '#dde1ff',
          500: '#6B4EFF',
          600: '#5a3de8',
          700: '#4a2fd1',
          900: '#1E1B4B',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}