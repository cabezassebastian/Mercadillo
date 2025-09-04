/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amarillo: '#FFD700',
        dorado: '#b8860b',
        blanco: '#ffffff',
        hueso: '#f5f1e9',
        'gris-oscuro': '#333333',
        'gris-claro': '#aaa',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


