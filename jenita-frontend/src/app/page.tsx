import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { MeetAgents } from "@/components/landing/MeetAgents";
import { MoreWays } from "@/components/landing/MoreWays";
import { About } from "@/components/landing/About";
import { Download } from "@/components/landing/Download";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="bg-white min-h-screen">
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <MeetAgents />
        <MoreWays />
        <About />
        <Download />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
