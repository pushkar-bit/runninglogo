"use client";

import { useState } from "react";
import Link from "next/link";
import LogoMark from "./LogoMark";

const LINKS = [
  { href: "#story", label: "Story" },
  { href: "#runs", label: "Runs" },
  { href: "#community", label: "Community" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="flex items-center justify-between px-5 py-4 md:px-10 md:py-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground"
          onClick={() => setOpen(false)}
        >
          <LogoMark className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-semibold uppercase tracking-wide">
            Ichor
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-display text-sm font-medium uppercase tracking-widest text-muted transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/signup"
            className="rounded-full bg-primary px-5 py-2 font-display text-sm font-semibold uppercase tracking-widest text-background transition-transform duration-200 hover:scale-105"
          >
            Join
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-[2px] w-6 bg-foreground transition-transform duration-200 ${
              open ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-[2px] w-6 bg-foreground transition-transform duration-200 ${
              open ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      <div
        className={`fixed inset-0 -z-10 flex flex-col items-center justify-center gap-8 bg-background transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className="font-display text-3xl font-semibold uppercase tracking-widest text-foreground"
          >
            {link.label}
          </a>
        ))}
        <Link
          href="/signup"
          onClick={() => setOpen(false)}
          className="rounded-full bg-primary px-8 py-3 font-display text-lg font-semibold uppercase tracking-widest text-background"
        >
          Join
        </Link>
      </div>
    </header>
  );
}
