/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");

// Design tokens live in src/app/globals.css as OKLCH channels.
const token = (name) => `oklch(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: token("background"),
        foreground: token("foreground"),
        card: { DEFAULT: token("card"), foreground: token("card-foreground") },
        popover: { DEFAULT: token("popover"), foreground: token("popover-foreground") },
        primary: { DEFAULT: token("primary"), foreground: token("primary-foreground") },
        secondary: { DEFAULT: token("secondary"), foreground: token("secondary-foreground") },
        muted: { DEFAULT: token("muted"), foreground: token("muted-foreground") },
        accent: { DEFAULT: token("accent"), foreground: token("accent-foreground") },
        destructive: { DEFAULT: token("destructive") },
        border: token("border"),
        input: token("input"),
        ring: token("ring"),
        brand: token("brand"),
      },
      borderRadius: {
        xs: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(15 23 42 / 0.05)",
      },
      // Fonts are loaded in src/app/layout.tsx (next/font) and exposed as CSS variables.
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...defaultTheme.fontFamily.mono],
        // Problem statements and editorial headings
        serif: ["var(--font-serif)", "Georgia", ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [
    // Tailwind 4 utilities used by components/ui (shadcn) that Tailwind 3 lacks
    plugin(({ addUtilities }) => {
      addUtilities({ ".outline-hidden": { outline: "2px solid transparent", "outline-offset": "2px" } });
    }),
  ],
};
