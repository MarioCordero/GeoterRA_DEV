/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Define tu color naranja (#F39C29) directamente
        'geoterra-orange': '#F39C29',
        
        // O usando RGB (para controlar opacidad)
        'geoterra-orange-rgb': 'rgb(243, 156, 41)',
      },
    },
  },
  plugins: [],
}