"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MOMENTS = [
  {
    caption: "5:47 AM — first light over Lodhi Garden",
    image: "/images/hero-poster.jpg",
  },
  {
    caption: "Kilometre 8 — legs give, the pack doesn't",
    gradient: "from-primary/40 via-wine to-background",
  },
  {
    caption: "One club, every pace, no one runs alone",
    image: "/images/creature-frame.jpg",
  },
  {
    caption: "Earned coffee hits different at 7 AM",
    gradient: "from-accent/40 via-wine to-background",
  },
  {
    caption: "Every Saturday, the same finish line — Rajpath",
    gradient: "from-primary-dim/50 via-background to-wine",
  },
];

export default function Community() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        "(min-width: 768px)": () => {
          const totalScroll = track.scrollWidth - window.innerWidth;
          if (totalScroll <= 0) return;

          gsap.to(track, {
            x: -totalScroll,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${totalScroll}`,
              scrub: 1,
              pin: true,
              invalidateOnRefresh: true,
            },
          });
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="community"
      className="relative overflow-hidden bg-background py-28 md:py-0"
    >
      <div className="px-6 md:absolute md:left-10 md:top-16 md:z-10 md:px-0">
        <p className="mb-4 font-display text-xs uppercase tracking-[0.4em] text-accent">
          Community
        </p>
        <h2 className="max-w-md font-display text-4xl font-semibold uppercase leading-[0.95] tracking-tight text-foreground md:text-5xl">
          Moments earned
          <br />
          on the road.
        </h2>
      </div>

      <div
        ref={trackRef}
        className="flex flex-col gap-6 px-6 md:h-dvh md:flex-row md:items-center md:gap-8 md:px-[10vw] md:pt-24"
      >
        {MOMENTS.map((moment) => (
          <div
            key={moment.caption}
            className="relative h-72 w-full flex-shrink-0 overflow-hidden rounded-2xl border border-border md:h-[60vh] md:w-[40vw]"
          >
            {moment.image ? (
              <Image
                src={moment.image}
                alt=""
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div
                className={`h-full w-full bg-gradient-to-br ${moment.gradient}`}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
            <p className="absolute bottom-6 left-6 right-6 font-sans text-base text-foreground md:text-lg">
              {moment.caption}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
