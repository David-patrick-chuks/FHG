'use client';

import { CTASection } from '@/components/landing/CTASection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { FooterSection } from '@/components/landing/FooterSection';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
