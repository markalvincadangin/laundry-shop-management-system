import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Canonical Design Tokens (FRONT-001 §2.1)
        brand: {
          blue: "#15489d",      // Primary CTA / Logo Royal Blue
          cyan: "#30a8d4",      // Decorative / Drying state
          "cyan-dark": "#1a7fa8", // Interactive icons / Links - Darkened for 4.5:1 on neutral-50
        },
        neutral: {
          50: "#f8fafc",        // Page background
          100: "#f1f5f9",       // Card surfaces
          900: "#0f172a",       // Dark mode base canvas
        },
        // Semantic Lifecycle & Feedback
        success: {
          100: "#d1fae5",       // Badge background
          700: "#047857",       // Success text
        },
        emerald: {
          50:  "#ecfdf5",
          100: "#d1fae5",
          700: "#047857",
        },
        warning: {
          100: "#fef3c7",       // Badge background
          700: "#b45309",       // Warning text
        },
        amber: {
          100: "#fef3c7",
          700: "#b45309",
        },
        error: {
          50:  "#fff1f2",
          700: "#be123c",       // Destructive text / Rose-700
        },
        rose: {
          50:  "#fff1f2",
          700: "#be123c",
        },
        // UI Aliases (to maintain compatibility while transitioning)
        primary: {
          DEFAULT: "#15489d",
          600: "#15489d",
        },
        action: {
          DEFAULT: "#30a8d4",
          500: "#30a8d4",
        },
        "neutral-base": "#0f172a",
        "neutral-text": {
          primary: "#ffffff",
          secondary: "#94a3b8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
      fontSize: {
        // Typography Scale (FRONT-001 §2.2.1)
        display: ["2.25rem", { lineHeight: "1.2", fontWeight: "800", letterSpacing: "-0.02em" }],
        h1:      ["1.875rem", { lineHeight: "1.2", fontWeight: "700", letterSpacing: "-0.01em" }],
        h2:      ["1.5rem",   { lineHeight: "1.3", fontWeight: "600", letterSpacing: "-0.01em" }],
        h3:      ["1.125rem", { lineHeight: "1.3", fontWeight: "600" }],
        body:    ["0.875rem", { lineHeight: "1.5", fontWeight: "400", letterSpacing: "0.01em" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.5", fontWeight: "400", letterSpacing: "0.01em" }],
        caption: ["0.75rem",   { lineHeight: "1.4", fontWeight: "500", letterSpacing: "0.02em" }],
        mono:    ["0.75rem",   { lineHeight: "1.4", fontWeight: "400" }],
      },
      spacing: {
        // 8px Base Grid (FRONT-001 §2.3)
        "grid-1": "4px",
        "grid-1.5": "6px",
        "grid-2": "8px",
        "grid-2.5": "10px",
        "grid-3": "12px",
        "grid-3.5": "14px",
        "grid-4": "16px",
        "grid-5": "20px",
        "grid-6": "24px",
        "grid-7": "28px",
        "grid-8": "32px",
        "grid-10": "40px",
        "grid-12": "48px",
        "grid-14": "56px",
        "grid-16": "64px",
        "grid-18": "72px",
        "grid-20": "80px",
        "grid-24": "96px",
        "grid-28": "112px",
        "grid-32": "128px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
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
