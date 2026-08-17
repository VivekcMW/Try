"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Store, Mail, Phone as PhoneIcon } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase/client";

type LoginMode = "email" | "phone";
type Step = "phone" | "otp";

const DEV_MERCHANTS: { phone: string; business: string; category: string }[] = [
  { phone: "9000000206", business: "Shah Interiors & Carpentry", category: "carpenter" },
  { phone: "9876501234", business: "Anil AC & Electrical Works", category: "electrician" },
  { phone: "9000000214", business: "Leela Fitness Studio", category: "gym" },
  { phone: "9000000304", business: "Venkat Grocery & Kirana", category: "kirana" },
  { phone: "9000000312", business: "Achar's Laundry & Dry Clean", category: "laundry" },
  { phone: "9988776655", business: "Sunita Home Maid Services", category: "maid" },
  { phone: "9000000306", business: "Gowda Pest Control Services", category: "pest_control" },
  { phone: "9000000313", business: "Shankar Photography", category: "photographer" },
  { phone: "9000000204", business: "Pawar Plumbing & Sanitation", category: "plumber" },
  { phone: "9000000106", business: "Kavita's Beauty Studio", category: "salon" },
  { phone: "9654321098", business: "Deepa Tiffin Services", category: "tiffin" },
];

const DEV_PENDING: { phone: string; business: string; category: string }[] = [
  { phone: "9071933517", business: "My SHop 1st time", category: "kirana" },
  { phone: "9078324823", business: "Salon 01", category: "salon" },
];

