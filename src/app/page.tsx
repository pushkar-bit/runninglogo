import Nav from "@/components/Nav";
import ParticleField from "@/components/ParticleField";
import ScrollCue from "@/components/ScrollCue";
import SignUp from "@/components/SignUp";
import { getSessionUser } from "@/lib/session";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string }>;
}) {
  const [user, params] = await Promise.all([getSessionUser(), searchParams]);

  return (
    <>
      <ParticleField />
      <Nav />
      <ScrollCue />
      <main id="top" className="relative z-10">
        {/* Pure scroll distance for the logo -> kangaroo -> jump -> jump ->
            human -> run sequence, rendered by the fixed ParticleField canvas
            behind this transparent track. Three page-heights, per spec. */}
        <div id="scroll-track" className="h-[300vh] w-full" />
        <SignUp user={user} notice={params.auth} />
      </main>
    </>
  );
}
