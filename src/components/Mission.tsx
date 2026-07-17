"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: 2026, label: "Founded", format: (n: number) => Math.round(n).toString() },
  { value: 500, label: "Runners in the pack", format: (n: number) => `${Math.round(n)}+` },
  { value: 3, label: "Runs every week", format: (n: number) => Math.round(n).toString() },
];

export default function Mission() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const statRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.from(headlineRef.current, {
        opacity: 0,
        y: 60,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headlineRef.current,
          start: "top 80%",
        },
      });

      STATS.forEach((stat, i) => {
        const el = statRefs.current[i];
        if (!el) return;
        const counter = { value: 0 };
        gsap.to(counter, {
          value: stat.value,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
          onUpdate: () => {
            el.textContent = stat.format(counter.value);
          },
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="story"
      className="relative bg-background px-6 py-28 md:px-10 md:py-40"
    >
      <div className="mx-auto max-w-4xl">
        <p className="mb-6 font-display text-xs uppercase tracking-[0.4em] text-accent">
          Our Story
        </p>
        <h2
          ref={headlineRef}
          className="font-display text-4xl font-semibold uppercase leading-[0.95] tracking-tight text-foreground md:text-7xl"
        >
          Delhi moves before
          <br />
          the city wakes.
        </h2>
        <p className="mt-8 max-w-2xl font-sans text-base leading-relaxed text-muted md:text-lg">
          Ichor started as three friends chasing sunrise through Lodhi Garden.
          It became a pack. Every run is earned, every finish line shared —
          we&apos;re building a community where showing up matters more than
          your pace.
        </p>
      </div>

      <div className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-10 border-t border-border pt-12 sm:grid-cols-3">
        {STATS.map((stat, i) => (
          <div key={stat.label} className="flex flex-col gap-2">
            <span
              ref={(el) => {
                statRefs.current[i] = el;
              }}
              className="font-display text-5xl font-semibold text-primary md:text-6xl"
            >
              0
            </span>
            <span className="font-sans text-sm uppercase tracking-widest text-muted">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
