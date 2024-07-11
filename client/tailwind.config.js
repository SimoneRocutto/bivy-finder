/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      spacing: {
        128: '32rem',
        256: '64rem',
      }
    },
  },
  plugins: [
    require('daisyui'),
  ],
}

