/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6", // Blue-500
        secondary: "#64748B",
        bg: "#E3EDF7", // Bright Neumorphic Blue
        surface: "#E3EDF7",
      },
      boxShadow: {
        'neu-flat': '6px 6px 12px #94a3b8, -6px -6px 12px #ffffff',
        'neu-pressed': 'inset 5px 5px 10px #94a3b8, inset -5px -5px 10px #ffffff',
        'neu-icon': '4px 4px 8px #94a3b8, -4px -4px 8px #ffffff',
        'neu-button': '5px 5px 10px #b0c4de, -5px -5px 10px #ffffff',
      },
    },
  },
  plugins: [],
}
