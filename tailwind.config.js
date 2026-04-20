/** @type {import('tailwindcss').Config} */
export default {
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}", // Esto le dice: "busca en toda la carpeta src"
],
  theme: {
    extend: {

      fontFamily: {
        // Aquí le decimos que reemplace la fuente normal (sans) por Poppins
        sans: ['Montserrat', 'sans-serif'],
        // Y que reemplace la fuente de títulos (serif) por Playfair Display
        serif: ['"Montserrat"', 'serif'],

      },
      
    },
  },
  plugins: [],
}