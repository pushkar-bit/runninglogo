"use client";

import LogoMark from "./LogoMark";
import { useLenis } from "@/lib/lenis-context";

export default function Nav() {
  const { scrollTo } = useLenis();

  const goToJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollTo("#join");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="flex items-center justify-between px-5 py-4 md:px-10 md:py-6">
        <a
          href="#join"
          onClick={goToJoin}
          data-cursor-hover
          className="flex items-center gap-2 text-foreground"
        >
          <LogoMark className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold uppercase tracking-wide">
            Ichor
          </span>
        </a>

        <a
          href="#join"
          onClick={goToJoin}
          data-magnetic
          data-cursor-hover
          className="inline-block rounded-full border border-border bg-surface/50 px-5 py-2 text-sm font-medium uppercase tracking-widest text-foreground backdrop-blur transition-colors duration-200 hover:border-primary/60"
        >
          Sign in
        </a>
      </div>
    </header>
  );
}
