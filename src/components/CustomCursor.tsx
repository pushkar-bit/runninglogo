"use client";

import { useEffect, useRef } from "react";

const HOVER_SELECTOR = 'a, button, [role="button"], [data-cursor-hover]';
const MAGNETIC_SELECTOR = "[data-magnetic]";
const MAGNETIC_STRENGTH = 0.35;

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.body.classList.add("cursor-none-custom");

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const dotPos = { ...mouse };
    const ringPos = { ...mouse };
    let hovering = false;
    let frameId = 0;

    const magneticEls = new Set<HTMLElement>();
    let activeMagnetic: HTMLElement | null = null;
    let magneticOffset = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      const target = e.target as HTMLElement;
      hovering = !!target.closest(HOVER_SELECTOR);

      if (activeMagnetic) {
        const rect = activeMagnetic.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        magneticOffset = {
          x: (e.clientX - cx) * MAGNETIC_STRENGTH,
          y: (e.clientY - cy) * MAGNETIC_STRENGTH,
        };
      }
    };
    window.addEventListener("mousemove", onMouseMove);

    const attachMagnetic = (el: Element) => {
      const target = el as HTMLElement;
      magneticEls.add(target);
      const enter = () => {
        activeMagnetic = target;
      };
      const leave = () => {
        if (activeMagnetic === target) activeMagnetic = null;
        magneticOffset = { x: 0, y: 0 };
        target.style.transform = "";
      };
      target.addEventListener("mouseenter", enter);
      target.addEventListener("mouseleave", leave);
      return () => {
        target.removeEventListener("mouseenter", enter);
        target.removeEventListener("mouseleave", leave);
      };
    };

    const detachers: Array<() => void> = [];
    document.querySelectorAll(MAGNETIC_SELECTOR).forEach((el) => {
      detachers.push(attachMagnetic(el));
    });

    const tick = () => {
      const dotEase = reducedMotion ? 1 : 0.35;
      const ringEase = reducedMotion ? 1 : 0.16;

      dotPos.x += (mouse.x - dotPos.x) * dotEase;
      dotPos.y += (mouse.y - dotPos.y) * dotEase;
      ringPos.x += (mouse.x - ringPos.x) * ringEase;
      ringPos.y += (mouse.y - ringPos.y) * ringEase;

      dot.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${hovering ? 1.9 : 1})`;
      ring.style.opacity = hovering ? "0.5" : "0.9";

      if (activeMagnetic) {
        activeMagnetic.style.transform = `translate(${magneticOffset.x}px, ${magneticOffset.y}px)`;
      }

      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    return () => {
      document.body.classList.remove("cursor-none-custom");
      window.removeEventListener("mousemove", onMouseMove);
      detachers.forEach((fn) => fn());
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-1.5 w-1.5 rounded-full bg-foreground md:block"
        style={{ willChange: "transform" }}
        aria-hidden="true"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-9 w-9 rounded-full border border-foreground/70 mix-blend-difference transition-[opacity] duration-200 md:block"
        style={{ willChange: "transform" }}
        aria-hidden="true"
      />
    </>
  );
}
