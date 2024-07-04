/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      spacing: {
        256: '64rem',
      }
    },
  },
  plugins: [
    require('daisyui'),
  ],
}

