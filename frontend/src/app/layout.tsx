import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from './providers';
import { UI_LABELS } from "@/constants/ui";
import { BRAND_COLORS } from "@/constants/brand-colors";
import "./globals.css";

// Font Configuration (FRONT-001 §2.2.2)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: UI_LABELS.meta.TITLE,
  description: UI_LABELS.meta.DESC,
};

/**
 * RootLayout: The foundational shell for the Faith Laundry Management System.
 * Adheres to FRONT-001 (Design) and FRONT-002 (Structure).
 * Enforces strict hydration suppression for browser-injected extension attributes.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-neutral-50 font-sans text-slate-900 antialiased selection:bg-brand-blue/10 custom-scrollbar overflow-x-hidden"
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(226, 232, 240, 0.8)', // slate-200
              color: '#0f172a', // slate-900 (neutral-900)
              borderRadius: '12px', // radius-lg per spec
              boxShadow: '0 20px 40px -12px rgba(15, 23, 42, 0.1)',
              fontFamily: 'var(--font-inter)',
              fontWeight: '600',
            }
          }}
        />
      </body>
    </html>
  );
}
