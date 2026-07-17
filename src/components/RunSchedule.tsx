"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const RUNS = [
  {
    day: "Tuesday",
    time: "6:00 AM",
    title: "Easy Miles",
    location: "Lodhi Garden",
    distance: "5K",
  },
  {
    day: "Thursday",
    time: "6:00 AM",
    title: "Track & Intervals",
    location: "Nehru Park",
    distance: "Speed work",
  },
  {
    day: "Saturday",
    time: "6:30 AM",
    title: "The Long Run",
    location: "India Gate — Rajpath",
    distance: "10K+",
  },
  {
    day: "Sunday",
    time: "7:00 AM",
    title: "Recovery Jog",
    location: "Yamuna Sports Complex",
    distance: "Open pace",
  },
];

export default function RunSchedule() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.from(cardsRef.current, {
        opacity: 0,
        y: 50,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="runs"
      className="relative bg-surface px-6 py-28 md:px-10 md:py-36"
    >
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 font-display text-xs uppercase tracking-[0.4em] text-accent">
          The Runs
        </p>
        <h2 className="max-w-2xl font-display text-4xl font-semibold uppercase leading-[0.95] tracking-tight text-foreground md:text-6xl">
          Same corners.
          <br />
          Different you, every week.
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {RUNS.map((run, i) => (
            <div
              key={run.day}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-background/60 p-7 transition-colors duration-300 hover:border-primary/60"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-2xl font-semibold uppercase tracking-wide text-foreground">
                    {run.day}
                  </h3>
                  <p className="mt-1 font-sans text-sm text-muted">
                    {run.time}
                  </p>
                </div>
                <span className="rounded-full border border-border px-3 py-1 font-sans text-xs uppercase tracking-widest text-primary">
                  {run.distance}
                </span>
              </div>

              <div className="mt-8">
                <p className="font-display text-lg font-medium text-foreground">
                  {run.title}
                </p>
                <p className="mt-1 font-sans text-sm text-muted">
                  {run.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
