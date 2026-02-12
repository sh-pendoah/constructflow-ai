import { Navbar } from "./components/navbar";
import { Hero } from "./components/hero";
import { HowItWorks } from "./components/how-it-works";
import { Workflows } from "./components/workflows";
import { Pricing } from "./components/pricing";
import { FinalCTA } from "./components/final-cta";
import { Footer } from "./components/footer";

export default function App() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Onest, sans-serif' }}>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Workflows />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}