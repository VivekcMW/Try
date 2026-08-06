import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminStats } from "@/lib/admin-stats";
import { getPlatformStats, getFeatureFlags } from "@/lib/admin-platform";
import { getIntegrations } from "@/lib/admin-integrations";
import {
  CalendarDays, Bell, Users, FileText, ShieldAlert,
  Building2, Store, AlertTriangle, Clapperboard, MessageSquare, Gift, Car,
  CalendarCheck, Receipt, Siren, BadgeCheck, Package, Tag, Wallet, Star,
  HeartHandshake, Vote, MapPin, UsersRound, Phone, Route, UserCheck,
  Stethoscope, TriangleAlert, Activity,
} from "lucide-react";
import MiniStatCard from "@/components/admin/MiniStatCard";
import SignupsChart from "@/components/admin/SignupsChart";
import RoleDonut from "@/components/admin/RoleDonut";
import PinCodeBar from "@/components/admin/PinCodeBar";
import FeatureControlWidget from "@/components/admin/FeatureControlWidget";
import IntegrationsStatusWidget from "@/components/admin/IntegrationsStatusWidget";
import LocalityNewsWidget from "@/components/admin/LocalityNewsWidget";
import { Card, Divider, PageHeader } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard | Lokul Admin" };

// Matches the E2E/no-real-DB guard used in admin-stats / admin-platform
const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const [stats, platform, { flags }, integrations, recentNews, featureStats] = await Promise.all([
    getAdminStats(),
    getPlatformStats(),
    getFeatureFlags(),
    getIntegrations(),
    E2E
      ? Promise.resolve([] as never[])
      : prisma.localityNews
          .findMany({ orderBy: { publishedAt: 'desc' }, take: 20 })
          .catch(() => [] as never[]),
    // Mobile feature counts
    E2E
      ? Promise.resolve({ activePosts: 0, liveStories: 0, totalEvents: 0, chatThreads: 0, chatMessages: 0, totalReferrals: 0, creditedReferrals: 0, openTrips: 0, totalTrips: 0 })
      : Promise.all([
          prisma.post.count({ where: { status: "active", deletedAt: null } }).catch(() => 0),
          prisma.story.count({ where: { expiresAt: { gt: new Date() } } }).catch(() => 0),
          prisma.post.count({ where: { type: "event", deletedAt: null } }).catch(() => 0),
          prisma.chatThread.count().catch(() => 0),
          prisma.chatMessage.count({ where: { deletedAt: null } }).catch(() => 0),
          prisma.referralRecord.count().catch(() => 0),
          prisma.referralRecord.count({ where: { creditedAt: { not: null } } }).catch(() => 0),
          prisma.carpoolTrip.count({ where: { status: "open" } }).catch(() => 0),
          prisma.carpoolTrip.count().catch(() => 0),
        ]).then(([activePosts, liveStories, totalEvents, chatThreads, chatMessages, totalReferrals, creditedReferrals, openTrips, totalTrips]) => ({
          activePosts, liveStories, totalEvents, chatThreads, chatMessages,
          totalReferrals, creditedReferrals, openTrips, totalTrips,
        })),
  ]);

  const globalFlags = flags.filter((f) => f.scope === "global");

  // Reusable dense grid class
  const G = "grid gap-2.5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

  return (
    <div className="space-y-5">
      <PageHeader
        title="Overview"
        description="Platform health at a glance — all services."
      />

      {/* ── People ─────────────────────────────────────────────── */}
      <section>
        <SectionLabel>People</SectionLabel>
        <div className={G}>
          <MiniStatCard href="/admin/users"      label="Total users"       value={platform.totalUsers}    Icon={Users}        tone="default" sub="Registered" />
          <MiniStatCard href="/admin/users"      label="Active"           value={platform.activeUsers}   Icon={Activity}     tone="success" sub="Active users" />
          <MiniStatCard href="/admin/entries"    label="Waitlist"          value={stats.total}            Icon={Bell}         tone="default" sub="All time" />
          <MiniStatCard href="/admin/entries"    label="Today"             value={stats.today}            Icon={CalendarDays} tone={stats.today > 0 ? "success" : "neutral"} sub="Since midnight" />
          <MiniStatCard href="/admin/entries"    label="This week"         value={stats.week}             Icon={CalendarDays} tone="default" sub="Last 7 days" />
          <MiniStatCard href="/admin/entries"    label="Notify'd"          value={stats.notifyCount}      Icon={Bell}         tone="purple"  sub="Want alerts" />
          <MiniStatCard href="/admin/kyc"        label="Approvals"         value={platform.pendingSocieties + platform.pendingMerchants} Icon={AlertTriangle} tone={(platform.pendingSocieties + platform.pendingMerchants) > 0 ? "warning" : "neutral"} sub={`${platform.pendingSocieties} soc · ${platform.pendingMerchants} merch`} />
          <MiniStatCard href="/admin/moderation" label="Open reports"      value={platform.openReports}   Icon={ShieldAlert}  tone={platform.openReports > 0 ? "danger" : "neutral"} sub={platform.criticalReports > 0 ? `${platform.criticalReports} critical` : "None critical"} />
          <MiniStatCard href="/admin/vouches"    label="Posts today"       value={platform.postsToday}    Icon={FileText}     tone="default" sub="New content" />
        </div>
      </section>

      <Divider />

      {/* ── Community & Platform ──────────────────────────────── */}
      <section>
        <SectionLabel>Community &amp; Platform</SectionLabel>
        <div className={G}>
          <MiniStatCard href="/admin/societies"   label="Societies live"   value={platform.totalSocieties}  Icon={Building2}    tone="success" sub="Approved" />
          <MiniStatCard href="/admin/societies"   label="Soc. pending"     value={platform.pendingSocieties} Icon={Building2}   tone={platform.pendingSocieties > 0 ? "warning" : "neutral"} sub="Awaiting review" />
          <MiniStatCard href="/admin/communities" label="Communities"      value={0}                         Icon={UsersRound}  tone="default" sub="Active groups" />
          <MiniStatCard href="/admin/polls"       label="Polls"            value={0}                         Icon={Vote}        tone="purple"  sub="All time" />
          <MiniStatCard href="/admin/lost-found"  label="Lost &amp; Found" value={0}                         Icon={MapPin}      tone="teal"    sub="Open" />
          <MiniStatCard href="/admin/safety"      label="Open SOS"         value={platform.openSosIncidents} Icon={Siren}       tone={platform.openSosIncidents > 0 ? "danger" : "neutral"} sub="Emergencies" />
        </div>
      </section>

      <Divider />

      {/* ── Economy ───────────────────────────────────────────── */}
      <section>
        <SectionLabel>Economy</SectionLabel>
        <div className={G}>
          <MiniStatCard href="/admin/merchants"        label="Merchants live"    value={platform.totalMerchants}       Icon={Store}        tone="success"  sub="Active" />
          <MiniStatCard href="/admin/merchants"        label="Merch. pending"    value={platform.pendingMerchants}     Icon={Store}        tone={platform.pendingMerchants > 0 ? "warning" : "neutral"} sub="Verification" />
          <MiniStatCard href="/admin/appointments"     label="Appts"             value={platform.totalAppointments}    Icon={CalendarCheck} tone="default" sub={`${platform.pendingAppointments} pending`} />
          <MiniStatCard href="/admin/quotes"           label="Quotes"            value={platform.totalQuotes}          Icon={Receipt}      tone="default"  sub={`${platform.pendingQuotes} awaiting`} />
          <MiniStatCard href="/admin/peer-roles"       label="Peer roles"        value={platform.activePeerRoles}      Icon={BadgeCheck}   tone="purple"   sub="Available" />
          <MiniStatCard href="/admin/service-listings" label="Svc listings"      value={0}                             Icon={HeartHandshake} tone="teal"   sub="All listings" />
          <MiniStatCard href="/admin/group-buys"       label="Group buys"        value={0}                             Icon={Package}      tone="default"  sub="Active" />
          <MiniStatCard href="/admin/classifieds"      label="Classifieds"       value={0}                             Icon={Tag}          tone="neutral"  sub="Listed" />
          <MiniStatCard href="/admin/wallet"           label="Wallet txns"       value={0}                             Icon={Wallet}       tone="default"  sub="All time" />
          <MiniStatCard href="/admin/ratings"          label="Ratings"           value={0}                             Icon={Star}         tone="warning"  sub="Submitted" />
        </div>
      </section>

      <Divider />

      {/* ── Content ───────────────────────────────────────────── */}
      <section>
        <SectionLabel>Content</SectionLabel>
        <div className={G}>
          <MiniStatCard href="/admin/posts"     label="Active posts"   value={featureStats.activePosts}    Icon={FileText}     tone="default" sub="Published" />
          <MiniStatCard href="/admin/stories"   label="Live stories"   value={featureStats.liveStories}    Icon={Clapperboard} tone={featureStats.liveStories > 0 ? "success" : "neutral"} sub="Not expired" />
          <MiniStatCard href="/admin/events"    label="Events"         value={featureStats.totalEvents}    Icon={CalendarDays} tone="purple"  sub="All time" />
          <MiniStatCard href="/admin/chat"      label="Chat threads"   value={featureStats.chatThreads}    Icon={MessageSquare} tone="teal"  sub={`${featureStats.chatMessages.toLocaleString()} messages`} />
          <MiniStatCard href="/admin/referrals" label="Referrals"      value={featureStats.totalReferrals} Icon={Gift}         tone="success" sub={`${featureStats.creditedReferrals} credited`} />
          <MiniStatCard href="/admin/carpool"   label="Open carpools"  value={featureStats.openTrips}      Icon={Car}          tone={featureStats.openTrips > 0 ? "success" : "neutral"} sub={`${featureStats.totalTrips} total`} />
        </div>
      </section>

      <Divider />

      {/* ── Safety Services ───────────────────────────────────── */}
      <section>
        <SectionLabel>Safety Services</SectionLabel>
        <div className={G}>
          <MiniStatCard href="/admin/safety-contacts"  label="Contacts"          value={platform.totalSafetyContacts}  Icon={Phone}         tone="default" sub="Registered" />
          <MiniStatCard href="/admin/safety-journeys"  label="Journeys"          value={platform.activeJourneys}       Icon={Route}         tone={platform.activeJourneys > 0 ? "success" : "neutral"} sub="Active" />
          <MiniStatCard href="/admin/safety-journeys"  label="Overdue"           value={platform.overdueJourneys}      Icon={Route}         tone={platform.overdueJourneys > 0 ? "danger" : "neutral"} sub="Missed check-in" />
          <MiniStatCard href="/admin/volunteers"       label="Volunteers"         value={platform.activeVolunteers}     Icon={UserCheck}     tone="success" sub="Active" />
          <MiniStatCard href="/admin/medical-profiles" label="Medical IDs"        value={platform.totalMedicalProfiles} Icon={Stethoscope}   tone="teal"   sub="On file" />
          <MiniStatCard href="/admin/incidents"        label="Incidents"          value={platform.pendingIncidents}     Icon={TriangleAlert} tone={platform.pendingIncidents > 0 ? "warning" : "neutral"} sub={`${platform.totalIncidents} total`} />
        </div>
      </section>

      <Divider />

      {/* ── Charts row ──────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="mb-4 text-sm font-semibold text-gray-700">Signups — last 30 days</p>
          <SignupsChart data={stats.daily} />
        </Card>
        <Card>
          <p className="mb-4 text-sm font-semibold text-gray-700">Role breakdown</p>
          <RoleDonut data={stats.byRole} />
        </Card>
      </div>

      {/* ── Top pin codes ───────────────────────────────────────── */}
      <Card>
        <p className="mb-4 text-sm font-semibold text-gray-700">Top 10 pin codes</p>
        <PinCodeBar data={stats.topPincodes} />
      </Card>

      <Divider />

      {/* ── App Feature Control ─────────────────────────────────── */}
      <FeatureControlWidget flags={globalFlags} />

      <Divider />

      {/* ── Integrations Health ─────────────────────────────────── */}
      <IntegrationsStatusWidget integrations={integrations} />

      <Divider />

      {/* ── Locality News Cache ─────────────────────────────────── */}
      <LocalityNewsWidget items={recentNews} />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">{children}</p>
  );
}
