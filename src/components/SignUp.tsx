import Image from "next/image";
import type { SessionUser } from "@/lib/session";

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}

const NOTICE: Record<string, string> = {
  error: "Something went wrong signing in. Please try again.",
  unconfigured:
    "Google sign-in isn't configured yet — add your Google credentials to .env.local.",
};

export default function SignUp({
  user,
  notice,
}: {
  user: SessionUser | null;
  notice?: string;
}) {
  const firstName = user?.name?.split(" ")[0];
  const message = notice ? NOTICE[notice] : undefined;

  return (
    <section
      id="join"
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-24"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-primary/14 blur-[130px]" />

      <div className="glass-panel relative flex w-full max-w-lg flex-col items-center rounded-[2rem] px-8 py-14 text-center md:px-14 md:py-16">
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.5em] text-accent">
          Join the pack
        </p>

        {user ? (
          <>
            <h2 className="text-balance text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
              You&apos;re in,
              <br />
              {firstName}.
            </h2>
            <p className="mt-6 max-w-sm text-base text-muted md:text-lg">
              Welcome to Ichor. We&apos;ll be in touch with your first run —
              show up a few minutes early and we&apos;ll get you settled.
            </p>

            <div className="mt-10 flex items-center gap-3 rounded-full border border-border bg-surface/60 py-2 pl-2 pr-5 backdrop-blur">
              {user.picture ? (
                <Image
                  src={user.picture}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-bold text-background">
                  {firstName?.[0] ?? "I"}
                </span>
              )}
              <span className="flex flex-col items-start leading-tight">
                <span className="text-sm font-medium text-foreground">
                  {user.name}
                </span>
                <span className="text-xs text-muted">{user.email}</span>
              </span>
            </div>

            <form action="/api/auth/signout" method="post" className="mt-6">
              <button
                type="submit"
                data-cursor-hover
                className="text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Sign out
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-balance text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
              Your first run
              <br />
              starts here.
            </h2>
            <p className="mt-6 max-w-sm text-base text-muted md:text-lg">
              One tap to join Delhi&apos;s run community. No pace requirement,
              no fee to show up — just be at the start line.
            </p>

            {message && (
              <p className="mt-8 text-sm text-accent" role="status">
                {message}
              </p>
            )}

            <a
              href="/api/auth/google"
              data-magnetic
              data-cursor-hover
              className="group mt-10 flex w-full max-w-sm items-center justify-center gap-3 rounded-full bg-foreground px-6 py-4 text-base font-medium text-background shadow-[0_0_40px_-8px_rgba(173,150,249,0.5)] transition-transform duration-200"
            >
              <GoogleGlyph />
              Continue with Google
            </a>

            <p className="mt-6 max-w-xs text-xs leading-relaxed text-muted">
              By joining you agree to run at your own pace and cheer on everyone
              slower and faster than you.
            </p>
          </>
        )}
      </div>

      <footer className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 pb-8 text-xs text-muted">
        <span className="tracking-wide">Ichor Run Club · Delhi, India</span>
      </footer>
    </section>
  );
}
