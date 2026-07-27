"use client";

import { useState } from "react";
import { MapPin, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { usePincode } from "@/hooks/usePincode";

interface PincodeFieldProps {
  /** Name used in the form data — defaults to "pincode" */
  name?: string;
  label?: string;
  required?: boolean;
}

export function PincodeField({
  name = "pincode",
  label = "Pin code",
  required,
}: Readonly<PincodeFieldProps>) {
  const [value, setValue] = useState("");
  const lookup = usePincode(value);

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      <label
        htmlFor="pincode-input"
        className="text-sm font-medium"
        style={{ color: "var(--color-foreground)" }}
      >
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>

      {/* Input wrapper */}
      <div
        className="ds-input flex items-center gap-2 p-0 overflow-hidden"
        style={{ paddingLeft: 0, paddingRight: 0 }}
      >
        {/* Pin icon */}
        <span className="flex items-center pl-3" style={{ color: "var(--color-text-disabled)" }}>
          <MapPin size={15} />
        </span>

        <input
          id="pincode-input"
          type="text"
          name={name}
          inputMode="numeric"
          placeholder="400001"
          pattern="\d{6}"
          maxLength={6}
          required={required}
          value={value}
          onChange={(e) => setValue(e.target.value.replaceAll(/\D/g, "").slice(0, 6))}
          className="flex-1 bg-transparent py-2.5 pr-3 text-sm outline-none placeholder:opacity-60"
          style={{ color: "var(--color-foreground)" }}
          autoComplete="postal-code"
        />

        {/* Status icon */}
        {lookup.status === "loading" && (
          <span className="pr-3 flex items-center">
            <Loader2 size={15} className="animate-spin" style={{ color: "var(--color-brand-500)" }} />
          </span>
        )}
        {lookup.status === "found" && (
          <span className="pr-3 flex items-center">
            <CheckCircle2 size={15} style={{ color: "#059669" }} />
          </span>
        )}
        {lookup.status === "not_found" && (
          <span className="pr-3 flex items-center">
            <AlertCircle size={15} style={{ color: "#dc2626" }} />
          </span>
        )}
      </div>

      {/* Area hint below input */}
      {lookup.status === "found" && (
        <p
          className="flex items-center gap-1.5 text-xs font-medium"
          style={{ color: "#059669" }}
        >
          <MapPin size={11} />
          {lookup.data.label}
        </p>
      )}
      {lookup.status === "not_found" && (
        <p className="text-xs" style={{ color: "#dc2626" }}>
          PIN code not found. Please check and re-enter.
        </p>
      )}
    </div>
  );
}
