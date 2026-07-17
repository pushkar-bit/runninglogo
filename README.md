# Ichor Run Club

A one-page, premium landing site for Ichor Run Club (Delhi). As you scroll, a
pinned canvas scrubs frame-by-frame through the brand sequence — **logo →
kangaroo → runner** — and lands on a Google-powered sign-up.

Built with Next.js (App Router), Tailwind CSS v4, GSAP/ScrollTrigger, Lenis
smooth scroll, and the Satoshi typeface.

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

## How the scroll animation works

- Frames live in `public/sequence/` (150 JPEGs extracted from the brand video).
- [`ScrollSequence.tsx`](src/components/ScrollSequence.tsx) preloads them, then
  ties the frame index to scroll position on a pinned canvas via GSAP
  ScrollTrigger (`scrub`), so it stays smooth on any device. Honors
  `prefers-reduced-motion` by showing the final frame statically.

## Notes

- Sign-ups are appended to `data/signups.jsonl` (local, gitignored). Swap for a
  real datastore/CRM before production.
- The session is a signed, httpOnly cookie — fine for gating a members area,
  but add a real backend if you need stronger guarantees.
- To regenerate frames from a new video:
  `ffmpeg -i public/video/ichor-brand.mp4 -vf "fps=15,scale=1280:-1" -q:v 4 public/sequence/frame_%03d.jpg`
