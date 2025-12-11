/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0361f0',
        'primary-dark': '#024bb8',
        'primary-light': '#3584f3',
      },
    },
  },
  plugins: [],
}
