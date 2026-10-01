/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Fonts are loaded in src/app/layout.tsx (next/font) and exposed as CSS variables.
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...defaultTheme.fontFamily.mono],
        // Problem statements: set like a journal problem
        serif: ["var(--font-serif)", "Georgia", ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [],
};
