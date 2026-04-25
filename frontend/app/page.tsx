import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import InsurerBenchmark from "./components/InsurerBenchmark";
import Pricing from "./components/Pricing";
import CTABlock from "./components/CTABlock";
import Footer from "./components/Footer";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <>
      <Navbar userEmail={user?.email} />
      <main className="flex-1">
        <Hero />
        <Stats />
        <HowItWorks />
        <Features />
        <InsurerBenchmark />
        <Pricing />
        <CTABlock />
      </main>
      <Footer />
    </>
  );
}
