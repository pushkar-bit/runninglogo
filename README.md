# Ichor Run Club

Marketing site for Ichor Run Club, a running community in Delhi. Next.js (App Router) + Tailwind CSS v4 + GSAP/ScrollTrigger + Lenis for cinematic, scroll-driven storytelling.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `src/app/page.tsx` — single-scroll home page (hero, story, runs, community, join CTA)
- `src/app/signup/page.tsx` — signup form
- `src/app/api/signup/route.ts` — signup API route, appends submissions to `data/signups.jsonl` (gitignored, local only)
- `src/components/` — page sections and shared UI

## Editing content

- Run schedule / locations: `src/components/RunSchedule.tsx`
- Brand copy / stats: `src/components/Mission.tsx`, `src/components/Hero.tsx`
- Colors and fonts: CSS variables in `src/app/globals.css`, fonts in `src/app/layout.tsx`

## Notes

- Signups are currently stored to a local file (`data/signups.jsonl`), not a database or email service — wire up a real backend before relying on this in production.
- Social links in the footer (`src/components/Footer.tsx`) are placeholders (`#`) — update with real Instagram/Strava/WhatsApp links.
