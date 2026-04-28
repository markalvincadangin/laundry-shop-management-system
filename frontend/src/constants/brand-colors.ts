/**
 * BRAND_COLORS: Authoritative hex definitions for non-Tailwind contexts (e.g., Recharts, dynamic styles).
 * Aligned with globals.css and FRONT-001 §2.1.
 */
export const BRAND_COLORS = {
  // Primary Palette
  blue: "#15489d",      // brand-blue (60-30-10 Accent)
  cyan: "#30a8d4",      // brand-cyan
  cyanDark: "#1a7fa8",  // brand-cyan-dark (Interactive)
  
  // Neutrals (60-30-10 Foundation)
  bg: "#f8fafc",        // neutral-50
  surface: "#f1f5f9",   // neutral-100
  slate: {
    400: "#94a3b8",
    500: "#64748b",
    900: "#0f172a",     // slate-900 (Dark mode surface)
  },

  // Semantic Status
  success: "#047857",   // emerald-700
  error: "#be123c",     // rose-700
  warning: "#b45309",   // amber-700
  
  white: "#ffffff",
} as const;
