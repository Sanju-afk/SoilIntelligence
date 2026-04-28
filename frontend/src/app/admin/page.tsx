"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, FlaskConical, TrendingUp, Euro, AlertTriangle,
  ChevronRight, MoreHorizontal, CheckCircle2,
  Truck, BarChart3, ArrowUpRight, MapPin, Activity,
  Package, UserCheck, FileText
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

// ─── Mock Data ───────────────────────────

const KPI_CARDS = [
  {
    label: "Total Revenue",
    value: "€28,450",
    change: "+12.4%",
    changeUp: true,
    sub: "vs last month",
    icon: Euro,
    color: "text-[#edbf46]",
    bg: "bg-[#b87d12]/15",
  },
  {
    label: "Active Orders",
    value: "47",
    change: "+8",
    changeUp: true,
    sub: "this week",
    icon: FlaskConical,
    color: "text-[#6fab69]",
    bg: "bg-[#1e6b1a]/15",
  },
  {
    label: "Registered Farmers",
    value: "214",
    change: "+23",
    changeUp: true,
    sub: "this month",
    icon: Users,
    color: "text-[#5aadd4]",
    bg: "bg-[#2a88b8]/15",
  },
  {
    label: "Reports Generated",
    value: "189",
    change: "+31",
    changeUp: true,
    sub: "all time",
    icon: FileText,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
];

const RECENT_ORDERS = [
  { id: "SI-2025-00048", farmer: "Petras Vaitkus", farm: "Vaitkus West Field", package: "Standard 5ha", status: "field_work_started", worker: "Tomas K.", date: "2025-06-17", amount: 145.2 },
  { id: "SI-2025-00047", farmer: "Laima Bražienė", farm: "Bražienė Organic Plot", package: "Professional 10ha", status: "ai_analysis_running", worker: "Rimas P.", date: "2025-06-17", amount: 181.5 },
  { id: "SI-2025-00046", farmer: "Vytautas Šimkus", farm: "Šimkus North", package: "Starter 1ha", status: "report_generated", worker: "Diana V.", date: "2025-06-16", amount: 60.5 },
  { id: "SI-2025-00045", farmer: "Irena Kazlauskienė", farm: "Kazlauskienė East", package: "Standard 5ha", status: "delivered", worker: "Tomas K.", date: "2025-06-15", amount: 145.2 },
  { id: "SI-2025-00044", farmer: "Mindaugas Jokubaitis", farm: "Jokubaitis Farm A", package: "Professional 10ha", status: "worker_assigned", worker: "Unassigned", date: "2025-06-15", amount: 181.5 },
];

const WORKER_STATUS = [
  { name: "Tomas Kačinskas", region: "Kaunas", tasks_today: 2, status: "on_site", verified: true },
  { name: "Rimas Paulauskas", region: "Vilnius", tasks_today: 1, status: "equipment_collected", verified: true },
  { name: "Diana Valčiukaitė", region: "Šiauliai", tasks_today: 3, status: "completed", verified: true },
  { name: "Gintautas Morkūnas", region: "Panevėžys", tasks_today: 0, status: "available", verified: false },
];

const REVENUE_DATA = [
  { month: "Jan", revenue: 4200, orders: 28 },
  { month: "Feb", revenue: 5100, orders: 34 },
  { month: "Mar", revenue: 3800, orders: 25 },
  { month: "Apr", revenue: 6400, orders: 43 },
  { month: "May", revenue: 7200, orders: 48 },
  { month: "Jun", revenue: 8950, orders: 59 },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:             { label: "Pending",        color: "text-white/60",   bg: "bg-white/5" },
  confirmed:           { label: "Confirmed",      color: "text-[#5aadd4]", bg: "bg-[#2a88b8]/10" },
  worker_assigned:     { label: "Assigned",       color: "text-[#edbf46]", bg: "bg-[#b87d12]/10" },
  sensor_dispatched:   { label: "Dispatched",     color: "text-[#edbf46]", bg: "bg-[#b87d12]/10" },
  field_work_started:  { label: "Field Work",     color: "text-[#5aadd4]", bg: "bg-[#2a88b8]/10" },
  ai_analysis_running: { label: "AI Processing",  color: "text-purple-400", bg: "bg-purple-500/10" },
  report_generated:    { label: "Report Ready",   color: "text-[#6fab69]", bg: "bg-[#1e6b1a]/15" },
  delivered:           { label: "Delivered",      color: "text-[#6fab69]", bg: "bg-[#1e6b1a]/15" },
};

const WORKER_STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  available:           { label: "Available",         color: "text-[#6fab69]",  dot: "bg-[#6fab69]" },
  on_site:             { label: "On Site",           color: "text-[#5aadd4]",  dot: "bg-[#5aadd4] animate-pulse" },
  equipment_collected: { label: "En Route",          color: "text-[#edbf46]",  dot: "bg-[#edbf46] animate-pulse" },
  completed:           { label: "Day Complete",      color: "text-white/40",   dot: "bg-white/20" },
  unavailable:         { label: "Unavailable",       color: "text-red-400",    dot: "bg-red-400" },
};

