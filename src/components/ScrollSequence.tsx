"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 150;
const framePath = (i: number) =>
  `/sequence/frame_${String(i).padStart(3, "0")}.jpg`;

export default function ScrollSequence() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cueRef = useRef<HTMLDivElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  // Preload the full frame sequence.
  useEffect(() => {
    let loaded = 0;
    let cancelled = false;
    const images: HTMLImageElement[] = [];

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = framePath(i);
      const onDone = () => {
        if (cancelled) return;
        loaded += 1;
        setProgress(loaded / FRAME_COUNT);
        if (loaded === FRAME_COUNT) setReady(true);
      };
      img.onload = onDone;
      img.onerror = onDone;
      images[i - 1] = img;
    }
    imagesRef.current = images;

    return () => {
      cancelled = true;
    };
  }, []);

  // Set up canvas drawing + scroll scrubbing once frames are ready.
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = { frame: 0 };

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
    };

    const bg = getComputedStyle(document.documentElement)
      .getPropertyValue("--background")
      .trim() || "#08070a";

    const drawFit = (
      img: HTMLImageElement,
      cw: number,
      ch: number,
      mode: "cover" | "contain"
    ) => {
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale =
        mode === "cover"
          ? Math.max(cw / iw, ch / ih)
          : Math.min(cw / iw, ch / ih);
      const w = iw * scale;
      const h = ih * scale;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const render = () => {
      const img = imagesRef.current[Math.round(state.frame)];
      const cw = canvas.width;
      const ch = canvas.height;

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, cw, ch);

      if (!img || !img.complete || img.naturalWidth === 0) return;

      // Darkened cover backdrop fills the frame so letterbox bars read as an
      // intentional, seamless extension of the image on any aspect ratio.
      drawFit(img, cw, ch, "cover");
      ctx.fillStyle = "rgba(8, 7, 10, 0.62)";
      ctx.fillRect(0, 0, cw, ch);

      // Crisp, uncropped composition on top.
      drawFit(img, cw, ch, "contain");
    };

    sizeCanvas();
    render();

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      // Show the final "runner" frame statically.
      state.frame = FRAME_COUNT - 1;
      render();
      const onResize = () => {
        sizeCanvas();
        render();
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const ctxAnim = gsap.context(() => {
      gsap.to(state, {
        frame: FRAME_COUNT - 1,
        ease: "none",
        snap: "frame",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=320%",
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: render,
      });

      // Fade the scroll cue out as the sequence begins.
      gsap.to(cueRef.current, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=40%",
          scrub: true,
        },
      });
    }, section);

    const onResize = () => {
      sizeCanvas();
      render();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ctxAnim.revert();
    };
  }, [ready]);

  return (
    <section
      ref={sectionRef}
      className="relative h-dvh w-full overflow-hidden bg-background"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />

      {/* Bottom vignette to blend into the next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      {/* Preloader */}
      {!ready && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background">
          <span className="text-sm font-medium uppercase tracking-[0.4em] text-muted">
            Ichor
          </span>
          <div className="h-px w-40 overflow-hidden bg-border">
            <div
              className="h-full bg-primary transition-[width] duration-200 ease-out"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-muted">
            {Math.round(progress * 100)}%
          </span>
        </div>
      )}

      {/* Scroll cue */}
      <div
        ref={cueRef}
        className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-muted"
      >
        <span className="text-xs uppercase tracking-[0.4em]">Scroll</span>
        <span className="h-8 w-px animate-pulse bg-muted" />
      </div>
    </section>
  );
}
