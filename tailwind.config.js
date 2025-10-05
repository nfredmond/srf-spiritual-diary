/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        srf: {
          blue: '#1E4B87',
          gold: '#D4AF37',
          white: '#F8F6F1',
          lotus: '#E8D5C4',
          sky: '#A8C9E8',
          earth: '#8B7355',
        },
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        quote: ['"Crimson Text"', 'serif'],
      },
    },
  },
  plugins: [],
}

