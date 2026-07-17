import Nav from "@/components/Nav";
import ScrollSequence from "@/components/ScrollSequence";
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
      <Nav />
      <main id="top">
        <ScrollSequence />
        <SignUp user={user} notice={params.auth} />
      </main>
    </>
  );
}
