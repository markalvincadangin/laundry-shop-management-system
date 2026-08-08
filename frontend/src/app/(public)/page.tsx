"use client";

import { PublicTopNav } from "@/components/layout";
import {
  Hero,
  LocationStrip,
  CommitmentFeatures,
  PricingSection,
  LandingFooter,
} from "@/components/features/landing";

/**
 * Faith Laundry Shop — Official Business Portal v14.0
 * Feature-First Responsive React Landing Page Architecture
 */
export default function LandingPage() {
  return (
    <div className="relative flex-1 flex flex-col bg-[#f8fafc] selection:bg-brand-blue/10 selection:text-brand-blue overflow-x-hidden font-sans">
      <PublicTopNav variant="landing" />
      <Hero />
      <LocationStrip />
      <CommitmentFeatures />
      <PricingSection />
      <LandingFooter />
    </div>
  );
}
