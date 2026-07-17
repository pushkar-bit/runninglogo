import { NextRequest, NextResponse } from "next/server";
import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";
import { signSession, SESSION_COOKIE, type SessionUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const origin = url.origin;
  const fail = () => NextResponse.redirect(`${origin}/?auth=error`);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.cookies.get("ichor_oauth_state")?.value;

  if (!code || !state || !cookieState || state !== cookieState) return fail();

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail();

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/callback/google`;

  // Exchange the authorization code for tokens.
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return fail();
  const tokens = (await tokenRes.json()) as { access_token?: string };
  if (!tokens.access_token) return fail();

  // Fetch the user's Google profile.
  const userRes = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    { headers: { Authorization: `Bearer ${tokens.access_token}` } }
  );
  if (!userRes.ok) return fail();
  const profile = (await userRes.json()) as {
    name?: string;
    email?: string;
    picture?: string;
  };
  if (!profile.email) return fail();

  const user: SessionUser = {
    name: profile.name || profile.email,
    email: profile.email,
    picture: profile.picture,
  };

  // Persist the signup locally (swap for a real datastore in production).
  try {
    const dir = path.join(process.cwd(), "data");
    await mkdir(dir, { recursive: true });
    await appendFile(
      path.join(dir, "signups.jsonl"),
      JSON.stringify({ ...user, submittedAt: new Date().toISOString() }) + "\n",
      "utf8"
    );
  } catch (err) {
    console.error("Failed to persist signup", err);
  }

  const res = NextResponse.redirect(`${origin}/?auth=success#join`);
  res.cookies.set(SESSION_COOKIE, signSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  res.cookies.delete("ichor_oauth_state");
  return res;
}
