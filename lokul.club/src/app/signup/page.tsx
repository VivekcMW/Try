"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Download, Loader2, RefreshCw, Smartphone } from "lucide-react";

/* ────────────────────────────────────────────────────────────── */
/* Types                                                          */
/* ────────────────────────────────────────────────────────────── */

type Step = "phone" | "otp" | "name" | "locality" | "done";

interface State {
  phone: string;
  otp: string[];
  name: string;
  pincode: string;
  city: string;
  userId?: string;
}

/* ────────────────────────────────────────────────────────────── */
/* Small shared UI                                                */
/* ────────────────────────────────────────────────────────────── */

function ProgressBar({ step }: { readonly step: Step }) {
  const steps: Step[] = ["phone", "otp", "name", "locality"];
  const idx = steps.indexOf(step);
  const pct = step === "done" ? 100 : ((idx + 1) / steps.length) * 100;
  return (
    <div className="h-1 w-full rounded-full" style={{ background: "var(--color-gray-200)" }}>
      <div
        className="h-1 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: "var(--color-brand-600)" }}
      />
    </div>
  );
}

function Label({ children }: { readonly children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-heading)" }}>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border px-4 py-3 text-base outline-none transition focus:ring-2"
      style={{
        borderColor: "var(--color-border)",
        background: "var(--color-surface)",
        color: "var(--color-heading)",
        // @ts-expect-error custom property
        "--tw-ring-color": "var(--color-brand-300)",
      }}
    />
  );
}

function PrimaryBtn({
  children,
  loading,
  disabled,
  onClick,
  type = "button",
}: {
  readonly children: React.ReactNode;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly onClick?: () => void;
  readonly type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-semibold text-white transition active:scale-95 disabled:opacity-50"
      style={{ background: "var(--color-brand-600)" }}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Step components                                                */
/* ────────────────────────────────────────────────────────────── */

function PhoneStep({
  phone,
  onPhoneChange,
  onSubmit,
  loading,
  error,
}: {
  readonly phone: string;
  readonly onPhoneChange: (v: string) => void;
  readonly onSubmit: () => void;
  readonly loading: boolean;
  readonly error: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--color-heading)" }}>
          Enter your mobile number
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          We&apos;ll send a one-time code to verify your number.
        </p>
      </div>

      <div>
        <Label>Mobile number</Label>
        <div className="flex gap-2">
          <div
            className="flex items-center rounded-xl border px-4 py-3 text-sm font-semibold"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface-muted)", color: "var(--color-heading)" }}
          >
            +91
          </div>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="98765 43210"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            className="flex-1 rounded-xl border px-4 py-3 text-base outline-none transition focus:ring-2"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-heading)" }}
          />
        </div>
        {error && <p className="mt-2 text-sm" style={{ color: "var(--color-danger)" }}>{error}</p>}
      </div>

      <PrimaryBtn loading={loading} disabled={phone.length !== 10} onClick={onSubmit}>
        Send OTP
      </PrimaryBtn>

      <p className="text-center text-xs" style={{ color: "var(--color-text-secondary)" }}>
        By continuing you agree to our{" "}
        <Link href="/legal/terms" className="underline">Terms</Link> and{" "}
        <Link href="/legal/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}

function OtpStep({
  otp,
  phone,
  onOtpChange,
  onSubmit,
  onResend,
  loading,
  error,
  countdown,
}: {
  readonly otp: string[];
  readonly phone: string;
  readonly onOtpChange: (idx: number, val: string) => void;
  readonly onSubmit: () => void;
  readonly onResend: () => void;
  readonly loading: boolean;
  readonly error: string;
  readonly countdown: number;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handleChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    onOtpChange(idx, digit);
    if (digit && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    digits.split("").forEach((d, i) => onOtpChange(i, d));
    refs.current[Math.min(digits.length, 5)]?.focus();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--color-heading)" }}>
          Verify your number
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Enter the 6-digit code sent to{" "}
          <span className="font-semibold" style={{ color: "var(--color-heading)" }}>
            +91 {phone.slice(0, 5)} {phone.slice(5)}
          </span>
        </p>
      </div>

      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKey(i, e)}
            className="h-14 w-12 rounded-xl border text-center text-xl font-bold outline-none transition focus:ring-2"
            style={{ borderColor: digit ? "var(--color-brand-600)" : "var(--color-border)", background: "var(--color-surface)", color: "var(--color-heading)" }}
          />
        ))}
      </div>

      {error && <p className="text-center text-sm" style={{ color: "var(--color-danger)" }}>{error}</p>}

      <PrimaryBtn loading={loading} disabled={otp.join("").length !== 6} onClick={onSubmit}>
        Verify
      </PrimaryBtn>

      <div className="text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
        {countdown > 0 ? (
          <span>Resend code in {countdown}s</span>
        ) : (
          <button type="button" onClick={onResend} className="flex items-center gap-1 mx-auto font-medium hover:underline" style={{ color: "var(--color-brand-600)" }}>
            <RefreshCw size={14} /> Resend code
          </button>
        )}
      </div>
    </div>
  );
}

