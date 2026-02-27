/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        background: "#1e1e2e",
        surface: "#2a2a3c",
        border: "#3a3a4c",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "Space Mono", "monospace"],
      },
    },
  },
  plugins: [],
}