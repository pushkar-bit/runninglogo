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
        {/* Pure scroll distance for the 3D logo -> kangaroo morph, rendered
            by the fixed ParticleField canvas behind this transparent track. */}
        <div id="scroll-track" className="h-[380vh] w-full" />
        <SignUp user={user} notice={params.auth} />
      </main>
    </>
  );
}
