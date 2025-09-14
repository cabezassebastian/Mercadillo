/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Habilitar modo oscuro por clase
  theme: {
    extend: {
      colors: {
        amarillo: '#FFD700',
        dorado: '#b8860b',
        blanco: '#ffffff',
        hueso: '#f8f9fa',
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


