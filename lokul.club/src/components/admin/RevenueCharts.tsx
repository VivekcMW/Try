"use client";

/**
 * Client-side charts for /admin/revenue. Data is fetched server-side in the
 * page component (getRevenueOverview) and passed in as plain props.
 */
import { TrendingUp, Megaphone, Gift, MapPin, ArrowUp, ArrowDown, Store } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import type { AdDayStat, ReferralFunnelStage, TopPin, TopMerchant } from "@/lib/admin-revenue";

function paise(v: number): string {
  return `₹${(v / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function StatCard({
  icon: Icon, label, value, sub, trendPct, color = "bg-blue-50 text-blue-600",
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  sub?: string;
  trendPct?: number | null;
  color?: string;
}) {
  const [iconBg, iconText] = color.split(" ");
  return (
    <div className="bg-white rounded-[6px] border border-gray-100 p-5 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-[6px] flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconText}`} />
      </div>
      <div>
        <div className="text-2xl font-extrabold text-gray-900">{value}</div>
        <div className="text-xs font-semibold text-gray-500 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
      </div>
      {trendPct != null && (
        <div className={`flex items-center gap-1 text-xs font-bold ${trendPct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
          {trendPct >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {Math.abs(trendPct)}% vs prior week
        </div>
      )}
    </div>
  );
}

export default function RevenueCharts({
  adRevenueAllTimePaise,
  adRevenueThisWeekPaise,
  adRevenueTrendPct,
  liveCampaigns,
  referralCreditsPaidPaise,
  adDaily,
  referralFunnel,
  topPins,
  merchantGmvAllTimePaise,
  merchantGmvThisWeekPaise,
  merchantGmvTrendPct,
  topMerchantsByGmv,
}: {
  adRevenueAllTimePaise: number;
  adRevenueThisWeekPaise: number;
  adRevenueTrendPct: number | null;
  liveCampaigns: number;
  referralCreditsPaidPaise: number;
  adDaily: AdDayStat[];
  referralFunnel: ReferralFunnelStage[];
  topPins: TopPin[];
  merchantGmvAllTimePaise: number;
  merchantGmvThisWeekPaise: number;
  merchantGmvTrendPct: number | null;
  topMerchantsByGmv: TopMerchant[];
}) {
  const maxInvited = referralFunnel[0]?.count ?? 0;
  const converted = referralFunnel[referralFunnel.length - 1]?.count ?? 0;

  return (
    <>
      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Megaphone}
          label="Ad Revenue (all-time)"
          value={paise(adRevenueAllTimePaise)}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={Megaphone}
          label="Ad Revenue (this week)"
          value={paise(adRevenueThisWeekPaise)}
          trendPct={adRevenueTrendPct}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Live Ad Campaigns"
          value={liveCampaigns.toLocaleString("en-IN")}
          color="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          icon={Gift}
          label="Referral Credits Paid"
          value={paise(referralCreditsPaidPaise)}
          color="bg-violet-50 text-violet-600"
        />
        <StatCard
          icon={Store}
          label="Merchant GMV (all-time)"
          value={paise(merchantGmvAllTimePaise)}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={Store}
          label="Merchant GMV (this week)"
          value={paise(merchantGmvThisWeekPaise)}
          trendPct={merchantGmvTrendPct}
          color="bg-teal-50 text-teal-600"
        />
      </div>

      {/* Ad performance (last 7 days) */}
      <div className="bg-white rounded-[6px] border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-4 h-4 text-amber-500" />
          <h2 className="text-base font-bold text-gray-800">Ad Performance (last 7 days)</h2>
        </div>
        {adDaily.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No ad delivery data yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={adDaily} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="impressions" fill="#93C5FD" radius={[3, 3, 0, 0]} name="Impressions" />
              <Bar dataKey="clicks" fill="#1D65AF" radius={[3, 3, 0, 0]} name="Clicks" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Referral funnel */}
      <div className="bg-white rounded-[6px] border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-4 h-4 text-violet-500" />
          <h2 className="text-base font-bold text-gray-800">Referral Conversion Funnel</h2>
        </div>
        {maxInvited === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No referrals recorded yet.</div>
        ) : (
          <>
            <div className="flex items-end gap-2">
              {referralFunnel.map((stage, i) => {
                const pct = maxInvited > 0 ? (stage.count / maxInvited) * 100 : 0;
                const colors = ["bg-blue-500", "bg-violet-500", "bg-emerald-500"];
                return (
                  <div key={stage.stage} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-sm font-bold text-gray-800">{stage.count.toLocaleString("en-IN")}</div>
                    <div
                      className={`w-full rounded-t-[6px] ${colors[i] ?? "bg-gray-400"}`}
                      style={{ height: `${Math.max(pct * 1.4, 12)}px` }}
                    />
                    <div className="text-xs text-gray-500 text-center">{stage.stage}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Overall conversion:{" "}
              <strong className="text-gray-800">
                {maxInvited > 0 ? ((converted / maxInvited) * 100).toFixed(1) : "0.0"}%
              </strong>{" "}
              of invited → credited
            </div>
          </>
        )}
      </div>

      {/* Top pins by ad revenue */}
      <div className="bg-white rounded-[6px] border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-rose-500" />
          <h2 className="text-base font-bold text-gray-800">Top PIN Codes by Ad Revenue</h2>
        </div>
        {topPins.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No approved ad bookings yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-semibold">PIN Code</th>
                <th className="pb-2 font-semibold text-right">Revenue</th>
                <th className="pb-2 font-semibold text-right">Bookings</th>
              </tr>
            </thead>
            <tbody>
              {topPins.map((row, i) => (
                <tr key={row.pin} className={i < topPins.length - 1 ? "border-b border-gray-50" : ""}>
                  <td className="py-3 font-mono font-bold text-gray-800">{row.pin}</td>
                  <td className="py-3 text-right font-semibold text-gray-800">{paise(row.revenuePaise)}</td>
                  <td className="py-3 text-right text-gray-600">{row.bookings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Top merchants by GMV */}
      <div className="bg-white rounded-[6px] border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Store className="w-4 h-4 text-emerald-500" />
          <h2 className="text-base font-bold text-gray-800">Top Merchants by GMV</h2>
        </div>
        {topMerchantsByGmv.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No paid merchant orders yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-semibold">Merchant</th>
                <th className="pb-2 font-semibold text-right">GMV</th>
                <th className="pb-2 font-semibold text-right">Orders</th>
              </tr>
            </thead>
            <tbody>
              {topMerchantsByGmv.map((row, i) => (
                <tr key={row.merchantId} className={i < topMerchantsByGmv.length - 1 ? "border-b border-gray-50" : ""}>
                  <td className="py-3 font-semibold text-gray-800">{row.name}</td>
                  <td className="py-3 text-right font-semibold text-gray-800">{paise(row.gmvPaise)}</td>
                  <td className="py-3 text-right text-gray-600">{row.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
