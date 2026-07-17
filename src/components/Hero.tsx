"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scrollCueRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) return;

    video.play().catch(() => {});
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=90%",
          scrub: 1,
          pin: true,
        },
      });

      tl.to(videoRef.current, { scale: 1.15, opacity: 0.3, ease: "none" }, 0);
      tl.to(scrollCueRef.current, { opacity: 0, ease: "none" }, 0);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex h-dvh w-full items-center justify-center overflow-hidden bg-background"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/video/ichor-brand.mp4"
        poster="/images/hero-poster.jpg"
        muted
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />

      <h1 className="sr-only">Ichor Run Club — Delhi</h1>
      <p className="sr-only">
        A community built on movement, belonging, and earned experiences.
      </p>

      <div
        ref={scrollCueRef}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-muted"
      >
        <span className="font-display text-xs uppercase tracking-[0.4em]">
          Scroll
        </span>
        <span className="h-8 w-px animate-pulse bg-muted" />
      </div>
    </section>
  );
}
