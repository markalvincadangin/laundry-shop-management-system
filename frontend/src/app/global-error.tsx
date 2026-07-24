"use client";

import React from "react";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ErrorState } from "@/components/features/shared/ErrorState";
import { UI_LABELS } from "@/constants/ui";

// Re-declare fonts so the error page has the correct styling even if layout fails
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-neutral-50 font-sans text-slate-900 antialiased selection:bg-brand-blue/10 flex items-center justify-center p-6">
        <ErrorState 
          error={error} 
          reset={reset} 
          title="CRITICAL SYSTEM FAILURE"
        />
      </body>
    </html>
  );
}