// ─── Components ──────────────────────────

function RevenueChart({ data }: { data: typeof REVENUE_DATA }) {
  const max = Math.max(...data.map((d) => d.revenue));
  return (
    <div className="flex items-end gap-2 h-28 w-full">
      {data.map((d, i) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full relative flex items-end" style={{ height: "90px" }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.revenue / max) * 90}px` }}
              transition={{ delay: i * 0.07, duration: 0.6, ease: "easeOut" }}
              className="w-full rounded-t-lg bg-gradient-to-t from-[#1e6b1a] to-[#3d8838] relative group cursor-pointer hover:opacity-90 transition-opacity"
              style={{ minHeight: "4px" }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a2e18] text-[#6fab69] text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                €{d.revenue.toLocaleString()}
              </div>
            </motion.div>
          </div>
          <span className="text-[10px] text-white/30">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

function OrderPipelineDonut() {
  const stages = [
    { label: "Pending",     count: 8,  color: "#4a4a4a" },
    { label: "Field Work",  count: 12, color: "#2a88b8" },
    { label: "AI Analysis", count: 6,  color: "#7c3aed" },
    { label: "Report Ready",count: 9,  color: "#3d8838" },
    { label: "Delivered",   count: 12, color: "#6fab69" },
  ];
  const total = stages.reduce((s, x) => s + x.count, 0);

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-24 h-24 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          {(() => {
            let offset = 0;
            return stages.map((s) => {
              const pct = (s.count / total) * 100;
              const el = (
                <circle
                  key={s.label}
                  cx="18" cy="18" r="15.9155"
                  fill="none" stroke={s.color} strokeWidth="3"
                  strokeDasharray={`${pct} ${100 - pct}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += pct;
              return el;
            });
          })()}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">{total}</span>
          <span className="text-[9px] text-white/40">active</span>
        </div>
      </div>
      <div className="space-y-1.5 flex-1">
        {stages.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-white/60 flex-1">{s.label}</span>
            <span className="text-xs font-bold text-white">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────

export default function AdminDashboard() {
  const [activeOrderTab, setActiveOrderTab] = useState<"all" | "pending" | "active">("all");

  const filtered = activeOrderTab === "all"
    ? RECENT_ORDERS
    : activeOrderTab === "pending"
    ? RECENT_ORDERS.filter((o) => ["pending", "confirmed", "worker_assigned"].includes(o.status))
    : RECENT_ORDERS.filter((o) => ["field_work_started", "ai_analysis_running"].includes(o.status));

  return (
    <DashboardLayout role="admin">
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-white/50 text-sm mt-0.5">Monday, 17 June 2025 · All systems operational</p>
          </div>
          <div className="flex items-center gap-2 bg-[#1e6b1a]/20 border border-[#3d8838]/30 rounded-xl px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-[#6fab69] animate-pulse" />
            <span className="text-[#6fab69] text-sm font-medium">Platform Live</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPI_CARDS.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-5 hover:border-[#3d8838]/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`w-4.5 h-4.5 ${kpi.color}`} />
                </div>
                <span className={`text-xs font-semibold flex items-center gap-1 ${kpi.changeUp ? "text-[#6fab69]" : "text-red-400"}`}>
                  <ArrowUpRight className="w-3 h-3" /> {kpi.change}
                </span>
              </div>
              <p className="text-white/50 text-xs font-medium mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-white font-data">{kpi.value}</p>
              <p className="text-[10px] text-white/30 mt-1">{kpi.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Revenue + Pipeline Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-semibold">Monthly Revenue</h2>
                <p className="text-white/40 text-xs mt-0.5">2025 YTD · EUR</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">€28,450</p>
                <p className="text-[#6fab69] text-xs font-medium">+12.4% vs last month</p>
              </div>
            </div>
            <RevenueChart data={REVENUE_DATA} />
          </motion.div>

          {/* Order Pipeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold">Order Pipeline</h2>
              <Link href="/admin/orders" className="text-xs text-[#6fab69] hover:underline">View all</Link>
            </div>
            <OrderPipelineDonut />

            <div className="mt-5 pt-4 border-t border-[#1a2e18]">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/40">Avg completion time</span>
                <span className="text-sm font-bold text-white">38h</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-white/40">On-time delivery rate</span>
                <span className="text-sm font-bold text-[#6fab69]">94.2%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Orders Table + Workers */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Orders Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3 bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a2e18]">
              <h2 className="text-white font-semibold">Recent Orders</h2>
              <div className="flex gap-1 bg-[#0a120a] rounded-xl p-1">
                {(["all", "pending", "active"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveOrderTab(tab)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg capitalize transition-all ${
                      activeOrderTab === tab
                        ? "bg-[#1e6b1a]/40 text-[#6fab69]"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-[#1a2e18]">
              {filtered.map((order, i) => {
                const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 px-6 py-3.5 hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#1a2e18] flex items-center justify-center flex-shrink-0">
                      <Package className="w-3.5 h-3.5 text-[#6fab69]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{order.farmer}</p>
                      <p className="text-white/40 text-xs truncate">{order.id} · {order.package}</p>
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="text-white/70 text-xs">{order.worker}</p>
                      <p className="text-white/30 text-[10px]">{order.date}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${s.bg} ${s.color}`}>
                      {s.label}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </div>

            <div className="px-6 py-3 border-t border-[#1a2e18]">
              <Link href="/admin/orders" className="text-xs text-[#6fab69] hover:underline flex items-center gap-1">
                View all orders <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

          {/* Worker Status Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="lg:col-span-2 bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a2e18]">
              <h2 className="text-white font-semibold">Field Workers</h2>
              <Link href="/admin/workers" className="text-xs text-[#6fab69] hover:underline">Manage</Link>
            </div>

            <div className="divide-y divide-[#1a2e18]">
              {WORKER_STATUS.map((w, i) => {
                const cfg = WORKER_STATUS_CONFIG[w.status] || WORKER_STATUS_CONFIG.available;
                return (
                  <motion.div
                    key={w.name}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.07 }}
                    className="flex items-center gap-3 px-6 py-3.5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3d8838] to-[#1e6b1a] flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{w.name.split(" ").map(n => n[0]).join("")}</span>
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#08150a] ${cfg.dot}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-white text-sm font-medium truncate">{w.name}</p>
                        {w.verified && <UserCheck className="w-3 h-3 text-[#6fab69] flex-shrink-0" />}
                      </div>
                      <p className="text-white/40 text-xs flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" /> {w.region}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</p>
                      <p className="text-white/30 text-[10px]">{w.tasks_today} tasks today</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="p-4 border-t border-[#1a2e18]">
              <button className="w-full py-2.5 border border-dashed border-[#3d8838]/30 hover:border-[#3d8838]/60 text-[#6fab69]/60 hover:text-[#6fab69] text-xs font-medium rounded-xl transition-all">
                + Assign Worker to Order
              </button>
            </div>
          </motion.div>
        </div>

        {/* Quick Admin Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Assign Workers", icon: Truck, href: "/admin/workers", color: "from-[#2a88b8]/20 to-transparent", border: "border-[#2a88b8]/20", text: "text-[#5aadd4]" },
            { label: "Generate Reports", icon: FileText, href: "/admin/reports", color: "from-[#3d8838]/20 to-transparent", border: "border-[#3d8838]/20", text: "text-[#6fab69]" },
            { label: "Compliance Overview", icon: Activity, href: "/admin/compliance", color: "from-[#b87d12]/20 to-transparent", border: "border-[#b87d12]/20", text: "text-[#edbf46]" },
            { label: "Platform Analytics", icon: BarChart3, href: "/admin/analytics", color: "from-purple-500/20 to-transparent", border: "border-purple-500/20", text: "text-purple-400" },
          ].map((a, i) => (
            <motion.div key={a.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 + i * 0.07 }}>
              <Link
                href={a.href}
                className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br ${a.color} border ${a.border} hover:scale-[1.02] transition-all duration-200 group`}
              >
                <a.icon className={`w-4 h-4 ${a.text}`} />
                <span className="text-white/80 text-sm font-medium flex-1">{a.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
