"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Store, Mail, Phone as PhoneIcon } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type LoginMode = "email" | "phone";
type Step = "phone" | "otp";

export default function MerchantLoginPage() {
  const router = useRouter();
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
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${phone}`,
        options: {
          data: {
            app: 'merchant',
          },
        },
      });

      if (error) throw error;

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
      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+91${phone}`,
        token: otpCode,
        type: 'sms',
      });

      if (error) throw error;

      if (!data.session) {
        throw new Error("Failed to create session");
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

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ background: "var(--color-surface-muted)" }}
    >
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-md text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, var(--color-brand-600), var(--color-brand-900))" }}
          >
            <Store className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-heading)" }}>Merchant Dashboard</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Manage your business catalog, offers, and orders
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
                Email
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
                Phone
              </button>
            </div>
          )}

          {mode === "email" && step === "phone" ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold" style={{ color: "var(--color-heading)" }}>
                  Login to your account
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Enter your email and password
                </p>
              </div>

              <div>
                <label htmlFor="merchant-email" className="mb-2 block text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                  Email
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
                  Password
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
                Login
              </button>

              <div className="pt-4 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Don't have an account?{" "}
                <Link href="/business" className="font-semibold transition" style={{ color: "var(--color-brand-600)" }}>
                  Register your business
                </Link>
              </div>
            </div>
          ) : step === "phone" ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold" style={{ color: "var(--color-heading)" }}>
                  Login to your account
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Enter your registered mobile number
                </p>
              </div>

              <div>
                <label htmlFor="merchant-phone" className="mb-2 block text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                  Mobile number
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
                Send OTP
              </button>

              <div className="pt-4 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Don't have an account?{" "}
                <Link href="/business" className="font-semibold transition" style={{ color: "var(--color-brand-600)" }}>
                  Register your business
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
                Change number
              </button>

              <div>
                <h2 className="text-xl font-semibold" style={{ color: "var(--color-heading)" }}>
                  Verify your number
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Enter the 6-digit code sent to +91 {phone}
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
                Verify & Login
              </button>

              <div className="text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {countdown > 0 ? (
                  <p>Resend OTP in {countdown}s</p>
                ) : (
                  <button
                    onClick={sendOtp}
                    className="font-semibold transition"
                    style={{ color: "var(--color-brand-600)" }}
                  >
                    Resend OTP
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
    </div>
  );
}
