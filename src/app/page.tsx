import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Mission from "@/components/Mission";
import RunSchedule from "@/components/RunSchedule";
import Community from "@/components/Community";
import JoinCTA from "@/components/JoinCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Mission />
        <RunSchedule />
        <Community />
        <JoinCTA />
      </main>
      <Footer />
    </>
  );
}
