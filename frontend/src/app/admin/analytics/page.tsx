"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, FlaskConical, Euro, BarChart3, MapPin } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const MONTHLY_DATA = [
  { month: "Jan", revenue: 4200, orders: 28, farmers: 18 },
  { month: "Feb", revenue: 5100, orders: 34, farmers: 24 },
  { month: "Mar", revenue: 3800, orders: 25, farmers: 20 },
  { month: "Apr", revenue: 6400, orders: 43, farmers: 31 },
  { month: "May", revenue: 7200, orders: 48, farmers: 35 },
  { month: "Jun", revenue: 8950, orders: 59, farmers: 42 },
];

const TOP_DISTRICTS = [
  { name: "Kaunas r.",     orders: 34, revenue: 4820, farmers: 22 },
  { name: "Vilniaus r.",   orders: 28, revenue: 3990, farmers: 18 },
  { name: "Šiaulių r.",    orders: 21, revenue: 2940, farmers: 14 },
  { name: "Panevėžio r.",  orders: 18, revenue: 2520, farmers: 12 },
  { name: "Klaipėdos r.",  orders: 15, revenue: 2100, farmers: 10 },
];

const PACKAGE_BREAKDOWN = [
  { name: "Starter 1ha",       count: 42, revenue: 2541,  pct: 27 },
  { name: "Standard 5ha",      count: 71, revenue: 10287, pct: 45 },
  { name: "Professional 10ha", count: 44, revenue: 7986,  pct: 28 },
];

function BarChart({ data }: { data: { month: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((d, i) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full relative flex items-end" style={{ height: "90px" }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.value / max) * 90}px` }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: "easeOut" }}
              className="w-full rounded-t-lg bg-gradient-to-t from-[#1e6b1a] to-[#3d8838] group relative cursor-pointer hover:opacity-90 transition-opacity min-h-[4px]"
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a2e18] text-[#6fab69] text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {typeof d.value === "number" && d.value > 999 ? `€${(d.value/1000).toFixed(1)}k` : d.value}
              </div>
            </motion.div>
          </div>
          <span className="text-[10px] text-white/30">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const totalRevenue = MONTHLY_DATA.reduce((s, d) => s + d.revenue, 0);
  const totalOrders  = MONTHLY_DATA.reduce((s, d) => s + d.orders, 0);
  const avgOrderVal  = totalRevenue / totalOrders;

  return (
    <DashboardLayout role="admin">
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Analytics</h1>
          <p className="text-white/50 text-sm mt-0.5">2025 YTD performance — updated in real time</p>
        </div>

        {/* KPI summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "YTD Revenue",      value: `€${(totalRevenue/1000).toFixed(1)}k`, icon: Euro,        color: "text-[#edbf46]", bg: "bg-[#b87d12]/15", change: "+34%" },
            { label: "Total Orders",     value: totalOrders,                            icon: FlaskConical, color: "text-[#6fab69]", bg: "bg-[#1e6b1a]/15", change: "+28%" },
            { label: "Active Farmers",   value: 214,                                   icon: Users,        color: "text-[#5aadd4]", bg: "bg-[#2a88b8]/15", change: "+52%" },
            { label: "Avg Order Value",  value: `€${avgOrderVal.toFixed(0)}`,          icon: TrendingUp,   color: "text-purple-400", bg: "bg-purple-500/10", change: "+8%" },
          ].map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-5">
              <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{kpi.value}</p>
              <p className="text-white/50 text-xs mt-0.5">{kpi.label}</p>
              <p className="text-[#6fab69] text-xs font-medium mt-1">{kpi.change} vs last year</p>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue chart */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-semibold">Monthly Revenue</h2>
                <p className="text-white/40 text-xs mt-0.5">EUR · 2025</p>
              </div>
              <span className="text-[#6fab69] text-sm font-bold">€{(totalRevenue/1000).toFixed(1)}k total</span>
            </div>
            <BarChart data={MONTHLY_DATA.map((d) => ({ month: d.month, value: d.revenue }))} />
          </motion.div>

          {/* Orders chart */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-semibold">Monthly Orders</h2>
                <p className="text-white/40 text-xs mt-0.5">All packages · 2025</p>
              </div>
              <span className="text-[#5aadd4] text-sm font-bold">{totalOrders} total</span>
            </div>
            <BarChart data={MONTHLY_DATA.map((d) => ({ month: d.month, value: d.orders }))} />
          </motion.div>
        </div>

        {/* Package breakdown + Districts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Package mix */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#6fab69]" /> Package Mix
            </h2>
            <div className="space-y-4">
              {PACKAGE_BREAKDOWN.map((pkg) => (
                <div key={pkg.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white/70 text-sm">{pkg.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white/40 text-xs">{pkg.count} orders</span>
                      <span className="text-white font-semibold text-sm">€{pkg.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-[#1a2e18] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pkg.pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-[#1e6b1a] to-[#3d8838] rounded-full"
                    />
                  </div>
                  <p className="text-white/30 text-xs mt-0.5">{pkg.pct}% of revenue</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top districts */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#6fab69]" /> Top Districts
            </h2>
            <div className="space-y-3">
              {TOP_DISTRICTS.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="text-white/20 text-sm font-mono w-5">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white/80 text-sm">{d.name}</span>
                      <span className="text-white/60 text-xs">{d.orders} orders · €{d.revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-1 bg-[#1a2e18] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2a88b8] rounded-full"
                        style={{ width: `${(d.orders / TOP_DISTRICTS[0].orders) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
