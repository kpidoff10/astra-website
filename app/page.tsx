import { HeroSection } from '@/components/sections/hero';
import { FeaturesSection } from '@/components/sections/features';
import { PricingSection } from '@/components/sections/pricing';
import { FooterSection } from '@/components/sections/footer';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <FooterSection />
    </main>
  );
}
