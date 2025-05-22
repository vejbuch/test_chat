/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./lib/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        muted: "#f5f5f5"
      },
      height: {
        "90vh": "90vh"
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
};
