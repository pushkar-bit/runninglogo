import { NextResponse } from "next/server";
import { mkdir, appendFile } from "fs/promises";
import path from "path";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const preferredRun = typeof body.preferredRun === "string" ? body.preferredRun : "no-preference";
  const whatsappOptIn = Boolean(body.whatsappOptIn);

  if (!name || !email || !phone) {
    return NextResponse.json(
      { ok: false, error: "Name, email, and phone are required." },
      { status: 400 }
    );
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  const entry = {
    name,
    email,
    phone,
    preferredRun,
    whatsappOptIn,
    submittedAt: new Date().toISOString(),
  };

  try {
    const dataDir = path.join(process.cwd(), "data");
    await mkdir(dataDir, { recursive: true });
    await appendFile(
      path.join(dataDir, "signups.jsonl"),
      JSON.stringify(entry) + "\n",
      "utf8"
    );
  } catch (err) {
    console.error("Failed to persist signup", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
