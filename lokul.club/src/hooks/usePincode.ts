"use client";

import { useEffect, useRef, useState } from "react";
import type { PincodeResult } from "@/app/api/pincode/[pin]/route";

export type PincodeState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "found"; data: PincodeResult }
  | { status: "not_found" }
  | { status: "error" };

export function usePincode(pin: string): PincodeState {
  const [state, setState] = useState<PincodeState>({ status: "idle" });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Clear previous debounce
    if (timerRef.current) clearTimeout(timerRef.current);
    // Cancel previous in-flight request
    if (abortRef.current) abortRef.current.abort();

    if (!/^\d{6}$/.test(pin)) {
      setState({ status: "idle" });
      return;
    }

    setState({ status: "loading" });

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`/api/pincode/${pin}`, {
          signal: controller.signal,
        });

        if (res.status === 404) {
          setState({ status: "not_found" });
          return;
        }
        if (!res.ok) {
          setState({ status: "error" });
          return;
        }

        const data: PincodeResult = await res.json();
        setState({ status: "found", data });
      } catch (err: unknown) {
        // Ignore abort errors (user typed more digits)
        if (err instanceof Error && err.name !== "AbortError") {
          setState({ status: "error" });
        }
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [pin]);

  return state;
}
