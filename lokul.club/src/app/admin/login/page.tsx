"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, KeyRound, Eye, EyeOff } from "lucide-react";
import { Alert, Button } from "@/components/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.ok) {
      router.push("/admin/dashboard");
      router.refresh();
    } else {
      setError("Invalid email or password. Check the credentials below.");
    }
  }

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--color-surface-muted)" }}
    >
      {/* ── Left brand panel — desktop only ───────────────────── */}
      <div
        className="hidden lg:flex lg:w-110 lg:shrink-0 lg:flex-col lg:items-center lg:justify-center lg:px-14 lg:py-16"
        style={{
          background: "linear-gradient(160deg, var(--color-brand-700) 0%, var(--color-brand-900) 100%)",
        }}
      >
        <div
          className="mb-8 flex h-16 w-16 items-center justify-center rounded-[6px] text-2xl font-bold text-white"
          style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
        >
          L
        </div>

        <h2 className="mb-1 text-3xl font-bold text-white">lokul.club</h2>
        <p className="mb-10 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
          Your neighbourhood, connected.
        </p>

        <ul className="w-full space-y-4">
          {[
            "Real-time waitlist analytics",
            "Manage entries & export CSV",
            "Track signups by locality",
          ].map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px]"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M2 5.5L4 7.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Right form panel ───────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">

        {/* Mobile logo */}
        <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-[6px] text-xl font-bold text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, var(--color-brand-600), var(--color-brand-900))" }}
          >
            L
          </div>
          <p className="text-base font-bold" style={{ color: "var(--color-gray-900)" }}>lokul.club</p>
          <p className="text-xs" style={{ color: "var(--color-gray-500)" }}>Admin dashboard</p>
        </div>

        {/* Card */}
        <div
          className="w-full max-w-sm rounded-[6px] p-8"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {/* Card header */}
          <div className="mb-7">
            <div className="mb-5 hidden lg:flex lg:items-center lg:gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-[6px] text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, var(--color-brand-600), var(--color-brand-900))" }}
              >
                L
              </div>
              <span className="text-sm font-bold" style={{ color: "var(--color-gray-900)" }}>
                lokul.club admin
              </span>
            </div>

            <h1 className="text-2xl font-bold" style={{ color: "var(--color-gray-900)" }}>
              Welcome back
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-gray-500)" }}>
              Sign in to your admin account
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5">
              <Alert tone="danger">{error}</Alert>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-semibold"
                style={{ color: "var(--color-gray-700)" }}
              >
                Email address
              </label>
              <div
                className="flex h-11 items-center rounded-[6px] border transition-colors focus-within:ring-2"
                style={{
                  border: "1.5px solid var(--color-border)",
                  background: "var(--color-surface)",
                  outline: "none",
                }}
                onFocusCapture={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-brand-500)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 3px var(--color-brand-100)";
                }}
                onBlurCapture={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                <span className="pl-3 flex items-center" style={{ color: "var(--color-gray-400)" }}>
                  <Mail size={16} />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lokul.club"
                  className="flex-1 bg-transparent px-3 text-sm outline-none"
                  style={{ color: "var(--color-gray-900)" }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-semibold"
                style={{ color: "var(--color-gray-700)" }}
              >
                Password
              </label>
              <div
                className="flex h-11 items-center rounded-[6px] border transition-colors"
                style={{
                  border: "1.5px solid var(--color-border)",
                  background: "var(--color-surface)",
                }}
                onFocusCapture={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-brand-500)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 3px var(--color-brand-100)";
                }}
                onBlurCapture={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                <span className="pl-3 flex items-center" style={{ color: "var(--color-gray-400)" }}>
                  <Lock size={16} />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent px-3 text-sm outline-none"
                  style={{ color: "var(--color-gray-900)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="pr-3 flex items-center"
                  style={{ color: "var(--color-gray-400)" }}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              className="mt-1 h-11 rounded-[6px] text-sm font-semibold"
            >
              {loading ? "Signing in…" : "Sign in →"}
            </Button>
          </form>
        </div>

        {/* ── Demo credentials hint ────────────────────────────── */}
        <div
          className="mt-5 w-full max-w-sm rounded-[6px] px-5 py-4"
          style={{
            background: "var(--color-brand-50)",
            border: "1px solid var(--color-brand-100)",
          }}
        >
          <div className="mb-2 flex items-center gap-2">
            <KeyRound size={14} style={{ color: "var(--color-brand-600)" }} />
            <span className="text-xs font-semibold" style={{ color: "var(--color-brand-700)" }}>
              Demo credentials
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--color-gray-500)" }}>Email</span>
              <code
                className="rounded px-2 py-0.5 text-xs font-mono"
                style={{
                  background: "var(--color-brand-100)",
                  color: "var(--color-brand-800)",
                }}
              >
                admin@lokul.club
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--color-gray-500)" }}>Password</span>
              <code
                className="rounded px-2 py-0.5 text-xs font-mono"
                style={{
                  background: "var(--color-brand-100)",
                  color: "var(--color-brand-800)",
                }}
              >
                admin123
              </code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-5 text-xs" style={{ color: "var(--color-gray-400)" }}>
          Admin access only · <span style={{ color: "var(--color-gray-500)" }}>lokul.club</span>
        </p>
      </div>
    </div>
  );
}
