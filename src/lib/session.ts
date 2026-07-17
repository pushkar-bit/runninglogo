import crypto from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "ichor_session";

export type SessionUser = {
  name: string;
  email: string;
  picture?: string;
};

function secret(): string {
  return process.env.AUTH_SECRET || "dev-insecure-secret-change-me";
}

export function signSession(user: SessionUser): string {
  const data = Buffer.from(
    JSON.stringify({ ...user, ts: Date.now() })
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", secret())
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

export function verifySession(token?: string | null): SessionUser | null {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;

  const expected = crypto
    .createHmac("sha256", secret())
    .update(data)
    .digest("base64url");

  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

  try {
    const obj = JSON.parse(Buffer.from(data, "base64url").toString());
    if (!obj.email) return null;
    return { name: obj.name, email: obj.email, picture: obj.picture };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}
