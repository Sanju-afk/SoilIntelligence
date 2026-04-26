"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FlaskConical, FileText, Shield, ArrowRight, TrendingUp,
  MapPin, Calendar, Download, CheckCircle2, Clock,
  AlertTriangle, BarChart3, Droplets, Thermometer,
  Zap, ChevronRight, Plus, MessageSquare, Package
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

// ─── Mock Data ───────────────────────────

const MOCK_SOIL_SCORES = [
  { month: "Jan", score: 68 },
  { month: "Feb", score: 71 },
  { month: "Mar", score: 69 },
  { month: "Apr", score: 75 },
  { month: "May", score: 78 },
  { month: "Jun", score: 82 },
];

const MOCK_ORDERS = [
  {
    id: "SI-2025-00042",
    farm: "North Field — Kazlauskas",
    package: "Standard 5ha",
    status: "report_generated",
    date: "2025-06-15",
    score: 82,
    grade: "A",
  },
  {
    id: "SI-2025-00028",
    farm: "East Plot — Kazlauskas",
    package: "Professional 10ha",
    status: "field_work_started",
    date: "2025-06-10",
    score: null,
    grade: null,
  },
  {
    id: "SI-2025-00011",
    farm: "South Meadow",
    package: "Starter 1ha",
    status: "delivered",
    date: "2025-05-22",
    score: 74,
    grade: "B",
  },
];

const MOCK_RECENT_READINGS = {
  nitrogen: 112,
  phosphorus: 48,
  potassium: 168,
  ph: 6.8,
  ec: 340,
  moisture: 31,
  temperature: 14.2,
};

