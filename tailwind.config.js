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
    },
  },
  plugins: [],
}
