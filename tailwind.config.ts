import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-base)",
        foreground: "var(--text-base)",
        brand: {
          DEFAULT: "var(--brand-color)",
          hover: "var(--brand-color-hover)",
          active: "var(--brand-color-active)",
        },
        elevated: "var(--bg-elevated)",
        highlight: "var(--bg-highlight)",
      },
    },
  },
  plugins: [],
};
export default config;
