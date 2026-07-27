"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  ShoppingBag,
  Calendar,
  MapPin,
  Star,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Phone,
  Clock,
  Building2,
  Droplets,
  Zap,
  Car,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ════════════════════════════════════════════════════════════════════════
   MOCK DATA — Replace with real API calls
   ═══════════════════════════════════════════════════════════════════════ */

const LOCALITY_DATA: Record<string, {
  name: string;
  city: string;
  state: string;
  safetyScore: number;
  safetyTrend: "up" | "down" | "stable";
  residents: number;
  activeAlerts: number;
  merchants: number;
  events: number;
  recentIncidents: { type: string; title: string; time: string; resolved: boolean }[];
  topMerchants: { name: string; category: string; rating: number; reviews: number }[];
  upcomingEvents: { title: string; date: string; type: string }[];
  stats: { water: string; power: string; traffic: string };
}> = {
  "400053": {
    name: "Andheri West",
    city: "Mumbai",
    state: "Maharashtra",
    safetyScore: 82,
    safetyTrend: "up",
    residents: 12450,
    activeAlerts: 3,
    merchants: 287,
    events: 8,
    recentIncidents: [
      { type: "water", title: "Water supply disruption - DN Nagar", time: "2 hours ago", resolved: false },
      { type: "safety", title: "Suspicious activity reported - Link Road", time: "5 hours ago", resolved: true },
      { type: "traffic", title: "Road closure - Metro construction", time: "1 day ago", resolved: false },
    ],
    topMerchants: [
      { name: "Sharma Electricals", category: "Electrical", rating: 4.8, reviews: 156 },
      { name: "Priya's Kitchen", category: "Tiffin Service", rating: 4.9, reviews: 234 },
      { name: "QuickFix Plumbing", category: "Plumbing", rating: 4.7, reviews: 89 },
      { name: "Wellness Yoga Studio", category: "Fitness", rating: 4.6, reviews: 67 },
    ],
    upcomingEvents: [
      { title: "Free Health Camp", date: "Jul 5, 2026", type: "health" },
      { title: "Society AGM Meeting", date: "Jul 8, 2026", type: "rwa" },
      { title: "Monsoon Safety Workshop", date: "Jul 12, 2026", type: "safety" },
    ],
    stats: { water: "Normal", power: "Stable", traffic: "Moderate" },
  },
  "560034": {
    name: "HSR Layout",
    city: "Bengaluru",
    state: "Karnataka",
    safetyScore: 88,
    safetyTrend: "stable",
    residents: 18200,
    activeAlerts: 1,
    merchants: 412,
    events: 12,
    recentIncidents: [
      { type: "power", title: "Scheduled power cut - Sector 2", time: "4 hours ago", resolved: false },
    ],
    topMerchants: [
      { name: "TechFix Solutions", category: "IT Services", rating: 4.9, reviews: 312 },
      { name: "Green Thumb Gardens", category: "Gardening", rating: 4.7, reviews: 98 },
      { name: "Healthy Bites Tiffin", category: "Tiffin Service", rating: 4.8, reviews: 445 },
      { name: "PetCare Plus", category: "Pet Care", rating: 4.6, reviews: 76 },
    ],
    upcomingEvents: [
      { title: "Tech Meetup - AI in Communities", date: "Jul 3, 2026", type: "tech" },
      { title: "Weekend Farmers Market", date: "Jul 6, 2026", type: "market" },
      { title: "Kids Summer Camp", date: "Jul 10-15, 2026", type: "kids" },
    ],
    stats: { water: "Normal", power: "Scheduled cut 2-4pm", traffic: "Light" },
  },
};

const DEFAULT_DATA = {
  name: "Unknown Locality",
  city: "India",
  state: "",
  safetyScore: 75,
  safetyTrend: "stable" as const,
  residents: 5000,
  activeAlerts: 0,
  merchants: 50,
  events: 2,
  recentIncidents: [],
  topMerchants: [],
  upcomingEvents: [],
  stats: { water: "Unknown", power: "Unknown", traffic: "Unknown" },
};

/* ════════════════════════════════════════════════════════════════════════ */

function SafetyScoreRing({ score, trend }: { score: number; trend: "up" | "down" | "stable" }) {
  const color = score >= 80 ? "var(--color-success)" : score >= 60 ? "var(--color-warning)" : "var(--color-danger)";
  const bgColor = score >= 80 ? "var(--color-success-bg)" : score >= 60 ? "var(--color-warning-bg)" : "var(--color-danger-bg)";
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg width="120" height="120" className="rotate-[-90deg]">
        <circle cx="60" cy="60" r="45" fill="none" stroke="var(--color-gray-200)" strokeWidth="10" />
        <circle
          cx="60" cy="60" r="45" fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Safety Score</span>
      </div>
      <div className="mt-2 flex items-center gap-1 text-sm" style={{ color }}>
        <TrendingUp size={14} className={trend === "down" ? "rotate-180" : trend === "stable" ? "rotate-90" : ""} />
        <span>{trend === "up" ? "Improving" : trend === "down" ? "Declining" : "Stable"}</span>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Shield; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: color + "20", color }}>
        <Icon size={20} />
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color: "var(--color-heading)" }}>{value}</div>
        <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{label}</div>
      </div>
    </div>
  );
}