function NameStep({
  name,
  onNameChange,
  onSubmit,
  loading,
  error,
}: {
  readonly name: string;
  readonly onNameChange: (v: string) => void;
  readonly onSubmit: () => void;
  readonly loading: boolean;
  readonly error: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--color-heading)" }}>
          What&apos;s your name?
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          This is how your neighbors will see you on Lokul.
        </p>
      </div>

      <div>
        <Label>Full name</Label>
        <Input
          type="text"
          placeholder="e.g. Priya Sharma"
          value={name}
          autoFocus
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        />
        {error && <p className="mt-2 text-sm" style={{ color: "var(--color-danger)" }}>{error}</p>}
      </div>

      <PrimaryBtn loading={loading} disabled={name.trim().length < 2} onClick={onSubmit}>
        Continue
      </PrimaryBtn>
    </div>
  );
}

function LocalityStep({
  pincode,
  city,
  onPincodeChange,
  onSubmit,
  loading,
  error,
}: {
  readonly pincode: string;
  readonly city: string;
  readonly onPincodeChange: (v: string) => void;
  readonly onSubmit: () => void;
  readonly loading: boolean;
  readonly error: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--color-heading)" }}>
          Your locality
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Lokul connects you to neighbors within 200m. We use your pin code to find them.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Pin code</Label>
          <Input
            type="tel"
            inputMode="numeric"
            placeholder="e.g. 560038"
            maxLength={6}
            value={pincode}
            autoFocus
            onChange={(e) => onPincodeChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          />
        </div>

        {city && (
          <div
            className="flex items-center gap-2 rounded-xl p-3"
            style={{ background: "var(--color-brand-50)", color: "var(--color-brand-700)" }}
          >
            <Check size={16} />
            <span className="text-sm font-medium">{city}</span>
          </div>
        )}

        {error && <p className="text-sm" style={{ color: "var(--color-danger)" }}>{error}</p>}
      </div>

      <PrimaryBtn loading={loading} disabled={pincode.length !== 6} onClick={onSubmit}>
        Finish setup
      </PrimaryBtn>
    </div>
  );
}

function DoneStep({ name }: { readonly name: string }) {
  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full"
        style={{ background: "var(--color-brand-50)" }}
      >
        <Check size={40} style={{ color: "var(--color-brand-600)" }} />
      </div>

      <div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--color-heading)" }}>
          Welcome to Lokul, {name.split(" ")[0]}!
        </h2>
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Your account is ready. Download the app to connect with your neighborhood.
        </p>
      </div>

      <div className="w-full space-y-3">
        <a
          href="https://play.google.com/store/apps/details?id=club.lokul"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-3 rounded-xl py-3.5 font-semibold text-white transition active:scale-95"
          style={{ background: "#1a1a1a" }}
        >
          <Smartphone size={20} />
          Download for Android
        </a>
        <a
          href="https://apps.apple.com/app/lokul/id0000000000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-3 rounded-xl border py-3.5 font-semibold transition active:scale-95"
          style={{ borderColor: "var(--color-border)", color: "var(--color-heading)" }}
        >
          <Download size={20} />
          Download for iOS
        </a>
      </div>

      <div className="w-full border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
        <Link
          href="/web/feed"
          className="text-sm font-medium hover:underline"
          style={{ color: "var(--color-brand-600)" }}
        >
          Or explore the web app →
        </Link>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Main page                                                      */
/* ────────────────────────────────────────────────────────────── */

