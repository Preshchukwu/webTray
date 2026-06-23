import Hero from "@/components/hero-section";
import { FeaturesSections } from "@/components/features";
import { AllInOne } from "@/components/all-in-one";
import { HowItWorksSection } from "@/components/how-it-works";
import { WhyChoose } from "@/components/why-choose";
import { WhoIsItFor } from "@/components/who-is-it-for";
import { VendorSection } from "@/components/vendor-section";
import { CreativeSection } from "@/components/creative-section";
import { Testimonials } from "@/components/testimonials";
import { CTASection } from "@/components/cta-section";
import Header from "@/components/header";
import { Footer } from "@/components/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Webtray | Smart Inventory Management Software",
  description: "All-in-one SME commerce platform. Everything your business needs to thrive, in one powerful place.",
};

export default function HomePage() {
  return (
    <div className="">
      <Header />
      <Hero />
      <FeaturesSections />
      <AllInOne />
      <HowItWorksSection />
      <WhyChoose />
      <WhoIsItFor />
      <VendorSection />
      <CreativeSection />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  );
}