function IncidentRow({ incident }: { incident: { type: string; title: string; time: string; resolved: boolean } }) {
  const iconMap: Record<string, typeof AlertTriangle> = { water: Droplets, power: Zap, traffic: Car, safety: AlertTriangle };
  const Icon = iconMap[incident.type] || AlertTriangle;
  
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3" style={{ borderColor: "var(--color-border)" }}>
      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${incident.resolved ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}>
        {incident.resolved ? <CheckCircle2 size={16} /> : <Icon size={16} />}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium" style={{ color: "var(--color-heading)" }}>{incident.title}</div>
        <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{incident.time}</div>
      </div>
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${incident.resolved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
        {incident.resolved ? "Resolved" : "Active"}
      </span>
    </div>
  );
}

function MerchantCard({ merchant }: { merchant: { name: string; category: string; rating: number; reviews: number } }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-4 transition-shadow hover:shadow-md" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white" style={{ background: "var(--color-brand-600)" }}>
        {merchant.name.charAt(0)}
      </div>
      <div className="flex-1">
        <div className="font-semibold" style={{ color: "var(--color-heading)" }}>{merchant.name}</div>
        <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{merchant.category}</div>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-1">
          <Star size={14} fill="var(--color-accent-500)" stroke="var(--color-accent-500)" />
          <span className="font-semibold" style={{ color: "var(--color-heading)" }}>{merchant.rating}</span>
        </div>
        <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{merchant.reviews} reviews</div>
      </div>
    </div>
  );
}

