/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette
        gunmetal: '#012A36',
        'space-cadet': '#29274C',
        'royal-purple': '#7E52A0',
        lilac: '#D295BF',
        'fairy-tale': '#E6BCCD',
      },
      screens: {
        'xs': '475px',
        // => @media (min-width: 475px) { ... }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      minHeight: {
        '44': '44px', // Minimum touch target size
      },
      minWidth: {
        '44': '44px', // Minimum touch target size
      },
    },
  },
  plugins: [],
}
