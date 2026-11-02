/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./assets/**/*.js"],
  theme: {
    extend: {
      screens: {
        '3xl': '1600px',
      },
      colors: {
        ivory: '#FBF8F3',
        espresso: '#2B2420',
        muted: '#6B5F4F',
        gold: { light: '#D9BE8E', DEFAULT: '#B08D57', dark: '#8C6D3F' },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      backgroundImage: {
        'gold-metallic': 'linear-gradient(180deg, #FFF5E4 0%, #E2BA7D 45%, #B28243 100%)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(18px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease-out forwards',
      },
    },
  },
  plugins: [],
};