export default function SignupPage() {
  const [step, setStep] = useState<Step>("phone");
  const [state, setState] = useState<State>({
    phone: "", otp: Array(6).fill(""), name: "", pincode: "", city: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const update = useCallback((patch: Partial<State>) =>
    setState((prev) => ({ ...prev, ...patch })), []);

  const clearError = () => setError("");

  // Start resend countdown
  const startCountdown = useCallback(() => {
    setCountdown(30);
    const id = setInterval(() =>
      setCountdown((c) => {
        if (c <= 1) { clearInterval(id); return 0; }
        return c - 1;
      }), 1000);
  }, []);

  /* ── Step handlers ──────────────────────────── */

  const sendOtp = useCallback(async () => {
    clearError();
    setLoading(true);
    try {
      const res = await fetch("/api/web/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${state.phone}` }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to send OTP.");
        return;
      }
      setStep("otp");
      startCountdown();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [state.phone, startCountdown]);

  const verifyOtp = useCallback(async () => {
    clearError();
    setLoading(true);
    try {
      const res = await fetch("/api/web/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${state.phone}`, code: state.otp.join("") }),
      });
      const d = await res.json();
      if (!res.ok || !d.verified) {
        setError(d.error ?? "Verification failed.");
        return;
      }
      setStep("name");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [state.phone, state.otp]);

  const submitName = useCallback(() => {
    if (state.name.trim().length < 2) { setError("Name must be at least 2 characters."); return; }
    clearError();
    setStep("locality");
  }, [state.name]);

  const submitLocality = useCallback(async () => {
    clearError();
    setLoading(true);
    try {
      // Look up city from pincode
      let city = state.city;
      if (!city) {
        const geo = await fetch(`/api/pincode/${state.pincode}`).then((r) => r.json()).catch(() => null);
        city = geo?.city ?? state.pincode;
        update({ city });
      }

      // Create user account
      const res = await fetch("/api/mobile/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: `+91${state.phone}`,
          name: state.name.trim(),
          pin: state.otp.join(""), // use verified OTP digits as temp PIN
          city,
        }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? "Could not create account."); return; }
      update({ userId: d.id, city });
      setStep("done");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [state, update]);

  /* ── Pincode auto-lookup ────────────────────── */
  const handlePincodeChange = useCallback(async (v: string) => {
    update({ pincode: v, city: "" });
    if (v.length === 6) {
      const geo = await fetch(`/api/pincode/${v}`).then((r) => r.json()).catch(() => null);
      if (geo?.city) update({ city: geo.city });
    }
  }, [update]);

  /* ── Back navigation ────────────────────────── */
  const stepOrder: Step[] = ["phone", "otp", "name", "locality"];
  const canGoBack = stepOrder.indexOf(step) > 0;
  const goBack = () => {
    clearError();
    const idx = stepOrder.indexOf(step);
    if (idx > 0) setStep(stepOrder[idx - 1]);
  };

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--color-background)" }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="mx-auto flex h-14 max-w-md items-center gap-3 px-4">
          {canGoBack && (
            <button
              type="button"
              onClick={goBack}
              className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-gray-100"
              aria-label="Back"
            >
              <ArrowLeft size={20} style={{ color: "var(--color-heading)" }} />
            </button>
          )}
          <Link href="/" className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))" }}
            >L</span>
            <span className="text-sm font-bold" style={{ color: "var(--color-heading)" }}>
              lokul<span style={{ color: "var(--color-brand-600)" }}>.club</span>
            </span>
          </Link>
        </div>
        {step !== "done" && (
          <div className="mx-auto max-w-md px-4 pb-0">
            <ProgressBar step={step} />
          </div>
        )}
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-md flex-1 px-6 py-8">
        {step === "phone" && (
          <PhoneStep
            phone={state.phone}
            onPhoneChange={(v) => { update({ phone: v }); clearError(); }}
            onSubmit={sendOtp}
            loading={loading}
            error={error}
          />
        )}
        {step === "otp" && (
          <OtpStep
            otp={state.otp}
            phone={state.phone}
            onOtpChange={(i, v) => {
              const next = [...state.otp];
              next[i] = v;
              update({ otp: next });
              clearError();
            }}
            onSubmit={verifyOtp}
            onResend={() => { update({ otp: Array(6).fill("") }); sendOtp(); }}
            loading={loading}
            error={error}
            countdown={countdown}
          />
        )}
        {step === "name" && (
          <NameStep
            name={state.name}
            onNameChange={(v) => { update({ name: v }); clearError(); }}
            onSubmit={submitName}
            loading={loading}
            error={error}
          />
        )}
        {step === "locality" && (
          <LocalityStep
            pincode={state.pincode}
            city={state.city}
            onPincodeChange={handlePincodeChange}
            onSubmit={submitLocality}
            loading={loading}
            error={error}
          />
        )}
        {step === "done" && <DoneStep name={state.name} />}
      </main>
    </div>
  );
}
