/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  /* hover:/group-hover: only apply where hover actually exists —
     kills the sticky-hover state that lingers after a tap on touch. */
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg-rgb) / <alpha-value>)",
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        grey1: "rgb(var(--grey-1-rgb) / <alpha-value>)",
        grey2: "rgb(var(--grey-2-rgb) / <alpha-value>)",
        invertbg: "rgb(var(--invert-bg-rgb) / <alpha-value>)",
        invertink: "rgb(var(--invert-ink-rgb) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Archivo Black", "Arial Black", "sans-serif"],
        body: ["var(--font-body)", "Space Grotesk", "Helvetica Neue", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "IBM Plex Mono", "monospace"],
      },
      borderWidth: { "3": "3px" },
      boxShadow: {
        hard: "6px 6px 0 rgb(var(--ink-rgb))",
        "hard-sm": "4px 4px 0 rgb(var(--ink-rgb))",
        "hard-accent": "6px 6px 0 rgb(var(--accent-rgb))",
      },
      transitionTimingFunction: {
        snap: "cubic-bezier(0.9, 0, 0.1, 1)",
      },
    },
  },
  plugins: [],
};
