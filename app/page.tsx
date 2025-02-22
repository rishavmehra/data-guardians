import { BenefitsSection } from "@/components/layout/sections/benefits";
import { CommunitySection } from "@/components/layout/sections/community";
import { ContactSection } from "@/components/layout/sections/contact";
import { FAQSection } from "@/components/layout/sections/faq";
import { FeaturesSection } from "@/components/layout/sections/features";
import { FooterSection } from "@/components/layout/sections/footer";
import { HeroSection } from "@/components/layout/sections/hero";
import { ServicesSection } from "@/components/layout/sections/services";
import { TeamSection } from "@/components/layout/sections/team";

export const metadata = {
  title: "Content Authentication: Combatting Deepfakes with Digital Signatures",
  description: "Content Authentication: Combatting Deepfakes with Digital Signatures",
  openGraph: {
    type: "website",
    url: "https://github.com/rishavmehra",
    title: "Content Authentication: Combatting Deepfakes with Digital Signatures",
    description: "Content Authentication: Combatting Deepfakes with Digital Signatures",
    images: [
      {
        url: "https://avatars.githubusercontent.com/u/68805388?v=4",
        width: 1200,
        height: 630,
        alt: "Content Authentication: Combatting Deepfakes with Digital Signatures",
      },
    ],  
  },
  twitter: {
    card: "summary_large_image",
    site: "https://x.com/rishavmehraa",
    title: "Content Authentication: Combatting Deepfakes with Digital Signatures",
    description: "Content Authentication: Combatting Deepfakes with Digital Signatures",
    images: [
      "https://avatars.githubusercontent.com/u/68805388?v=4",
    ],
  },
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <BenefitsSection />
      <FeaturesSection />
      <TeamSection />
      <CommunitySection />
      <ContactSection />
      <FAQSection />
      <FooterSection />
    </>
  );
}
