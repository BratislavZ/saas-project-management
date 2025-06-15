import { auth } from "@clerk/nextjs/server";

import CallToAction from "@/app/_components/CallToAction";
import Features from "@/app/_components/Features";
import Hero from "@/app/_components/Hero";
import { LandingPageHeader } from "@/app/_components/LandingNavbar";
import Pricing from "@/app/_components/Pricing";
import Testimonials from "@/app/_components/Testimonials";
import Footer from "@/shared/components/custom/Footer";
import ShowNotificationAfterLogout from "./_components/ShowNotificationAfterLogout";

export default async function LandingPage() {
  const { userId } = await auth();
  const isAuthenticated = !!userId;

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <LandingPageHeader />
      <ShowNotificationAfterLogout />

      <main className="flex-1">
        <Hero isAuthenticated={isAuthenticated} />
        <Features />
        <Pricing isAuthenticated={isAuthenticated} />
        <Testimonials />
        <CallToAction isAuthenticated={isAuthenticated} />
      </main>

      <Footer />
    </div>
  );
}
