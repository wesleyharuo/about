import type { Config } from "tailwindcss";

/**
 * Design tokens live as CSS variables in src/styles/globals.css.
 * Tailwind only maps names to them, so a theme change is one file.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", md: "2rem" }, screens: { "2xl": "1240px" } },
    extend: {
      colors: {
        ink: { DEFAULT: "rgb(var(--ink) / <alpha-value>)", 2: "rgb(var(--ink-2) / <alpha-value>)", 3: "rgb(var(--ink-3) / <alpha-value>)" },
        line: "rgb(var(--line) / <alpha-value>)",
        fg: { DEFAULT: "rgb(var(--fg) / <alpha-value>)", muted: "rgb(var(--fg-muted) / <alpha-value>)", faint: "rgb(var(--fg-faint) / <alpha-value>)" },
        signal: "rgb(var(--signal) / <alpha-value>)",
        synapse: "rgb(var(--synapse) / <alpha-value>)",
        ledger: "rgb(var(--ledger) / <alpha-value>)",
        alert: "rgb(var(--alert) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      borderRadius: { xl: "14px", "2xl": "20px" },
      boxShadow: {
        glow: "0 0 0 1px rgb(var(--signal) / 0.25), 0 0 40px -8px rgb(var(--signal) / 0.45)",
        card: "0 1px 0 0 rgb(255 255 255 / 0.04) inset, 0 20px 40px -24px rgb(0 0 0 / 0.8)",
      },
      keyframes: {
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
        scan: { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(100%)" } },
        pulseDot: { "0%,100%": { opacity: "1", transform: "scale(1)" }, "50%": { opacity: ".4", transform: "scale(.8)" } },
      },
      animation: {
        blink: "blink 1s steps(1) infinite",
        scan: "scan 6s linear infinite",
        pulseDot: "pulseDot 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
