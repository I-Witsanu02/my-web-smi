import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8f9ff",
        surface: "#f8f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e5eeff",
        "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d3e4fe",
        primary: "#002046",
        "primary-container": "#1b365d",
        "on-primary": "#ffffff",
        secondary: "#006971",
        "secondary-container": "#97edf7",
        "on-secondary-container": "#006d76",
        tertiary: "#192132",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#44474e",
        outline: "#74777f",
        "outline-variant": "#c4c6cf",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        amber: "#b45309",
        "amber-container": "#fef3c7",
        success: "#047857",
        "success-container": "#d1fae5"
      },
      boxShadow: {
        clinical: "0 8px 24px rgba(15, 23, 42, 0.06)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"]
      },
      maxWidth: {
        "container-max": "1440px"
      }
    }
  },
  plugins: []
};

export default config;