export default function MerchantLoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [mode, setMode] = useState<LoginMode>("email");
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const loginWithEmail = useCallback(async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");

    try {
      // Call the bridge API that handles both Supabase auth and merchant session
      const res = await fetch("/api/merchant/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login failed");
      }

      // Success - redirect to dashboard
      router.push("/merchant");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }, [email, password, router]);

  const sendOtp = useCallback(async () => {
    if (phone.length !== 10) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/web/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phone}` }),
      });

      const data = await res.json();

      if (!res.ok || !data.sent) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setStep("otp");
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }, [phone]);

  const verifyOtp = useCallback(async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) return;

    setLoading(true);
    setError("");

    try {
      // First verify the OTP
      const verifyRes = await fetch("/api/web/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phone}`, code: otpCode }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.verified) {
        throw new Error(verifyData.error || "Invalid OTP");
      }

      // Then login via merchant API
      const loginRes = await fetch("/api/merchant/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phone}`, otp: otpCode }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok || !loginData.success) {
        throw new Error(loginData.error || "Login failed");
      }

      // Success - redirect to dashboard
      router.push("/merchant");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP or login failed");
    } finally {
      setLoading(false);
    }
  }, [phone, otp, router]);

  const handleOtpChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[idx] = digit;
    setOtp(newOtp);
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
    if (e.key === "Enter" && otp.every(Boolean)) {
      verifyOtp();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    digits.split("").forEach((d, i) => {
      newOtp[i] = d;
    });
    setOtp(newOtp);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  const isDev = process.env.NODE_ENV !== "production";

  const fillPhone = (p: string) => {
    setMode("phone");
    setStep("phone");
    setPhone(p);
    setError("");
  };

  return (
    <div
      className="flex min-h-screen items-start justify-center px-4 py-12 lg:items-center"
      style={{ background: "var(--color-surface-muted)" }}
    >
      <div className="flex w-full max-w-6xl flex-col items-start justify-center gap-8 lg:flex-row">
        <div className="mx-auto w-full max-w-md space-y-8 lg:mx-0">
        {/* Header */}
        <div className="text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-md text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, var(--color-brand-600), var(--color-brand-900))" }}
          >
            <Store className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-heading)" }}>{t.merchant.auth.dashboardTitle}</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {t.merchant.auth.dashboardSubtitle}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-md p-8"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {/* Mode Toggle */}
          {step === "phone" && (
            <div className="mb-6 flex gap-2 rounded-md p-1" style={{ background: "var(--color-surface-muted)" }}>
              <button
                onClick={() => setMode("email")}
                className="flex-1 flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition"
                style={{
                  background: mode === "email" ? "var(--color-surface)" : "transparent",
                  color: mode === "email" ? "var(--color-brand-600)" : "var(--color-text-secondary)",
                  border: mode === "email" ? "1px solid var(--color-border)" : "1px solid transparent",
                }}
              >
                <Mail size={16} />
                {t.merchant.auth.email}
              </button>
              <button
                onClick={() => setMode("phone")}
                className="flex-1 flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition"
                style={{
                  background: mode === "phone" ? "var(--color-surface)" : "transparent",
                  color: mode === "phone" ? "var(--color-brand-600)" : "var(--color-text-secondary)",
                  border: mode === "phone" ? "1px solid var(--color-border)" : "1px solid transparent",
                }}
              >
                <PhoneIcon size={16} />
                {t.merchant.auth.phone}
              </button>
            </div>
          )}

          {mode === "email" && step === "phone" ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold" style={{ color: "var(--color-heading)" }}>
                  {t.merchant.auth.loginToAccount}
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  {t.merchant.auth.enterEmailPassword}
                </p>
              </div>

              <div>
                <label htmlFor="merchant-email" className="mb-2 block text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                  {t.merchant.auth.email}
                </label>
                <input
                  id="merchant-email"
                  type="email"
                  placeholder="merchant@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md px-4 py-2.5 text-base outline-none transition"
                  style={{
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                  }}
                />
              </div>

              <div>
                <label htmlFor="merchant-password" className="mb-2 block text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                  {t.merchant.auth.password}
                </label>
                <input
                  id="merchant-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loginWithEmail()}
                  className="w-full rounded-md px-4 py-2.5 text-base outline-none transition"
                  style={{
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                  }}
                />
                {error && (
                  <p className="mt-2 text-sm" style={{ color: "var(--color-danger)" }}>{error}</p>
                )}
              </div>

              <button
                onClick={loginWithEmail}
                disabled={!email || !password || loading}
                className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-base font-semibold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: "var(--color-brand-600)",
                }}
                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = "var(--color-brand-700)")}
                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = "var(--color-brand-600)")}
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {t.merchant.auth.login}
              </button>

              <div className="pt-4 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {"Don't have an account?"}{" "}
                <Link href="/business" className="font-semibold transition" style={{ color: "var(--color-brand-600)" }}>
                  {t.merchant.auth.continue}
                </Link>
              </div>
            </div>
          ) : step === "phone" ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold" style={{ color: "var(--color-heading)" }}>
                  {t.merchant.auth.loginToAccount}
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  {t.merchant.auth.phoneNumber}
                </p>
              </div>

              <div>
                <label htmlFor="merchant-phone" className="mb-2 block text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                  {t.merchant.auth.phoneNumber}
                </label>
                <div className="flex gap-2">
                  <div
                    className="flex items-center rounded-md px-3 py-2.5 text-sm font-semibold"
                    style={{
                      background: "var(--color-surface-muted)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-foreground)",
                    }}
                  >
                    +91
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                    className="flex-1 rounded-md px-4 py-2.5 text-base outline-none transition"
                    style={{
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface)",
                    }}
                  />
                </div>
                {error && (
                  <p className="mt-2 text-sm" style={{ color: "var(--color-danger)" }}>{error}</p>
                )}
              </div>

              <button
                onClick={sendOtp}
                disabled={phone.length !== 10 || loading}
                className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-base font-semibold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: "var(--color-brand-600)",
                }}
                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = "var(--color-brand-700)")}
                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = "var(--color-brand-600)")}
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {t.merchant.auth.sendOtp}
              </button>

              <div className="pt-4 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {"Don't have an account?"}{" "}
                <Link href="/business" className="font-semibold transition" style={{ color: "var(--color-brand-600)" }}>
                  {t.merchant.auth.continue}
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={() => setStep("phone")}
                className="flex items-center gap-2 text-sm font-medium transition"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <ArrowLeft size={16} />
                {t.merchant.auth.back}
              </button>

              <div>
                <h2 className="text-xl font-semibold" style={{ color: "var(--color-heading)" }}>
                  {t.merchant.auth.verifyOtp}
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  {t.merchant.auth.otpSentTo.replace("{{phone}}", `+91 ${phone}`)}
                </p>
              </div>

              <div>
                <div className="flex gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={`otp-digit-${idx}`}
                      ref={(el) => {
                        otpRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="h-14 w-full rounded-md text-center text-xl font-semibold outline-none transition"
                      style={{
                        border: "2px solid var(--color-border)",
                      }}
                    />
                  ))}
                </div>
                {error && (
                  <p className="mt-3 text-sm" style={{ color: "var(--color-danger)" }}>{error}</p>
                )}
              </div>

              <button
                onClick={verifyOtp}
                disabled={otp.some((d) => !d) || loading}
                className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-base font-semibold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: "var(--color-brand-600)",
                }}
                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = "var(--color-brand-700)")}
                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = "var(--color-brand-600)")}
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {t.merchant.auth.verifyOtp}
              </button>

              <div className="text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {countdown > 0 ? (
                  <p>{t.merchant.auth.resendIn.replace("{{seconds}}", String(countdown))}</p>
                ) : (
                  <button
                    onClick={sendOtp}
                    className="font-semibold transition"
                    style={{ color: "var(--color-brand-600)" }}
                  >
                    {t.merchant.auth.resendCode}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

          <p className="text-center text-xs" style={{ color: "var(--color-gray-500)" }}>
            Protected by Lokul.club security. Your data is encrypted.
          </p>
        </div>

        {isDev && (
          <aside
            className="w-full max-w-md space-y-4 rounded-md p-6 lg:sticky lg:top-8 lg:w-96"
            style={{
              background: "var(--color-surface)",
              border: "1px dashed var(--color-border)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  style={{ background: "var(--color-warning-50, #fef3c7)", color: "var(--color-warning-700, #b45309)" }}
                >
                  Dev only
                </span>
                <h3 className="text-sm font-semibold" style={{ color: "var(--color-heading)" }}>
                  Test credentials
                </h3>
              </div>
              <p className="mt-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                Local Postgres seed. Hidden in production. Click any phone to prefill.
              </p>
            </div>

            <div
              className="rounded-md p-3"
              style={{ background: "var(--color-surface-muted)", border: "1px solid var(--color-border)" }}
            >
              <div className="text-xs font-semibold" style={{ color: "var(--color-foreground)" }}>
                OTP (any 6-digit code works in dev)
              </div>
              <div
                className="mt-1 font-mono text-lg font-bold tracking-widest"
                style={{ color: "var(--color-brand-600)" }}
              >
                123456
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                Active merchants
              </div>
              <ul className="space-y-1">
                {DEV_MERCHANTS.map((m) => (
                  <li key={m.phone}>
                    <button
                      onClick={() => fillPhone(m.phone)}
                      className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs transition hover:bg-[var(--color-surface-muted)]"
                      style={{ color: "var(--color-foreground)" }}
                    >
                      <span className="font-mono font-semibold" style={{ color: "var(--color-brand-600)" }}>
                        {m.phone}
                      </span>
                      <span className="flex-1 truncate" style={{ color: "var(--color-text-secondary)" }}>
                        {m.business}
                      </span>
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                        style={{ background: "var(--color-surface-muted)", color: "var(--color-text-secondary)" }}
                      >
                        {m.category}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                Pending verification
              </div>
              <ul className="space-y-1">
                {DEV_PENDING.map((m) => (
                  <li key={m.phone}>
                    <button
                      onClick={() => fillPhone(m.phone)}
                      className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs transition hover:bg-[var(--color-surface-muted)]"
                      style={{ color: "var(--color-foreground)" }}
                    >
                      <span className="font-mono font-semibold" style={{ color: "var(--color-brand-600)" }}>
                        {m.phone}
                      </span>
                      <span className="flex-1 truncate" style={{ color: "var(--color-text-secondary)" }}>
                        {m.business}
                      </span>
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                        style={{ background: "var(--color-surface-muted)", color: "var(--color-text-secondary)" }}
                      >
                        {m.category}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="rounded-md p-3 text-xs"
              style={{ background: "var(--color-surface-muted)", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}
            >
              <div className="mb-1 font-semibold" style={{ color: "var(--color-foreground)" }}>
                E2E bypass (E2E_TEST=1)
              </div>
              <div>
                Phone{" "}
                <button
                  onClick={() => fillPhone("9999999999")}
                  className="font-mono font-semibold underline"
                  style={{ color: "var(--color-brand-600)" }}
                >
                  9999999999
                </button>{" "}
                — logs in as synthetic "Test Shop", no OTP.
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