const MOCK_RECOMMENDATIONS = [
  {
    type: "warning",
    nutrient: "Phosphorus (P)",
    message: "Phosphorus is 22% below optimal for winter wheat. Apply TSP at 85 kg/ha before autumn tillage.",
    priority: "high",
  },
  {
    type: "success",
    nutrient: "Potassium (K)",
    message: "Potassium levels are excellent — no corrective action required this season.",
    priority: "low",
  },
  {
    type: "info",
    nutrient: "pH Level",
    message: "Soil pH at 6.8 — ideal range. Continue current liming schedule.",
    priority: "low",
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending:              { label: "Pending",         color: "text-white/60",  bg: "bg-white/5",          dot: "bg-white/40" },
  confirmed:            { label: "Confirmed",       color: "text-[#2a88b8]", bg: "bg-[#2a88b8]/10",    dot: "bg-[#2a88b8]" },
  worker_assigned:      { label: "Worker Assigned", color: "text-[#b87d12]", bg: "bg-[#b87d12]/10",    dot: "bg-[#b87d12]" },
  sensor_dispatched:    { label: "Kit Dispatched",  color: "text-[#b87d12]", bg: "bg-[#b87d12]/10",    dot: "bg-[#b87d12]" },
  field_work_started:   { label: "Field Work",      color: "text-[#2a88b8]", bg: "bg-[#2a88b8]/10",    dot: "bg-[#2a88b8] animate-pulse" },
  field_work_complete:  { label: "Sampling Done",   color: "text-[#6fab69]", bg: "bg-[#1e6b1a]/20",    dot: "bg-[#6fab69]" },
  data_uploaded:        { label: "Data Uploaded",   color: "text-[#6fab69]", bg: "bg-[#1e6b1a]/20",    dot: "bg-[#6fab69]" },
  ai_analysis_running:  { label: "AI Analysing",    color: "text-purple-400", bg: "bg-purple-500/10",  dot: "bg-purple-400 animate-pulse" },
  report_generated:     { label: "Report Ready",    color: "text-[#6fab69]", bg: "bg-[#1e6b1a]/20",    dot: "bg-[#6fab69]" },
  delivered:            { label: "Delivered",        color: "text-[#6fab69]", bg: "bg-[#1e6b1a]/20",    dot: "bg-[#6fab69]" },
  cancelled:            { label: "Cancelled",        color: "text-red-400",   bg: "bg-red-500/10",      dot: "bg-red-400" },
};

// ─── Sub-components ──────────────────────

function StatCard({
  label, value, unit, icon: Icon, color, trend, delay
}: {
  label: string; value: string | number; unit?: string;
  icon: React.ElementType; color: string; trend?: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-5 hover:border-[#3d8838]/40 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        {trend && (
          <span className="text-xs text-[#6fab69] font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>
      <p className="text-white/50 text-xs font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-white font-data">
        {value}
        {unit && <span className="text-sm text-white/40 font-normal ml-1">{unit}</span>}
      </p>
    </motion.div>
  );
}

function SoilHealthGauge({ score, grade }: { score: number; grade: string }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#3d8838" : score >= 60 ? "#b87d12" : "#ef4444";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#1a2e18" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${color}80)`,
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white font-data">{score}</span>
          <span className="text-xs text-white/40">/ 100</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <span className="text-2xl font-display font-bold" style={{ color }}>Grade {grade}</span>
        <p className="text-white/40 text-xs mt-0.5">Soil Health Score</p>
      </div>
    </div>
  );
}

function NPKBar({ label, value, max, unit, color }: {
  label: string; value: number; max: number; unit: string; color: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-white/60 font-medium">{label}</span>
        <span className="text-xs font-mono text-white/80">{value} {unit}</span>
      </div>
      <div className="h-2 bg-[#1a2e18] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}
        />
      </div>
    </div>
  );
}

function MiniChart({ data }: { data: { month: string; score: number }[] }) {
  const max = Math.max(...data.map((d) => d.score));
  const min = Math.min(...data.map((d) => d.score)) - 5;
  const h = 60;
  const w = 100 / (data.length - 1);

  const points = data
    .map((d, i) => {
      const x = i * w;
      const y = h - ((d.score - min) / (max - min)) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="w-full h-16 relative">
      <svg viewBox={`0 ${-5} 100 ${h + 10}`} preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3d8838" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3d8838" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill="none" stroke="#3d8838" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        />
        <polygon
          points={`0,${h} ${points} 100,${h}`}
          fill="url(#scoreGrad)"
        />
        {data.map((d, i) => (
          <circle key={i} cx={i * w} cy={h - ((d.score - min) / (max - min)) * h}
            r="2" fill="#6fab69" />
        ))}
      </svg>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Page ────────────────────────────────

export default function FarmerDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "readings">("overview");

  return (
    <DashboardLayout role="farmer">
      <div className="p-6 lg:p-8 space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Good morning, Andrius 👋</h1>
            <p className="text-white/50 text-sm mt-0.5">
              Your latest soil report is ready. Grade A — excellent soil health.
            </p>
          </div>
          <Link
            href="/dashboard/orders/new"
            className="inline-flex items-center gap-2 bg-[#1e6b1a] hover:bg-[#26881f] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#1e6b1a]/20 hover:scale-[1.02] w-fit"
          >
            <Plus className="w-4 h-4" />
            New Soil Test
          </Link>
        </div>

        {/* ── Alert Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#b87d12]/10 border border-[#b87d12]/30 rounded-2xl p-4 flex items-start gap-3"
        >
          <AlertTriangle className="w-4 h-4 text-[#edbf46] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[#edbf46]">
              EU Soil Monitoring Compliance — Action Required
            </p>
            <p className="text-xs text-white/50 mt-0.5">
              Your 2025 nutrient management plan is due for submission to the Lithuanian Paying Agency by 30 September 2025.
            </p>
          </div>
          <Link
            href="/dashboard/compliance"
            className="text-xs text-[#edbf46] font-medium hover:underline flex-shrink-0"
          >
            View →
          </Link>
        </motion.div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Tests" value={7} icon={FlaskConical} color="bg-[#1e6b1a]/30 text-[#6fab69]" delay={0.05} trend="+2 this season" />
          <StatCard label="Reports Downloaded" value={5} icon={FileText} color="bg-[#1a3d6b]/30 text-[#5aadd4]" delay={0.1} />
          <StatCard label="Farms Registered" value={3} icon={MapPin} color="bg-[#6b1a3d]/20 text-pink-400" delay={0.15} />
          <StatCard label="Compliance Status" value="Partial" icon={Shield} color="bg-[#b87d12]/20 text-[#edbf46]" delay={0.2} />
        </div>

        {/* ── Main Grid ── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Soil Health Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Soil Health Score</h2>
              <span className="text-xs text-white/40">Latest Report</span>
            </div>

            <SoilHealthGauge score={82} grade="A" />

            <div className="mt-5 pt-5 border-t border-[#1a2e18]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/50">6-month trend</span>
                <span className="text-xs text-[#6fab69] font-medium">+14 pts ↑</span>
              </div>
              <MiniChart data={MOCK_SOIL_SCORES} />
              <div className="flex justify-between mt-1">
                {MOCK_SOIL_SCORES.map((d) => (
                  <span key={d.month} className="text-[10px] text-white/30">{d.month}</span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── NPK & Sensor Readings ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold">Latest Readings</h2>
              <span className="text-xs text-white/40">North Field — Jun 2025</span>
            </div>

            <div className="space-y-4">
              <NPKBar label="Nitrogen (N)" value={MOCK_RECENT_READINGS.nitrogen} max={200} unit="mg/kg" color="#3d8838" />
              <NPKBar label="Phosphorus (P)" value={MOCK_RECENT_READINGS.phosphorus} max={100} unit="mg/kg" color="#2a88b8" />
              <NPKBar label="Potassium (K)" value={MOCK_RECENT_READINGS.potassium} max={250} unit="mg/kg" color="#b87d12" />
            </div>

            <div className="mt-5 pt-5 border-t border-[#1a2e18] grid grid-cols-2 gap-3">
              {[
                { label: "pH Level", value: MOCK_RECENT_READINGS.ph, icon: FlaskConical, color: "text-purple-400" },
                { label: "EC (µS/cm)", value: MOCK_RECENT_READINGS.ec, icon: Zap, color: "text-[#edbf46]" },
                { label: "Moisture %", value: `${MOCK_RECENT_READINGS.moisture}%`, icon: Droplets, color: "text-[#5aadd4]" },
                { label: "Temperature", value: `${MOCK_RECENT_READINGS.temperature}°C`, icon: Thermometer, color: "text-orange-400" },
              ].map((r) => (
                <div key={r.label} className="bg-[#0a120a] rounded-xl p-3 flex items-center gap-2">
                  <r.icon className={`w-4 h-4 ${r.color}`} />
                  <div>
                    <p className="text-[10px] text-white/40">{r.label}</p>
                    <p className="text-sm font-bold text-white">{r.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── AI Recommendations ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold">AI Recommendations</h2>
              <span className="text-xs bg-[#1e6b1a]/20 text-[#6fab69] px-2 py-0.5 rounded-full font-medium">
                3 active
              </span>
            </div>

            <div className="space-y-3">
              {MOCK_RECOMMENDATIONS.map((rec, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className={`p-3 rounded-xl border text-sm ${
                    rec.type === "warning"
                      ? "bg-[#b87d12]/10 border-[#b87d12]/30"
                      : rec.type === "success"
                      ? "bg-[#1e6b1a]/15 border-[#3d8838]/30"
                      : "bg-[#1a3d6b]/15 border-[#2a88b8]/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {rec.type === "warning" && <AlertTriangle className="w-3.5 h-3.5 text-[#edbf46]" />}
                    {rec.type === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-[#6fab69]" />}
                    {rec.type === "info" && <BarChart3 className="w-3.5 h-3.5 text-[#5aadd4]" />}
                    <span className={`text-xs font-semibold ${
                      rec.type === "warning" ? "text-[#edbf46]"
                        : rec.type === "success" ? "text-[#6fab69]" : "text-[#5aadd4]"
                    }`}>{rec.nutrient}</span>
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed">{rec.message}</p>
                </motion.div>
              ))}
            </div>

            <Link
              href="/dashboard/analysis"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 border border-[#3d8838]/30 hover:border-[#3d8838]/60 text-[#6fab69] text-sm font-medium rounded-xl transition-all duration-200 hover:bg-[#1e6b1a]/10"
            >
              View full analysis <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>

        {/* ── Recent Orders ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a2e18]">
            <h2 className="text-white font-semibold">Recent Soil Tests</h2>
            <Link href="/dashboard/orders" className="text-xs text-[#6fab69] hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#1a2e18]">
            {MOCK_ORDERS.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + i * 0.07 }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group"
              >
                {/* Order icon */}
                <div className="w-10 h-10 rounded-xl bg-[#1a2e18] flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-[#6fab69]" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium text-sm truncate">{order.farm}</p>
                    {order.grade && (
                      <span className="text-xs font-bold text-[#6fab69] bg-[#1e6b1a]/20 px-1.5 py-0.5 rounded-md">
                        Grade {order.grade}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-white/40">{order.id}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-xs text-white/40">{order.package}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {order.date}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <OrderStatusBadge status={order.status} />

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(order.status === "report_generated" || order.status === "delivered") && (
                    <button className="w-8 h-8 rounded-lg bg-[#1e6b1a]/20 hover:bg-[#1e6b1a]/40 flex items-center justify-center text-[#6fab69] transition-all">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 transition-all"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Book Consultation", icon: MessageSquare, href: "/dashboard/consultations", color: "from-[#1a3d6b] to-[#0d2040]", border: "border-[#2a88b8]/20" },
            { label: "Download Latest Report", icon: Download, href: "/dashboard/reports", color: "from-[#1e6b1a] to-[#0d3a0a]", border: "border-[#3d8838]/20" },
            { label: "Add New Farm", icon: MapPin, href: "/dashboard/farms/new", color: "from-[#3d1a6b] to-[#1e0d40]", border: "border-purple-500/20" },
            { label: "View Compliance", icon: Shield, href: "/dashboard/compliance", color: "from-[#6b3d1a] to-[#3d1e0d]", border: "border-[#b87d12]/20" },
          ].map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.07 }}
            >
              <Link
                href={action.href}
                className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br ${action.color} border ${action.border} hover:scale-[1.02] transition-all duration-200 group`}
              >
                <action.icon className="w-4 h-4 text-white/70" />
                <span className="text-white/80 text-sm font-medium">{action.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-white/30 ml-auto group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
