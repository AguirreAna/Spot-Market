/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B0F19',
          darker: '#070A11',
          card: '#0a1222',
          yellow: '#FFC700',
          red: '#E63946'
        }
      }
    }
  },
  plugins: []
};
