# Ichor Run Club

A one-page, premium landing site for Ichor Run Club (Delhi). A live WebGL
particle scene morphs the ICHOR mark into a purple kangaroo as you scroll, and
the page ends on a Google-powered sign-up. Custom cursor with magnetic
buttons throughout.

Built with Next.js (App Router), Tailwind CSS v4, Three.js, GSAP/ScrollTrigger,
Lenis smooth scroll, and the Satoshi typeface.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Google sign-in setup

Sign-in works once you add your own Google OAuth credentials.

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create/select a project.
2. **APIs & Services → OAuth consent screen** → configure (External, add your email as a test user).
3. **APIs & Services → Credentials → Create credentials → OAuth client ID → Web application**.
   - **Authorized redirect URI:** `http://localhost:3000/api/auth/callback/google`
     (add your production URL too when you deploy, e.g. `https://yourdomain.com/api/auth/callback/google`).
4. Copy the **Client ID** and **Client secret** into `.env.local`:

   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

   `AUTH_SECRET` is already generated in `.env.local`. See `.env.example` for the full list.

5. Restart `npm run dev`. "Continue with Google" now works.

## How the particle scroll animation works

There's no 3D model file — [`src/lib/particles.ts`](src/lib/particles.ts)
generates two matching point clouds at runtime:

- **Logo cloud** — the ICHOR "C" mark, drawn to an offscreen canvas and sampled.
- **Kangaroo cloud** — sampled from `public/images/kangaroo-source.jpg` (a frame
  from the brand video) by luminance threshold, so only the lit kangaroo body
  becomes particles, not the background.

Both are resampled to the same particle count so they can be morphed 1:1.
[`ParticleField.tsx`](src/components/ParticleField.tsx) renders them as a
glowing `THREE.Points` cloud (custom shader, additive blending) that:

1. **Generates** on load — particles start scattered in a sphere and assemble
   into the logo (a GSAP tween on `uGenesis`, not scroll-linked).
2. **Morphs** logo → kangaroo as you scroll, driven by `uMorph` scrubbed via
   GSAP ScrollTrigger across `#scroll-track` (a tall, invisible spacer — the
   canvas itself is `position: fixed` and never scrolls).
3. **Keeps moving** the whole time via a continuous idle rotation + mouse
   parallax, independent of scroll, and stays visible (dimmed) behind the
   sign-up panel at the bottom.

Respects `prefers-reduced-motion` (shows a static assembled logo, no rotation).

To use a different kangaroo frame: re-extract with
`ffmpeg -i public/video/ichor-brand.mp4 -ss 00:00:07.0 -vframes 1 -q:v 2 public/images/kangaroo-source.jpg`
and adjust the luminance threshold in `sampleKangarooCloud` if needed.

## Other interactions

- **Logo / "Sign in" click** → smooth-scrolls straight to the sign-up section
  (`src/lib/lenis-context.tsx` exposes Lenis's `scrollTo` via context).
- **Custom cursor** (`CustomCursor.tsx`) — lerped dot + ring, expands on
  hoverable elements, magnetic pull on `data-magnetic` elements (the Google
  button, nav CTA). Disabled on touch/coarse pointers and simplified under
  `prefers-reduced-motion`.

## Notes

- Sign-ups are appended to `data/signups.jsonl` (local, gitignored). Swap for a
  real datastore/CRM before production.
- The session is a signed, httpOnly cookie — fine for gating a members area,
  but add a real backend if you need stronger guarantees.
