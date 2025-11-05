// tailwind.config.js — Tailwind v4 compatible
import { defineConfig, source } from "tailwindcss";

export default defineConfig({
  // Optional: manually set source paths instead of old `content`
  content: {
    files: [
      source("./app/**/*.{js,ts,jsx,tsx,mdx}"),
      source("./components/**/*.{js,ts,jsx,tsx,mdx}"),
      source("./src/**/*.{js,ts,jsx,tsx,mdx}"),
    ],
  },

  // Tailwind v4: darkMode, theme extensions, and plugins still work
  darkMode: "class",

  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      outlineColor: {
        ring: "var(--ring)",
      },
    },
  },

  plugins: {
    "tailwindcss-animate": {},
  },
});