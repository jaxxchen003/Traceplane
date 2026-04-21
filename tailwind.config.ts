import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          950: "#0c0c0f",
          900: "#141417",
          800: "#1c1c20",
          700: "#27272a",
          600: "#2e2e32",
          500: "#3f3f46",
          400: "#52525b",
          300: "#71717a",
        },
        ink: {
          DEFAULT: "#e4e4e7",
          muted: "#a1a1aa",
          faint: "#71717a",
          ghost: "#52525b",
          dim: "#3f3f46",
        },
        accent: {
          DEFAULT: "#6366f1",
          glow: "#818cf8",
          dim: "rgba(99, 102, 241, 0.06)",
        },
        signal: {
          neutral: "#71717a",
          info: "#3b82f6",
          warning: "#f59e0b",
          success: "#22c55e",
          error: "#ef4444",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SF Mono",
          "Monaco",
          "Cascadia Code",
          "Courier New",
          "monospace",
        ],
      },
      animation: {
        "status-pulse": "status-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        "status-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
