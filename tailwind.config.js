/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1D4ED8", // Example blue
        secondary: "#64748B",
        bg: "#F8FAFC",
        surface: "#FFFFFF",
      },
    },
  },
  plugins: [],
}
