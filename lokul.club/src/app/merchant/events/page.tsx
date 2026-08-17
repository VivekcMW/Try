"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Package, Star, MessageSquareText, ArrowRight, Loader2 } from "lucide-react";

const tabs = ["overview", "packages", "enquiries", "bookings"] as const;
type Tab = (typeof tabs)[number];

type EventSummary = {
  packageCount: number;
  enquiryCount: number;
  bookingCount: number;
  activeOffers: number;
};

type EventPackage = {
  id: string;
  name: string;
  pricePaise: number;
  description?: string | null;
  isAvailable: boolean;
};

type EventEnquiry = {
  id: string;
  customerName: string;
  phone: string;
  eventType: string;
  budgetPaise: number | null;
  status: "open" | "quoted" | "accepted" | "declined";
  createdAt: string;
};

type EventBooking = {
  id: string;
  title: string;
  customerName: string;
  scheduledAt: string;
  status: string;
};

export default function MerchantEventsPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [summary, setSummary] = useState<EventSummary | null>(null);
  const [packages, setPackages] = useState<EventPackage[]>([]);
  const [enquiries, setEnquiries] = useState<EventEnquiry[]>([]);
  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const sessionRes = await fetch("/api/merchant/auth/session");
        const sessionData = await sessionRes.json();
        const merchantId = sessionData?.merchant?.id;

        if (!merchantId) {
          setSummary({ packageCount: 0, enquiryCount: 0, bookingCount: 0, activeOffers: 0 });
          setPackages([]);
          setEnquiries([]);
          setBookings([]);
          return;
        }

        const [catalogRes, offersRes, requestsRes, bookingsRes] = await Promise.all([
          fetch(`/api/mobile/merchants/${merchantId}/catalog`),
          fetch(`/api/mobile/merchants/${merchantId}/offers?activeOnly=1`),
          fetch(`/api/merchant/requests?filter=all`),
          fetch(`/api/merchant/bookings?filter=upcoming`),
        ]);

        const [catalogData, offersData, requestsData, bookingsData] = await Promise.all([
          catalogRes.ok ? catalogRes.json() : Promise.resolve({ items: [] }),
          offersRes.ok ? offersRes.json() : Promise.resolve({ offers: [] }),
          requestsRes.ok ? requestsRes.json() : Promise.resolve({ requests: [] }),
          bookingsRes.ok ? bookingsRes.json() : Promise.resolve({ appointments: [] }),
        ]);

        const packageList = (catalogData.items ?? []).map((item: any) => ({
          id: item.id,
          name: item.name,
          pricePaise: item.pricePaise ?? 0,
          description: item.description ?? null,
          isAvailable: !!item.isAvailable,
        }));

        const requestList = (requestsData.requests ?? []).slice(0, 5).map((item: any) => ({
          id: item.id,
          customerName: item.user?.name ?? "Customer",
          phone: item.user?.phone ?? "",
          eventType: item.serviceDescription ?? "Event enquiry",
          budgetPaise: item.budgetPaise ?? null,
          status: item.status,
          createdAt: item.createdAt,
        }));

        const bookingList = (bookingsData.appointments ?? []).slice(0, 5).map((item: any) => ({
          id: item.id,
          title: item.serviceLabel ?? "Event booking",
          customerName: item.user?.name ?? "Customer",
          scheduledAt: item.scheduledAt,
          status: item.status,
        }));

        setSummary({
          packageCount: packageList.length,
          enquiryCount: requestList.length,
          bookingCount: bookingList.length,
          activeOffers: offersData.offers?.length ?? 0,
        });
        setPackages(packageList);
        setEnquiries(requestList);
        setBookings(bookingList);
      } catch (error) {
        console.error("Failed to load event merchant data:", error);
        setSummary({ packageCount: 0, enquiryCount: 0, bookingCount: 0, activeOffers: 0 });
        setPackages([]);
        setEnquiries([]);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const formatRupees = (paise: number | null) => {
    if (paise == null) return "Quoted on request";
    return `₹${(paise / 100).toLocaleString("en-IN")}`;
  };

  const statusStyles: Record<string, string> = {
    open: "bg-yellow-100 text-yellow-700",
    quoted: "bg-blue-100 text-blue-700",
    accepted: "bg-green-100 text-green-700",
    declined: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const cards = [
    { label: "Packages", value: summary?.packageCount ?? 0, icon: Package, color: "blue" },
    { label: "Enquiries", value: summary?.enquiryCount ?? 0, icon: MessageSquareText, color: "orange" },
    { label: "Bookings", value: summary?.bookingCount ?? 0, icon: CalendarDays, color: "purple" },
    { label: "Offers", value: summary?.activeOffers ?? 0, icon: Star, color: "green" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Event Hub</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage event packages, customer enquiries, and bookings from one place.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition ${
              tab === item ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : tab === "overview" ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
                  </div>
                  <div className={`rounded-md p-3 ${
                    color === "blue" ? "bg-blue-50 text-blue-600" :
                    color === "orange" ? "bg-orange-50 text-orange-600" :
                    color === "purple" ? "bg-purple-50 text-purple-600" :
                    "bg-green-50 text-green-600"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Recent enquiries</h2>
              <div className="space-y-3">
                {enquiries.length === 0 ? (
                  <p className="text-sm text-gray-500">No enquiries yet.</p>
                ) : (
                  enquiries.map((item) => (
                    <div key={item.id} className="rounded-md border border-gray-200 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-gray-900">{item.customerName}</p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[item.status]}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{item.eventType}</p>
                      <p className="mt-1 text-xs text-gray-500">{formatRupees(item.budgetPaise)} · {item.phone}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Upcoming bookings</h2>
              <div className="space-y-3">
                {bookings.length === 0 ? (
                  <p className="text-sm text-gray-500">No upcoming bookings.</p>
                ) : (
                  bookings.map((item) => (
                    <div key={item.id} className="rounded-md border border-gray-200 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[item.status]}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{item.customerName}</p>
                      <p className="mt-1 text-xs text-gray-500">{new Date(item.scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : tab === "packages" ? (
        <div className="space-y-3">
          {packages.length === 0 ? (
            <div className="rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center text-gray-600">
              No packages created yet.
            </div>
          ) : (
            packages.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-4 shadow-sm">
                <div>
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="mt-1 text-sm text-gray-600">{item.description || "Event package"}</p>
                  <p className="mt-2 text-sm font-medium text-blue-600">{formatRupees(item.pricePaise)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${item.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {item.isAvailable ? "Active" : "Hidden"}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))
          )}
        </div>
      ) : tab === "enquiries" ? (
        <div className="space-y-3">
          {enquiries.length === 0 ? (
            <div className="rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center text-gray-600">
              No enquiries received.
            </div>
          ) : (
            enquiries.map((item) => (
              <div key={item.id} className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{item.customerName}</p>
                    <p className="mt-1 text-sm text-gray-600">{item.eventType}</p>
                    <p className="mt-1 text-xs text-gray-500">{item.phone}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[item.status]}`}>
                    {item.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                  <span>{formatRupees(item.budgetPaise)}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <div className="rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center text-gray-600">
              No bookings scheduled.
            </div>
          ) : (
            bookings.map((item) => (
              <div key={item.id} className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-600">{item.customerName}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[item.status]}`}>
                    {item.status}
                  </span>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  {new Date(item.scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
