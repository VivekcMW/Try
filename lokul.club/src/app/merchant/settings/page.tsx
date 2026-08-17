"use client";

import { useEffect, useRef, useState } from "react";
import { Settings as SettingsIcon, User, Phone, MapPin, Clock, Store, AlertTriangle, XCircle, CheckCircle, Pencil, Bell, Wrench, ShoppingCart, Shield, CalendarX, CreditCard, ChevronDown, ChevronUp, Upload, Trash2, Loader2 } from "lucide-react";
import { useMerchantProfile } from "@/lib/merchant-profile-context";
import { CategoryBadge } from "@/components/merchant/CategoryBadge";
import type { MerchantCategory } from "@/types/merchant-categories";
import { useToast } from "@/components/ui";
import { LOCALES, useI18n } from "@/lib/i18n";
import type { Locale } from "@/i18n";

type MerchantProfile = {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  avatarUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  status: string;
  ratingAvg?: number | null;
  ratingCount?: number | null;
  acceptingOrders?: boolean;
  closedReason?: string | null;
  closedUntil?: string | null;
  businessHoursStart?: string | null;
  businessHoursEnd?: string | null;
  estimatedDeliveryMins?: number | null;
  owner: {
    name: string;
    phone: string;
  };
};

export default function SettingsPage() {
  const profile = useMerchantProfile();
  const toast = useToast();
  const { locale, setLocale } = useI18n();
  const [merchant, setMerchant] = useState<MerchantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [closedReason, setClosedReason] = useState("");
  const [autoReopen, setAutoReopen] = useState(false);
  const [closedUntil, setClosedUntil] = useState("");
  const [businessHoursStart, setBusinessHoursStart] = useState("");
  const [businessHoursEnd, setBusinessHoursEnd] = useState("");
  const [estimatedDeliveryMins, setEstimatedDeliveryMins] = useState(30);
  const [updating, setUpdating] = useState(false);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", description: "", avatarUrl: "" });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);

  // Delivery fee state (in rupees for the UI; stored as paise)
  const [deliveryFeeRupees, setDeliveryFeeRupees] = useState(20);
  const [savingDeliveryFee, setSavingDeliveryFee] = useState(false);

  // Visit / Inspection Charge (home_services only)
  const [visitChargeRupees, setVisitChargeRupees] = useState(0);
  const [savingVisitCharge, setSavingVisitCharge] = useState(false);

  // Location state
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [serviceRadiusKm, setServiceRadiusKm] = useState<number | "">("");
  const [savingLocation, setSavingLocation] = useState(false);

  // Order rules state
  const [minimumOrderRupees, setMinimumOrderRupees] = useState<number | "">("");
  const [freeDeliveryAboveRupees, setFreeDeliveryAboveRupees] = useState<number | "">("");
  const [savingOrderRules, setSavingOrderRules] = useState(false);

  // Compliance state
  const [gstNumber, setGstNumber] = useState("");
  const [fssaiNumber, setFssaiNumber] = useState("");
  const [businessLicense, setBusinessLicense] = useState("");
  const [savingCompliance, setSavingCompliance] = useState(false);
  const [complianceExpanded, setComplianceExpanded] = useState(false);

  // Schedule state
  const [closedWeekdays, setClosedWeekdays] = useState<number[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [savingPayments, setSavingPayments] = useState(false);

  // Notification preferences state
  const [notifPrefs, setNotifPrefs] = useState({
    newOrder: true,
    orderUpdates: true,
    lowStock: true,
  });
  const [notifSavedFlash, setNotifSavedFlash] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/merchant/auth/session");
        const data = await res.json();
        
        if (!data.authenticated) return;

        const merchantData = {
          ...data.merchant,
          owner: data.user,
        };

        setMerchant(merchantData);
        setAcceptingOrders(merchantData.acceptingOrders ?? true);
        setClosedReason(merchantData.closedReason || "");
        setBusinessHoursStart(merchantData.businessHoursStart || "");
        setBusinessHoursEnd(merchantData.businessHoursEnd || "");
        setEstimatedDeliveryMins(merchantData.estimatedDeliveryMins || 30);
        if (merchantData.closedUntil) {
          setAutoReopen(true);
          setClosedUntil(new Date(merchantData.closedUntil).toISOString().slice(0, 16));
        }
        setProfileForm({
          name: merchantData.name || "",
          description: merchantData.description || "",
          avatarUrl: merchantData.avatarUrl || "",
        });

        // Load notification preferences
        try {
          const notifRes = await fetch("/api/merchant/settings/notifications");
          if (notifRes.ok) {
            const notifData = await notifRes.json();
            setNotifPrefs(notifData);
          }
        } catch {
          // Use defaults silently
        }

        // Load visit charge (home_services only)
        try {
          const vcRes = await fetch("/api/merchant/settings/visit-charge");
          if (vcRes.ok) {
            const vcData = await vcRes.json();
            if (typeof vcData.visitChargePaise === "number") {
              setVisitChargeRupees(vcData.visitChargePaise / 100);
            }
          }
        } catch {
          // Use defaults silently
        }

        // Load location settings
        try {
          const locRes = await fetch("/api/merchant/settings/location");
          if (locRes.ok) {
            const locData = await locRes.json();
            setAddressLine1(locData.addressLine1 || "");
            setAddressLine2(locData.addressLine2 || "");
            setServiceRadiusKm(locData.serviceRadiusKm ?? "");
          }
        } catch {
          // Use defaults silently
        }

        // Load order rules
        try {
          const orRes = await fetch("/api/merchant/settings/order-rules");
          if (orRes.ok) {
            const orData = await orRes.json();
            setMinimumOrderRupees(orData.minimumOrderRupees ?? "");
            setFreeDeliveryAboveRupees(orData.freeDeliveryAboveRupees ?? "");
          }
        } catch {
          // Use defaults silently
        }

        // Load compliance data
        try {
          const compRes = await fetch("/api/merchant/settings/compliance");
          if (compRes.ok) {
            const compData = await compRes.json();
            setGstNumber(compData.gstNumber || "");
            setFssaiNumber(compData.fssaiNumber || "");
            setBusinessLicense(compData.businessLicense || "");
          }
        } catch {
          // Use defaults silently
        }

        // Load schedule data
        try {
          const schedRes = await fetch("/api/merchant/settings/schedule");
          if (schedRes.ok) {
            const schedData = await schedRes.json();
            setClosedWeekdays(schedData.closedWeekdays ?? []);
            setPaymentMethods(schedData.paymentMethods ?? []);
          }
        } catch {
          // Use defaults silently
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleToggleOrders(enabled: boolean) {
    setUpdating(true);
    try {
      const res = await fetch("/api/merchant/settings/accepting-orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acceptingOrders: enabled,
          closedReason: enabled ? null : closedReason || null,
          closedUntil: enabled ? null : autoReopen && closedUntil ? new Date(closedUntil).toISOString() : null,
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setAcceptingOrders(enabled);
        if (enabled) {
          setClosedReason("");
          setAutoReopen(false);
          setClosedUntil("");
        }
        toast.success(data.message || (enabled ? "Now accepting orders" : "Orders paused"));
      } else {
        toast.error(data.error || "Failed to update settings");
      }
    } catch (err) {
      console.error("Failed to update accepting orders:", err);
      toast.error("Failed to update settings");
    } finally {
      setUpdating(false);
    }
  }

  async function handleSaveClosedSettings() {
    setUpdating(true);
    try {
      const res = await fetch("/api/merchant/settings/accepting-orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acceptingOrders: false,
          closedReason: closedReason || null,
          closedUntil: autoReopen && closedUntil ? new Date(closedUntil).toISOString() : null,
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Settings updated");
      } else {
        toast.error(data.error || "Failed to update settings");
      }
    } catch (err) {
      console.error("Failed to update closed settings:", err);
      toast.error("Failed to update settings");
    } finally {
      setUpdating(false);
    }
  }

  async function handleSaveBusinessHours() {
    if (!businessHoursStart || !businessHoursEnd) {
      toast.warning("Please set both opening and closing times");
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch("/api/merchant/settings/business-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessHoursStart,
          businessHoursEnd,
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Business hours updated");
      } else {
        toast.error(data.error || "Failed to update business hours");
      }
    } catch (err) {
      console.error("Failed to update business hours:", err);
      toast.error("Failed to update business hours");
    } finally {
      setUpdating(false);
    }
  }

  async function handleSaveDeliveryTime() {
    if (!estimatedDeliveryMins || estimatedDeliveryMins < 5 || estimatedDeliveryMins > 180) {
      toast.warning("Please enter a delivery time between 5 and 180 minutes");
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch("/api/merchant/settings/delivery-time", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estimatedDeliveryMins,
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Delivery time updated");
      } else {
        toast.error(data.error || "Failed to update delivery time");
      }
    } catch (err) {
      console.error("Failed to update delivery time:", err);
      toast.error("Failed to update delivery time");
    } finally {
      setUpdating(false);
    }
  }

  async function handleSaveProfile() {
    if (!profileForm.name.trim()) {
      toast.warning("Business name cannot be empty");
      return;
    }
    if (profileForm.name.trim().length > 100) {
      toast.warning("Business name must be 100 characters or fewer");
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch("/api/merchant/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileForm.name,
          description: profileForm.description,
          avatarUrl: profileForm.avatarUrl,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMerchant((prev) =>
          prev
            ? {
                ...prev,
                name: data.merchant.name,
                description: data.merchant.description,
                avatarUrl: data.merchant.avatarUrl,
              }
            : prev
        );
        setIsEditingProfile(false);
        toast.success("Profile updated");
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  }

  async function handleLogoFile(file: File) {
    setLogoError(null);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      setLogoError("Logo must be JPEG, PNG, WEBP, or SVG");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("Logo must be 2 MB or smaller");
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.readAsDataURL(file);
    }).catch((e) => {
      setLogoError(e.message);
      return null;
    });
    if (!dataUrl) return;

    setUploadingLogo(true);
    try {
      const res = await fetch("/api/merchant/settings/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileDataUrl: dataUrl }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }
      setProfileForm((f) => ({ ...f, avatarUrl: data.avatarUrl }));
      setMerchant((prev) => (prev ? { ...prev, avatarUrl: data.avatarUrl } : prev));
      toast.success("Logo uploaded");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setLogoError(msg);
      toast.error(msg);
    } finally {
      setUploadingLogo(false);
    }
  }

  function handleCancelEditProfile() {
    if (merchant) {
      setProfileForm({
        name: merchant.name || "",
        description: merchant.description || "",
        avatarUrl: merchant.avatarUrl || "",
      });
    }
    setIsEditingProfile(false);
  }

  async function handleNotifToggle(key: keyof typeof notifPrefs, value: boolean) {
    const next = { ...notifPrefs, [key]: value };
    setNotifPrefs(next);
    try {
      const res = await fetch("/api/merchant/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (res.ok) {
        setNotifSavedFlash(true);
        setTimeout(() => setNotifSavedFlash(false), 2000);
      } else {
        // Revert on error
        setNotifPrefs(notifPrefs);
      }
    } catch {
      setNotifPrefs(notifPrefs);
    }
  }

  async function handleSaveDeliveryFee() {
    if (deliveryFeeRupees < 0 || deliveryFeeRupees > 500) {
      toast.warning("Delivery fee must be between ₹0 and ₹500");
      return;
    }

    setSavingDeliveryFee(true);
    try {
      const res = await fetch("/api/merchant/settings/delivery-fee", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryFeePaise: Math.round(deliveryFeeRupees * 100) }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.note) {
          toast.info("Saved", "Full persistence requires a schema migration");
        } else {
          toast.success("Delivery fee updated");
        }
      } else {
        toast.error(data.error || "Failed to update delivery fee");
      }
    } catch (err) {
      console.error("Failed to update delivery fee:", err);
      toast.error("Failed to update delivery fee");
    } finally {
      setSavingDeliveryFee(false);
    }
  }

  async function handleSaveVisitCharge() {
    if (visitChargeRupees < 0 || visitChargeRupees > 10000) {
      toast.warning("Visit charge must be between ₹0 and ₹10,000");
      return;
    }

    setSavingVisitCharge(true);
    try {
      const res = await fetch("/api/merchant/settings/visit-charge", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitChargePaise: Math.round(visitChargeRupees * 100) }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Visit charge updated");
      } else {
        toast.error(data.error || "Failed to update visit charge");
      }
    } catch (err) {
      console.error("Failed to update visit charge:", err);
      toast.error("Failed to update visit charge");
    } finally {
      setSavingVisitCharge(false);
    }
  }

  async function handleSaveLocation() {
    setSavingLocation(true);
    try {
      const res = await fetch("/api/merchant/settings/location", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressLine1, addressLine2, serviceRadiusKm: serviceRadiusKm === "" ? null : serviceRadiusKm }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Location settings updated");
      } else {
        toast.error(data.error || "Failed to update location settings");
      }
    } catch {
      toast.error("Failed to update location settings");
    } finally {
      setSavingLocation(false);
    }
  }

  async function handleSaveOrderRules() {
    setSavingOrderRules(true);
    try {
      const res = await fetch("/api/merchant/settings/order-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minimumOrderRupees: minimumOrderRupees === "" ? null : minimumOrderRupees,
          freeDeliveryAboveRupees: freeDeliveryAboveRupees === "" ? null : freeDeliveryAboveRupees,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Order rules updated");
      } else {
        toast.error(data.error || "Failed to update order rules");
      }
    } catch {
      toast.error("Failed to update order rules");
    } finally {
      setSavingOrderRules(false);
    }
  }

  async function handleSaveCompliance() {
    setSavingCompliance(true);
    try {
      const res = await fetch("/api/merchant/settings/compliance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gstNumber, fssaiNumber, businessLicense }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.warning) {
          toast.warning("Compliance details saved", data.warning);
        } else {
          toast.success("Compliance details updated");
        }
      } else {
        toast.error(data.error || "Failed to update compliance details");
      }
    } catch {
      toast.error("Failed to update compliance details");
    } finally {
      setSavingCompliance(false);
    }
  }

  function toggleClosedWeekday(day: number) {
    setClosedWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleSaveSchedule() {
    setSavingSchedule(true);
    try {
      const res = await fetch("/api/merchant/settings/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ closedWeekdays }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Weekly schedule updated");
      } else {
        toast.error(data.error || "Failed to update schedule");
      }
    } catch {
      toast.error("Failed to update schedule");
    } finally {
      setSavingSchedule(false);
    }
  }

  function togglePaymentMethod(method: string) {
    setPaymentMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  }

  async function handleSavePaymentMethods() {
    setSavingPayments(true);
    try {
      const res = await fetch("/api/merchant/settings/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethods }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Payment methods updated");
      } else {
        toast.error(data.error || "Failed to update payment methods");
      }
    } catch {
      toast.error("Failed to update payment methods");
    } finally {
      setSavingPayments(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600" />
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="w-full max-w-md rounded-md border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-500" />
          <h2 className="text-lg font-semibold text-red-900">Settings unavailable</h2>
          <p className="mt-2 text-sm text-red-700">
            We couldn’t load your merchant settings. Please refresh and try again.
          </p>
        </div>
      </div>
    );
  }

  const statusColor = {
    active: "bg-green-100 text-green-700",
    pending_verification: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-700",
    suspended: "bg-red-100 text-red-700",
  }[merchant.status] ?? "bg-gray-100 text-gray-700";

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your business profile and account settings
          </p>
        </div>

        <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm">
          <span className="font-medium">Language</span>
          <select
            aria-label="Language"
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="rounded border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            {LOCALES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Business Profile Card */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-600">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">Business Profile</h2>
              <p className="text-sm text-gray-600">Your business information</p>
            </div>
            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Pencil size={14} />
                Edit
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Business Name</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                    maxLength={100}
                    className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Your business name"
                  />
                ) : (
                  <p className="rounded-md border border-gray-200 bg-gray-50 px-4 py-2.5 text-base text-gray-900">
                    {merchant.name}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-2.5">
                  <CategoryBadge category={merchant.category as MerchantCategory} size="md" />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              {isEditingProfile ? (
                <textarea
                  value={profileForm.description}
                  onChange={(e) => setProfileForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  placeholder="Describe your business (optional)"
                />
              ) : (
                <p className="rounded-md border border-gray-200 bg-gray-50 px-4 py-2.5 text-base text-gray-900">
                  {merchant.description || "No description added"}
                </p>
              )}
            </div>

            {isEditingProfile && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Logo</label>
                <div className="flex items-start gap-4 rounded-md border border-gray-200 bg-gray-50 p-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-white">
                    {profileForm.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profileForm.avatarUrl}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <Store className="h-8 w-8 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <input
                        ref={logoFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoFile(file);
                          e.target.value = "";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        disabled={uploadingLogo}
                        className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {uploadingLogo ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Upload size={14} />
                        )}
                        {uploadingLogo ? "Uploading…" : "Upload logo"}
                      </button>
                      {profileForm.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileForm((f) => ({ ...f, avatarUrl: "" }));
                            setLogoError(null);
                          }}
                          disabled={uploadingLogo}
                          className="flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      JPEG, PNG, WEBP or SVG. Max 2 MB. Square images work best.
                    </p>
                    {logoError && (
                      <p className="text-xs text-red-600">{logoError}</p>
                    )}
                  </div>
                </div>

                <label className="mb-1 mt-4 block text-sm font-medium text-gray-700">Logo URL</label>
                <input
                  type="url"
                  value={profileForm.avatarUrl}
                  onChange={(e) => setProfileForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="https://… (or paste a hosted URL)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Auto-filled after upload. You can also paste a URL from an external image host.
                </p>
              </div>
            )}

            {merchant.address && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
                <div className="flex items-start gap-2 rounded-md border border-gray-200 bg-gray-50 px-4 py-2.5">
                  <MapPin size={18} className="mt-0.5 text-gray-500" />
                  <p className="flex-1 text-base text-gray-900">{merchant.address}</p>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {merchant.phone && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Business Phone</label>
                  <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-4 py-2.5">
                    <Phone size={16} className="text-gray-500" />
                    <p className="text-base text-gray-900">{merchant.phone}</p>
                  </div>
                </div>
              )}
              {merchant.whatsapp && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">WhatsApp</label>
                  <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-4 py-2.5">
                    <Phone size={16} className="text-gray-500" />
                    <p className="text-base text-gray-900">{merchant.whatsapp}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Account Status</label>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusColor}`}>
                {merchant.status.replace(/_/g, " ").toUpperCase()}
              </span>
            </div>

            {merchant.ratingAvg != null && merchant.ratingAvg > 0 && (
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-gray-900">{merchant.ratingAvg.toFixed(1)} ★</div>
                  <div className="text-sm text-gray-600">
                    ({merchant.ratingCount ?? 0} {merchant.ratingCount === 1 ? "review" : "reviews"})
                  </div>
                </div>
              </div>
            )}
          </div>

          {isEditingProfile && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={updating}
                className="flex-1 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                {updating ? "Saving..." : "Save Profile"}
              </button>
              <button
                onClick={handleCancelEditProfile}
                disabled={updating}
                className="flex-1 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Business Operations Card */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-600">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Business Operations</h2>
              <p className="text-sm text-gray-600">Control order acceptance</p>
            </div>
          </div>

          {/* Accept Orders Toggle */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Accept Orders</h3>
              <p className="text-sm text-gray-600 mt-1">
                {acceptingOrders 
                  ? "Your business is currently accepting orders from customers" 
                  : "Your business is paused. Customers cannot place new orders"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input 
                type="checkbox" 
                checked={acceptingOrders}
                onChange={(e) => handleToggleOrders(e.target.checked)}
                disabled={updating}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {/* Closed Settings (shown when disabled) */}
          {!acceptingOrders && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for closing (visible to customers)
                </label>
                <select 
                  value={closedReason}
                  onChange={(e) => setClosedReason(e.target.value)}
                  disabled={updating}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No reason specified</option>
                  <option value="On vacation">On vacation</option>
                  <option value="Out of stock">Out of stock</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="High demand">High demand - temporarily paused</option>
                  <option value="Holiday">Holiday</option>
                  <option value="Personal reasons">Personal reasons</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              {/* Optional: Auto-reopen */}
              <div>
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={autoReopen}
                    onChange={(e) => setAutoReopen(e.target.checked)}
                    disabled={updating}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Auto-reopen at specific time</span>
                </label>
                {autoReopen && (
                  <input 
                    type="datetime-local"
                    value={closedUntil}
                    onChange={(e) => setClosedUntil(e.target.value)}
                    disabled={updating}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                )}
              </div>
              
              <button 
                onClick={handleSaveClosedSettings}
                disabled={updating}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
          
          {/* Warning message when orders are disabled */}
          {!acceptingOrders && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900 mb-1">Orders Paused</p>
                <p className="text-sm text-yellow-800">
                  Customers cannot place new orders while your business is paused. Existing orders can still be managed normally.
                </p>
              </div>
            </div>
          )}
          
          {/* Success message when orders are enabled */}
          {acceptingOrders && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 mb-1">Accepting Orders</p>
                <p className="text-sm text-green-800">
                  Your business is live and customers can place orders normally.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Business Hours Card */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-600">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Business Hours</h2>
              <p className="text-sm text-gray-600">Set your operating hours</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Opening Time</label>
                <input
                  type="time"
                  value={businessHoursStart}
                  onChange={(e) => setBusinessHoursStart(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Closing Time</label>
                <input
                  type="time"
                  value={businessHoursEnd}
                  onChange={(e) => setBusinessHoursEnd(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <button
              onClick={handleSaveBusinessHours}
              disabled={updating || !businessHoursStart || !businessHoursEnd}
              className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updating ? "Saving..." : "Save Business Hours"}
            </button>

            {businessHoursStart && businessHoursEnd && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-900">
                  Your business hours are set from <strong>{businessHoursStart}</strong> to <strong>{businessHoursEnd}</strong>. This will be visible to customers on your profile.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Estimated Delivery Time Card */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-600">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Estimated Delivery Time</h2>
              <p className="text-sm text-gray-600">Set typical preparation time for orders</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="180"
                step="5"
                value={estimatedDeliveryMins}
                onChange={(e) => setEstimatedDeliveryMins(Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g., 30"
              />
              <p className="mt-1 text-xs text-gray-500">
                Between 5 and 180 minutes. This helps customers know when their order will be ready.
              </p>
            </div>

            <button
              onClick={handleSaveDeliveryTime}
              disabled={updating || !estimatedDeliveryMins || estimatedDeliveryMins < 5 || estimatedDeliveryMins > 180}
              className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updating ? "Saving..." : "Save Delivery Time"}
            </button>

            {estimatedDeliveryMins && estimatedDeliveryMins >= 5 && estimatedDeliveryMins <= 180 && (
              <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                <p className="text-sm text-orange-900">
                  Orders will show <strong>Ready in ~{estimatedDeliveryMins} mins</strong> to customers when they view your profile.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Visit / Inspection Charge Card — Home Services only */}
        {profile === "home_services" && (
          <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-600">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Visit / Inspection Charge</h2>
                <p className="text-sm text-gray-600">Fee charged for site visits or inspections</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Visit Charge (₹)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    step="10"
                    value={visitChargeRupees}
                    onChange={(e) => setVisitChargeRupees(Number(e.target.value))}
                    className="w-full rounded-md border border-gray-300 pl-8 pr-4 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="e.g., 200"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Set to ₹0 if you do not charge for site visits.
                </p>
              </div>

              <button
                onClick={handleSaveVisitCharge}
                disabled={savingVisitCharge || visitChargeRupees < 0 || visitChargeRupees > 10000}
                className="w-full rounded-md bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingVisitCharge ? "Saving..." : "Save Visit Charge"}
              </button>

              <div className="rounded-md border border-purple-200 bg-purple-50 p-4">
                <p className="text-sm text-purple-900">
                  {visitChargeRupees === 0
                    ? "You offer free site visits to customers."
                    : <>Customers are shown a visit / inspection charge of <strong>₹{visitChargeRupees}</strong> before booking.</>}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Fee Card */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-600">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Delivery Fee</h2>
              <p className="text-sm text-gray-600">Set the fee charged for home delivery</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Delivery Fee (₹)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-medium">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  max="500"
                  step="1"
                  value={deliveryFeeRupees}
                  onChange={(e) => setDeliveryFeeRupees(Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 pl-8 pr-4 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., 20"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Between ₹0 (free delivery) and ₹500.
              </p>
            </div>

            <button
              onClick={handleSaveDeliveryFee}
              disabled={savingDeliveryFee || deliveryFeeRupees < 0 || deliveryFeeRupees > 500}
              className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingDeliveryFee ? "Saving..." : "Save Delivery Fee"}
            </button>

            <div className="rounded-md border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-900">
                {deliveryFeeRupees === 0
                  ? "Customers enjoy free delivery from your store."
                  : <>Customers are charged <strong>₹{deliveryFeeRupees}</strong> for home delivery. Set to ₹0 for free delivery.</>}
              </p>
            </div>
          </div>
        </div>

        {/* Shop Location & Delivery Zone Card */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-600">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Shop Location &amp; Delivery Zone</h2>
              <p className="text-sm text-gray-600">Your physical address and service radius</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Address Line 1</label>
              <input
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Shop number, street name"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Address Line 2</label>
              <input
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Floor, landmark, building (optional)"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Service Radius (km)</label>
              <input
                type="number"
                min="0.5"
                max="25"
                step="0.5"
                value={serviceRadiusKm}
                onChange={(e) => setServiceRadiusKm(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g., 5 (leave blank for platform default)"
              />
              <p className="mt-1 text-xs text-gray-500">Leave blank to use platform default. Range: 0.5 – 25 km.</p>
            </div>
            <button
              onClick={handleSaveLocation}
              disabled={savingLocation}
              className="w-full rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingLocation ? "Saving..." : "Save Location"}
            </button>
          </div>
        </div>

        {/* Order Rules Card */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-600">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Order Rules</h2>
              <p className="text-sm text-gray-600">Minimum order and free delivery thresholds</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Minimum Order Amount (₹)</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-medium">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={minimumOrderRupees}
                  onChange={(e) => setMinimumOrderRupees(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 pl-8 pr-4 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="0 = no minimum"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Free Delivery Above (₹)</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-medium">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={freeDeliveryAboveRupees}
                  onChange={(e) => setFreeDeliveryAboveRupees(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 pl-8 pr-4 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="0 = disabled"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Customers get free delivery when their order exceeds this amount. Set 0 to disable.</p>
            </div>
            <button
              onClick={handleSaveOrderRules}
              disabled={savingOrderRules}
              className="w-full rounded-md bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingOrderRules ? "Saving..." : "Save Order Rules"}
            </button>
          </div>
        </div>

        {/* Compliance & Licenses Card (collapsible) */}
        <div className="rounded-md border border-gray-200 bg-white shadow-sm">
          <button
            onClick={() => setComplianceExpanded((v) => !v)}
            className="flex w-full items-center gap-3 p-6 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">Compliance &amp; Licenses</h2>
              <p className="text-sm text-gray-600">GST, FSSAI, and business license numbers</p>
            </div>
            {complianceExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {complianceExpanded && (
            <div className="px-6 pb-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">GST Number</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  maxLength={15}
                  className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base font-mono focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">FSSAI License Number</label>
                <input
                  type="text"
                  value={fssaiNumber}
                  onChange={(e) => setFssaiNumber(e.target.value)}
                  maxLength={14}
                  className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base font-mono focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="14-digit FSSAI number (food merchants)"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Business License / Reg. Number</label>
                <input
                  type="text"
                  value={businessLicense}
                  onChange={(e) => setBusinessLicense(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Generic business registration number"
                />
              </div>
              <button
                onClick={handleSaveCompliance}
                disabled={savingCompliance}
                className="w-full rounded-md bg-slate-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingCompliance ? "Saving..." : "Save Compliance Details"}
              </button>
            </div>
          )}
        </div>

        {/* Weekly Schedule Card */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-rose-600">
              <CalendarX className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Weekly Schedule</h2>
              <p className="text-sm text-gray-600">Select days your shop is closed</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {[
                { label: "Sun", value: 0 },
                { label: "Mon", value: 1 },
                { label: "Tue", value: 2 },
                { label: "Wed", value: 3 },
                { label: "Thu", value: 4 },
                { label: "Fri", value: 5 },
                { label: "Sat", value: 6 },
              ].map(({ label, value }) => {
                const isClosed = closedWeekdays.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleClosedWeekday(value)}
                    className={`flex flex-col items-center rounded-md border py-2 px-1 text-xs font-medium transition-colors ${
                      isClosed
                        ? "border-red-300 bg-red-50 text-red-700"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`mt-1 text-[10px] ${isClosed ? "text-red-500" : "text-green-500"}`}>
                      {isClosed ? "Closed" : "Open"}
                    </span>
                  </button>
                );
              })}
            </div>
            {closedWeekdays.length > 0 && (
              <p className="text-sm text-gray-600">
                Closed on:{" "}
                <span className="font-medium text-red-700">
                  {closedWeekdays
                    .sort()
                    .map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d])
                    .join(", ")}
                </span>
              </p>
            )}
            <button
              onClick={handleSaveSchedule}
              disabled={savingSchedule}
              className="w-full rounded-md bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingSchedule ? "Saving..." : "Save Schedule"}
            </button>
          </div>
        </div>

        {/* Payment Methods Card */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-600">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Payment Methods Accepted</h2>
              <p className="text-sm text-gray-600">Choose which payment modes you support</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {["cash", "upi", "card", "paytm", "googlepay", "phonepe", "netbanking"].map((method) => {
                const labels: Record<string, string> = {
                  cash: "Cash",
                  upi: "UPI",
                  card: "Card",
                  paytm: "Paytm",
                  googlepay: "Google Pay",
                  phonepe: "PhonePe",
                  netbanking: "Net Banking",
                };
                const isSelected = paymentMethods.includes(method);
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => togglePaymentMethod(method)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                      isSelected
                        ? "border-cyan-600 bg-cyan-600 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {labels[method]}
                  </button>
                );
              })}
            </div>
            {paymentMethods.length === 0 && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-4 py-2">
                No payment methods selected. Customers will not see payment options.
              </p>
            )}
            <button
              onClick={handleSavePaymentMethods}
              disabled={savingPayments}
              className="w-full rounded-md bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingPayments ? "Saving..." : "Save Payment Methods"}
            </button>
          </div>
        </div>

        {/* Owner Information Card */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-600">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Owner Information</h2>
              <p className="text-sm text-gray-600">Account owner details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Owner Name</label>
              <p className="rounded-md border border-gray-200 bg-gray-50 px-4 py-2.5 text-base text-gray-900">
                {merchant.owner.name}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Owner Phone</label>
              <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-4 py-2.5">
                <Phone size={16} className="text-gray-500" />
                <p className="text-base text-gray-900">{merchant.owner.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences Card */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-violet-600">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
              <p className="text-sm text-gray-600">Choose which push notifications you receive</p>
            </div>
            {notifSavedFlash && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 transition-opacity">
                <CheckCircle className="h-3.5 w-3.5" />
                Saved
              </span>
            )}
          </div>

          <div className="divide-y divide-gray-100">
            {/* New Order Alerts */}
            <div className="flex items-center justify-between py-4">
              <div className="flex-1 pr-4">
                <p className="text-sm font-medium text-gray-900">New Order Alerts</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Get notified immediately when a customer places a new order
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={notifPrefs.newOrder}
                  onChange={(e) => handleNotifToggle("newOrder", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>

            {/* Order Status Updates */}
            <div className="flex items-center justify-between py-4">
              <div className="flex-1 pr-4">
                <p className="text-sm font-medium text-gray-900">Order Status Updates</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Receive updates when order statuses change (confirmed, ready, delivered)
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={notifPrefs.orderUpdates}
                  onChange={(e) => handleNotifToggle("orderUpdates", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>

            {/* Low Stock Warnings */}
            <div className="flex items-center justify-between py-4">
              <div className="flex-1 pr-4">
                <p className="text-sm font-medium text-gray-900">Low Stock Warnings</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Be alerted when catalog items are running low on stock
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={notifPrefs.lowStock}
                  onChange={(e) => handleNotifToggle("lowStock", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-600">
              <SettingsIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
              <p className="text-sm text-gray-600">Account security settings</p>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Your account is secured with OTP-based authentication. Every login requires verification via OTP sent to your registered mobile number.
          </p>

          <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-900">
              <strong>Keep your account safe:</strong> Never share your OTP with anyone. Lokul will never ask for your OTP over phone or email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
