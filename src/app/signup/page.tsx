import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SignupForm from "@/components/SignupForm";

export const metadata: Metadata = {
  title: "Join The Pack | Ichor Run Club",
  description: "Sign up for Ichor Run Club — Delhi's community built on movement, belonging, and earned experiences.",
};

export default function SignupPage() {
  return (
    <>
      <Nav />
      <main className="flex min-h-dvh flex-col justify-center px-6 py-32 md:px-10">
        <div className="mx-auto w-full max-w-md">
          <p className="mb-3 font-display text-xs uppercase tracking-[0.4em] text-accent">
            Join The Pack
          </p>
          <h1 className="mb-10 font-display text-4xl font-semibold uppercase leading-[0.95] tracking-tight text-foreground md:text-5xl">
            Your first run
            <br />
            starts here.
          </h1>
          <SignupForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
