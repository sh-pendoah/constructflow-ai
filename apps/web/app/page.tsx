"use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { parseCookies } from "nookies";
import { Navbar } from "@/components/landing-page/navbar";
import { Hero } from "@/components/landing-page/hero";
import { HowItWorks } from "@/components/landing-page/how-it-works";
import { Workflows } from "@/components/landing-page/workflows";
import { FinalCTA } from "@/components/landing-page/final-cta";
import { Footer } from "@/components/landing-page/footer";
import { PricingCards } from "@/components/landing-page/pricing";

export default function Home() {
  // const router = useRouter();

  // useEffect(() => {
  //   const cookies = parseCookies();
  //   const authToken = cookies.auth_token;
  //   if (authToken) {
  //     router.replace("/dashboard");
  //   }
  // }, [router]);

  // Show nothing while redirecting
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Onest, sans-serif' }}>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Workflows />
      <PricingCards />
      <FinalCTA />
      <Footer />
    </div>
  );
}