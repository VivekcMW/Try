"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { WifiOff, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/ui";

type NotificationsContextValue = {
  online: boolean;
  kycPending: boolean;
};

const NotificationsContext = createContext<NotificationsContextValue>({
  online: true,
  kycPending: false,
});

export function useMerchantNotifications(): NotificationsContextValue {
  return useContext(NotificationsContext);
}

type PollOrder = {
  id: string;
  status: string;
  paymentStatus: string;
  totalPaise?: number | null;
  customer?: { name?: string | null } | null;
};

const NEW_ORDER_POLL_MS = 20_000;
const PAYMENT_POLL_MS = 25_000;

export function MerchantNotificationProvider({
  merchantStatus,
  children,
}: {
  merchantStatus: string | null;
  children: React.ReactNode;
}) {
  const toast = useToast();
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  // --- Offline / online ---
  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      toast.success("Back online");
    };
    const goOffline = () => {
      setOnline(false);
      toast.warning("You're offline", "Changes will retry when back online");
    };
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [toast]);

  // --- KYC pending banner + one-time toast ---
  const kycPending = merchantStatus === "pending_verification";
  const kycToastFiredRef = useRef(false);
  useEffect(() => {
    if (kycPending && !kycToastFiredRef.current) {
      kycToastFiredRef.current = true;
      toast.warning(
        "Verification pending",
        "Your merchant account is awaiting KYC review"
      );
    }
  }, [kycPending, toast]);

  // --- New order + payment watcher (shared poll) ---
  const seenOrderIdsRef = useRef<Set<string> | null>(null);
  const paidOrderIdsRef = useRef<Set<string> | null>(null);
  const primedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function pollOnce() {
      if (!navigator.onLine) return;
      try {
        const res = await fetch("/api/merchant/orders?limit=50", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { orders?: PollOrder[] };
        if (cancelled || !data.orders) return;

        const currentIds = new Set(data.orders.map((o) => o.id));
        const currentPaidIds = new Set(
          data.orders.filter((o) => o.paymentStatus === "paid").map((o) => o.id)
        );

        // First poll: prime state without firing toasts.
        if (!primedRef.current) {
          seenOrderIdsRef.current = currentIds;
          paidOrderIdsRef.current = currentPaidIds;
          primedRef.current = true;
          return;
        }

        // New orders — anything in current pending that we haven't seen.
        const newPending = data.orders.filter(
          (o) =>
            o.status === "pending" &&
            !seenOrderIdsRef.current?.has(o.id)
        );
        for (const o of newPending) {
          const who = o.customer?.name ? ` from ${o.customer.name}` : "";
          toast.info("New order received", `Order #${o.id.slice(-6)}${who}`);
        }

        // Payment received — any order that transitioned to paid.
        const newlyPaid = data.orders.filter(
          (o) =>
            o.paymentStatus === "paid" &&
            !paidOrderIdsRef.current?.has(o.id)
        );
        for (const o of newlyPaid) {
          const amount =
            typeof o.totalPaise === "number"
              ? ` ₹${(o.totalPaise / 100).toFixed(0)}`
              : "";
          toast.success("Payment received", `Order #${o.id.slice(-6)}${amount}`);
        }

        seenOrderIdsRef.current = currentIds;
        paidOrderIdsRef.current = currentPaidIds;
      } catch {
        // Network hiccup — ignore; next tick will retry.
      }
    }

    pollOnce();
    const interval = setInterval(
      pollOnce,
      Math.min(NEW_ORDER_POLL_MS, PAYMENT_POLL_MS)
    );

    const onVisibility = () => {
      if (document.visibilityState === "visible") pollOnce();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [toast]);

  return (
    <NotificationsContext.Provider value={{ online, kycPending }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function MerchantBanners() {
  const { online, kycPending } = useMerchantNotifications();

  if (online && !kycPending) return null;

  return (
    <div className="flex w-full flex-col">
      {!online && (
        <div
          role="status"
          className="flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium"
          style={{
            background: "var(--color-danger-50, #fef2f2)",
            color: "var(--color-danger-700, #b91c1c)",
            borderBottom: "1px solid var(--color-danger-200, #fecaca)",
          }}
        >
          <WifiOff size={14} />
          <span>You're offline — changes will retry when back online</span>
        </div>
      )}
      {kycPending && (
        <div
          className="flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium"
          style={{
            background: "var(--color-warning-50, #fffbeb)",
            color: "var(--color-warning-700, #b45309)",
            borderBottom: "1px solid var(--color-warning-200, #fde68a)",
          }}
        >
          <ShieldAlert size={14} />
          <span>Verification pending — your account is under KYC review.</span>
          <Link
            href="/merchant/settings"
            className="underline underline-offset-2"
          >
            View status
          </Link>
        </div>
      )}
    </div>
  );
}
