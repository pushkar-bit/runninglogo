"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function JoinCTA() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll("[data-reveal]"), {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col items-center justify-center gap-8 bg-background px-6 py-32 text-center md:py-48"
    >
      <p data-reveal className="font-display text-xs uppercase tracking-[0.4em] text-accent">
        Join The Pack
      </p>
      <h2
        data-reveal
        className="max-w-3xl font-display text-5xl font-semibold uppercase leading-[0.9] tracking-tight text-foreground md:text-8xl"
      >
        Your first run
        <br />
        starts here.
      </h2>
      <p data-reveal className="max-w-md font-sans text-base text-muted md:text-lg">
        No pace requirement. No membership fee to show up. Just be at the
        start line.
      </p>
      <Link
        data-reveal
        href="/signup"
        className="mt-2 rounded-full bg-primary px-10 py-4 font-display text-base font-semibold uppercase tracking-widest text-background transition-transform duration-200 hover:scale-105"
      >
        Sign Up
      </Link>
    </section>
  );
}
