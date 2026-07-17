"use client";

import { useState, type FormEvent } from "react";

const RUN_OPTIONS = [
  { value: "no-preference", label: "No preference" },
  { value: "tuesday-easy", label: "Tuesday · Easy Miles · Lodhi Garden" },
  { value: "thursday-track", label: "Thursday · Track & Intervals · Nehru Park" },
  { value: "saturday-long", label: "Saturday · The Long Run · India Gate" },
  { value: "sunday-recovery", label: "Sunday · Recovery Jog · Yamuna Sports Complex" },
];

type Status = "idle" | "submitting" | "success" | "error";

export default function SignupForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      phone: data.get("phone"),
      preferredRun: data.get("preferredRun"),
      whatsappOptIn: data.get("whatsappOptIn") === "on",
    };

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setError("Network error. Check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface px-8 py-16 text-center">
        <p className="font-display text-xs uppercase tracking-[0.4em] text-accent">
          You&apos;re in
        </p>
        <h2 className="font-display text-3xl font-semibold uppercase tracking-tight text-foreground md:text-4xl">
          Welcome to the pack.
        </h2>
        <p className="max-w-sm font-sans text-muted">
          We&apos;ll be in touch with details for your first run. Show up a
          few minutes early — first-timers get a proper welcome.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="name"
          className="font-sans text-sm font-medium text-foreground"
        >
          Full name <span className="text-accent">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="rounded-xl border border-border bg-surface px-4 py-3 font-sans text-base text-foreground outline-none transition-colors duration-200 focus:border-primary"
          placeholder="Your name"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="font-sans text-sm font-medium text-foreground"
        >
          Email <span className="text-accent">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-xl border border-border bg-surface px-4 py-3 font-sans text-base text-foreground outline-none transition-colors duration-200 focus:border-primary"
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="phone"
          className="font-sans text-sm font-medium text-foreground"
        >
          Phone <span className="text-accent">*</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          className="rounded-xl border border-border bg-surface px-4 py-3 font-sans text-base text-foreground outline-none transition-colors duration-200 focus:border-primary"
          placeholder="+91 98765 43210"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="preferredRun"
          className="font-sans text-sm font-medium text-foreground"
        >
          Preferred run
        </label>
        <select
          id="preferredRun"
          name="preferredRun"
          defaultValue="no-preference"
          className="rounded-xl border border-border bg-surface px-4 py-3 font-sans text-base text-foreground outline-none transition-colors duration-200 focus:border-primary"
        >
          {RUN_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-3 font-sans text-sm text-muted">
        <input
          type="checkbox"
          name="whatsappOptIn"
          className="h-5 w-5 rounded border-border bg-surface accent-primary"
        />
        Add me to the WhatsApp community group
      </label>

      {status === "error" && error && (
        <p role="alert" className="font-sans text-sm text-accent">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-2 rounded-full bg-primary px-8 py-4 font-display text-base font-semibold uppercase tracking-widest text-background transition-transform duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Joining…" : "Join The Pack"}
      </button>
    </form>
  );
}
