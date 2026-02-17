import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1A6BFF",
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#1A6BFF",
          600: "#1557E6",
          700: "#1247CC",
        },
        success: {
          DEFAULT: "#16A34A",
          50: "#F0FDF4",
          600: "#16A34A",
        },
        warning: {
          DEFAULT: "#D97706",
          50: "#FFFBEB",
          600: "#D97706",
        },
        danger: {
          DEFAULT: "#DC2626",
          50: "#FEF2F2",
          600: "#DC2626",
        },
        neutral: {
          base: "#F8FAFC",
          surface: "#FFFFFF",
          border: "#E2E8F0",
          "text-primary": "#0F172A",
          "text-secondary": "#64748B",
        },
        status: {
          received: { bg: "rgb(239 246 255)", text: "rgb(37 99 235)" },
          washing: { bg: "rgb(255 251 235)", text: "rgb(217 119 6)" },
          drying: { bg: "rgb(255 247 237)", text: "rgb(194 65 12)" },
          folding: { bg: "rgb(250 245 255)", text: "rgb(147 51 234)" },
          ready: { bg: "rgb(240 253 244)", text: "rgb(22 163 74)" },
          released: { bg: "rgb(248 250 252)", text: "rgb(100 116 139)" },
          cancelled: { bg: "rgb(254 242 242)", text: "rgb(220 38 38)" },
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
      fontSize: {
        display: ["28px", { lineHeight: "1.2", fontWeight: "700" }],
        heading: ["20px", { lineHeight: "1.3", fontWeight: "600" }],
        subheading: ["16px", { lineHeight: "1.4", fontWeight: "500" }],
        body: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "1.4", fontWeight: "400" }],
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
      },
    },
  },
  plugins: [],
};

export default config;