function EventRow({ event }: { event: { title: string; date: string; type: string } }) {
  const typeColors: Record<string, string> = {
    health: "bg-green-100 text-green-700",
    rwa: "bg-blue-100 text-blue-700",
    safety: "bg-red-100 text-red-700",
    tech: "bg-purple-100 text-purple-700",
    market: "bg-amber-100 text-amber-700",
    kids: "bg-pink-100 text-pink-700",
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3" style={{ borderColor: "var(--color-border)" }}>
      <Calendar size={18} style={{ color: "var(--color-brand-600)" }} />
      <div className="flex-1">
        <div className="text-sm font-medium" style={{ color: "var(--color-heading)" }}>{event.title}</div>
        <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{event.date}</div>
      </div>
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[event.type] || "bg-gray-100 text-gray-700"}`}>
        {event.type}
      </span>
    </div>
  );
}

export default function LocalityPage() {
  const params = useParams();
  const pincode = params.pincode as string;
  const data = LOCALITY_DATA[pincode] || { ...DEFAULT_DATA, name: `Pincode ${pincode}` };

  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ background: "var(--color-surface-muted)" }}>
        {/* Hero */}
        <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, var(--color-brand-600) 0%, var(--color-brand-800) 100%)" }}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          </div>
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
              <MapPin size={16} />
              <span>{data.city}, {data.state}</span>
              <span>•</span>
              <span className="font-mono">{pincode}</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">{data.name}</h1>
            <p className="text-white/80 text-lg mb-6">Your hyperlocal community hub — safety, services, and society life in one place.</p>
            
            <div className="flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-transform hover:scale-105"
                style={{ background: "var(--color-accent-500)" }}
              >
                Join {data.name} Community
                <ArrowRight size={18} />
              </Link>
              <a
                href={`tel:+911234567890`}
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Phone size={18} />
                Contact Local Admin
              </a>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="mx-auto max-w-6xl px-4 -mt-8 relative z-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Verified Residents" value={data.residents.toLocaleString()} color="var(--color-brand-600)" />
            <StatCard icon={AlertTriangle} label="Active Alerts" value={data.activeAlerts} color="var(--color-danger)" />
            <StatCard icon={ShoppingBag} label="Verified Merchants" value={data.merchants} color="var(--color-success)" />
            <StatCard icon={Calendar} label="Upcoming Events" value={data.events} color="var(--color-accent-600)" />
          </div>
        </section>

        {/* Main Content */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Safety Score & Incidents */}
            <div className="lg:col-span-2 space-y-6">
              {/* Safety Score */}
              <div className="rounded-2xl border p-6" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                <h2 className="text-lg font-bold mb-6" style={{ color: "var(--color-heading)" }}>
                  <Shield className="inline mr-2" size={20} style={{ color: "var(--color-brand-600)" }} />
                  Safety Overview
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex justify-center">
                    <SafetyScoreRing score={data.safetyScore} trend={data.safetyTrend} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm" style={{ color: "var(--color-heading)" }}>Infrastructure Status</h3>
                    <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
                      <Droplets size={18} className="text-blue-600" />
                      <span className="flex-1 text-sm">Water Supply</span>
                      <span className="font-medium text-blue-700">{data.stats.water}</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-3">
                      <Zap size={18} className="text-amber-600" />
                      <span className="flex-1 text-sm">Power</span>
                      <span className="font-medium text-amber-700">{data.stats.power}</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3">
                      <Car size={18} className="text-green-600" />
                      <span className="flex-1 text-sm">Traffic</span>
                      <span className="font-medium text-green-700">{data.stats.traffic}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Incidents */}
              <div className="rounded-2xl border p-6" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold" style={{ color: "var(--color-heading)" }}>
                    <AlertTriangle className="inline mr-2" size={20} style={{ color: "var(--color-warning)" }} />
                    Recent Incidents
                  </h2>
                  <Link href="/signup" className="text-sm font-medium" style={{ color: "var(--color-brand-600)" }}>
                    View all →
                  </Link>
                </div>
                {data.recentIncidents.length > 0 ? (
                  <div className="space-y-3">
                    {data.recentIncidents.map((incident, i) => (
                      <IncidentRow key={i} incident={incident} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    No recent incidents reported. Great neighborhood! 🎉
                  </div>
                )}
              </div>

              {/* Top Merchants */}
              <div className="rounded-2xl border p-6" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold" style={{ color: "var(--color-heading)" }}>
                    <ShoppingBag className="inline mr-2" size={20} style={{ color: "var(--color-success)" }} />
                    Top Verified Merchants
                  </h2>
                  <Link href="/merchants" className="text-sm font-medium" style={{ color: "var(--color-brand-600)" }}>
                    View all →
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {data.topMerchants.map((merchant, i) => (
                    <MerchantCard key={i} merchant={merchant} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Events & CTA */}
            <div className="space-y-6">
              {/* Upcoming Events */}
              <div className="rounded-2xl border p-6" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold" style={{ color: "var(--color-heading)" }}>
                    <Calendar className="inline mr-2" size={20} style={{ color: "var(--color-accent-600)" }} />
                    Upcoming Events
                  </h2>
                  <Link href="/events" className="text-sm font-medium" style={{ color: "var(--color-brand-600)" }}>
                    View all →
                  </Link>
                </div>
                {data.upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {data.upcomingEvents.map((event, i) => (
                      <EventRow key={i} event={event} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    No upcoming events. Check back soon!
                  </div>
                )}
              </div>

              {/* CTA Box */}
              <div className="rounded-2xl p-6 text-white" style={{ background: "linear-gradient(135deg, var(--color-brand-600) 0%, var(--color-brand-700) 100%)" }}>
                <Building2 className="mb-4" size={32} />
                <h3 className="text-xl font-bold mb-2">Are you an RWA Admin?</h3>
                <p className="text-white/80 text-sm mb-4">
                  Get a dedicated dashboard to manage notices, polls, and resident verification for your society.
                </p>
                <Link
                  href="/signup?role=rwa"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold text-sm"
                  style={{ background: "var(--color-accent-500)", color: "white" }}
                >
                  Register Your Society
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="rounded-2xl border p-6" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                <h3 className="font-bold mb-4" style={{ color: "var(--color-heading)" }}>Quick Facts</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-secondary)" }}>Pin Code</span>
                    <span className="font-mono font-medium" style={{ color: "var(--color-heading)" }}>{pincode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-secondary)" }}>City</span>
                    <span className="font-medium" style={{ color: "var(--color-heading)" }}>{data.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-secondary)" }}>State</span>
                    <span className="font-medium" style={{ color: "var(--color-heading)" }}>{data.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-secondary)" }}>Active on Lokul</span>
                    <span className="font-medium text-green-600">✓ Yes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border p-8" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--color-heading)" }}>
              About {data.name} ({pincode})
            </h2>
            <div className="prose max-w-none text-sm" style={{ color: "var(--color-text-secondary)" }}>
              <p>
                {data.name} is a vibrant neighborhood in {data.city}, {data.state}. With {data.residents.toLocaleString()} verified residents 
                on Lokul, it&apos;s one of the most connected communities in the area. The locality has a safety score of {data.safetyScore}/100, 
                making it a {data.safetyScore >= 80 ? "highly safe" : data.safetyScore >= 60 ? "moderately safe" : "developing"} area to live in.
              </p>
              <p className="mt-4">
                Residents of {data.name} enjoy access to {data.merchants}+ verified local merchants including electricians, plumbers, 
                tiffin services, tutors, and more — all vetted by fellow neighbors. Community engagement is strong with {data.events} 
                upcoming events this month.
              </p>
              <p className="mt-4">
                Join Lokul to stay updated on safety alerts, find trusted services, participate in society polls, and connect with 
                neighbors who care about making {data.name} the best place to live.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
