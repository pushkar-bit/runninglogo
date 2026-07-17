import Link from "next/link";
import LogoMark from "./LogoMark";

const SOCIALS = [
  { label: "Instagram", href: "#" },
  { label: "Strava", href: "#" },
  { label: "WhatsApp", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background px-6 py-14 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-2 text-foreground">
          <LogoMark className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-semibold uppercase tracking-wide">
            Ichor Run Club
          </span>
        </div>

        <div className="flex flex-col gap-1 font-sans text-sm text-muted">
          <span>Delhi, India</span>
          <span>hello@ichorrunclub.com</span>
        </div>

        <div className="flex gap-6">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              className="font-display text-sm uppercase tracking-widest text-muted transition-colors duration-200 hover:text-foreground"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col-reverse items-start justify-between gap-4 border-t border-border pt-6 font-sans text-xs text-muted md:flex-row md:items-center">
        <span>© {new Date().getFullYear()} Ichor Run Club. All rights reserved.</span>
        <Link href="/signup" className="text-foreground underline-offset-4 hover:underline">
          Sign up for the next run →
        </Link>
      </div>
    </footer>
  );
}
