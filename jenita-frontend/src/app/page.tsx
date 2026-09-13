import { Hero } from "@/components/home/Hero";
import { AboutProject } from "@/components/home/AboutProject";
import { StatsBar } from "@/components/home/StatsBar";
import { AgentsSection } from "@/components/home/AgentsSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { MoreWays } from "@/components/home/MoreWays";
import { Testimonials } from "@/components/home/Testimonials";
import { DesktopApp } from "@/components/home/DesktopApp";
import { CtaBanner } from "@/components/home/CtaBanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutProject />
      <StatsBar />
      <AgentsSection />
      <HowItWorks />
      <MoreWays />
      <Testimonials />
      <DesktopApp />
      <CtaBanner />
    </>
  );
}
