import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: "hsl(var(--card) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        primary: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#b7cfff",
          300: "#8bb0ff",
          400: "#5c8bff",
          500: "#3566f5",
          600: "#2249d6",
          700: "#1c3aab",
          800: "#1a3389",
          900: "#152a6b",
          950: "#0e1a42",
        },
        accent: {
          50: "#fff8eb",
          100: "#ffecc6",
          200: "#ffd888",
          300: "#ffbe4a",
          400: "#ffa41f",
          500: "#f88406",
          600: "#dc6302",
          700: "#b64505",
          800: "#93370b",
          900: "#792e0c",
        },
        status: {
          available: "#16a34a",
          hot: "#f97316",
          full: "#64748b",
        },
        zalo: "#0068ff",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 10px 0 rgb(15 23 42 / 0.08)",
        "card-hover": "0 8px 24px 0 rgb(15 23 42 / 0.14)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
