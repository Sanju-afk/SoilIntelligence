"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FlaskConical, Plus, Search, Download, ChevronRight,
  Calendar, Package, MapPin, Clock
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const ORDERS = [
  {
    id: "ord-1", order_number: "SI-2025-00042",
    farm: "North Field — Kazlauskas", package: "Standard 5ha",
    status: "report_generated", date: "2025-06-15",
    score: 82, grade: "A", amount: 145.2,
  },
  {
    id: "ord-2", order_number: "SI-2025-00028",
    farm: "East Plot", package: "Professional 10ha",
    status: "field_work_started", date: "2025-06-10",
    score: null, grade: null, amount: 181.5,
  },
  {
    id: "ord-3", order_number: "SI-2025-00011",
    farm: "South Meadow", package: "Starter 1ha",
    status: "delivered", date: "2025-05-22",
    score: 69, grade: "B", amount: 60.5,
  },
  {
    id: "ord-4", order_number: "SI-2025-00006",
    farm: "North Field — Kazlauskas", package: "Standard 5ha",
    status: "delivered", date: "2025-03-11",
    score: 74, grade: "B", amount: 145.2,
  },
];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending:             { label: "Pending",         color: "text-white/50",   bg: "bg-white/5",         dot: "bg-white/30" },
  confirmed:           { label: "Confirmed",       color: "text-[#5aadd4]",  bg: "bg-[#2a88b8]/10",   dot: "bg-[#5aadd4]" },
  worker_assigned:     { label: "Worker Assigned", color: "text-[#edbf46]",  bg: "bg-[#b87d12]/10",   dot: "bg-[#edbf46]" },
  sensor_dispatched:   { label: "Kit Dispatched",  color: "text-[#edbf46]",  bg: "bg-[#b87d12]/10",   dot: "bg-[#edbf46]" },
  field_work_started:  { label: "Field Work",      color: "text-[#5aadd4]",  bg: "bg-[#2a88b8]/10",   dot: "bg-[#5aadd4] animate-pulse" },
  field_work_complete: { label: "Sampling Done",   color: "text-[#6fab69]",  bg: "bg-[#1e6b1a]/15",   dot: "bg-[#6fab69]" },
  data_uploaded:       { label: "Data Uploaded",   color: "text-[#6fab69]",  bg: "bg-[#1e6b1a]/15",   dot: "bg-[#6fab69]" },
  ai_analysis_running: { label: "AI Processing",   color: "text-purple-400", bg: "bg-purple-500/10",  dot: "bg-purple-400 animate-pulse" },
  report_generated:    { label: "Report Ready",    color: "text-[#6fab69]",  bg: "bg-[#1e6b1a]/15",   dot: "bg-[#6fab69]" },
  delivered:           { label: "Delivered",       color: "text-[#6fab69]",  bg: "bg-[#1e6b1a]/15",   dot: "bg-[#6fab69]" },
  cancelled:           { label: "Cancelled",       color: "text-red-400",    bg: "bg-red-500/10",     dot: "bg-red-400" },
};

// Order status pipeline steps for tracking display
const PIPELINE = [
  "pending", "confirmed", "worker_assigned", "sensor_dispatched",
  "field_work_started", "field_work_complete", "data_uploaded",
  "ai_analysis_running", "report_generated", "delivered",
];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function ProgressBar({ status }: { status: string }) {
  const idx = PIPELINE.indexOf(status);
  const pct = idx < 0 ? 0 : Math.round(((idx + 1) / PIPELINE.length) * 100);
  return (
    <div className="h-1 bg-[#1a2e18] rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-[#1e6b1a] to-[#3d8838] rounded-full transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = ORDERS.filter((o) => {
    const matchSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.farm.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !["delivered", "cancelled"].includes(o.status)) ||
      (statusFilter === "completed" && o.status === "delivered");
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout role="farmer">
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">My Soil Tests</h1>
            <p className="text-white/50 text-sm mt-0.5">
              {ORDERS.length} orders total · {ORDERS.filter((o) => o.status === "delivered").length} completed
            </p>
          </div>
          <Link
            href="/dashboard/orders/new"
            className="flex items-center gap-2 bg-[#1e6b1a] hover:bg-[#26881f] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-[#1e6b1a]/20 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            New Test
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or farm name…"
              className="w-full bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/20 text-sm outline-none focus:border-[#3d8838]/60 transition-all"
            />
          </div>
          <div className="flex gap-1 bg-[#0a120a] rounded-xl p-1">
            {(["all", "active", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`text-xs font-medium px-4 py-1.5 rounded-lg capitalize transition-all ${
                  statusFilter === f
                    ? "bg-[#1e6b1a]/40 text-[#6fab69]"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Order Cards */}
        <div className="space-y-4">
          {filtered.map((order, i) => {
            const gradeColor =
              order.grade === "A" ? "#3d8838" : order.grade === "B" ? "#b87d12" : "#ef4444";
            const isActive = !["delivered", "cancelled"].includes(order.status);

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-[#0d1a0c]/80 border border-[#1a2e18] hover:border-[#3d8838]/30 rounded-2xl p-5 transition-all duration-200 group"
              >
                <div className="flex items-start gap-4 flex-wrap">
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-[#1a2e18] flex items-center justify-center flex-shrink-0">
                    <FlaskConical className="w-5 h-5 text-[#6fab69]" />
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-white font-semibold">{order.farm}</h3>
                      {order.grade && (
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                          style={{ color: gradeColor, backgroundColor: `${gradeColor}20` }}
                        >
                          Grade {order.grade}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" /> {order.package}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {order.date}
                      </span>
                      <span className="font-mono text-white/30">{order.order_number}</span>
                    </div>

                    {/* Progress bar for active orders */}
                    {isActive && (
                      <div className="mt-3">
                        <ProgressBar status={order.status} />
                      </div>
                    )}
                  </div>

                  {/* Right side */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-white font-semibold">€{order.amount.toFixed(2)}</p>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(order.status === "report_generated" || order.status === "delivered") && (
                        <>
                          <Link
                            href="/dashboard/analysis"
                            className="w-8 h-8 rounded-lg bg-[#1a2e18] hover:bg-[#243d24] flex items-center justify-center text-white/50 hover:text-white transition-all"
                          >
                            <FlaskConical className="w-3.5 h-3.5" />
                          </Link>
                          <button className="w-8 h-8 rounded-lg bg-[#1e6b1a]/20 hover:bg-[#1e6b1a]/40 flex items-center justify-center text-[#6fab69] transition-all">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button className="w-8 h-8 rounded-lg bg-[#1a2e18] hover:bg-[#243d24] flex items-center justify-center text-white/50 hover:text-white transition-all">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active order status detail */}
                {isActive && (
                  <div className="mt-4 pt-4 border-t border-[#1a2e18] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                    <p className="text-xs text-white/40">
                      {order.status === "field_work_started"
                        ? "Field technician is currently collecting samples at your farm."
                        : order.status === "ai_analysis_running"
                        ? "AI engine is processing your soil data. Report expected within 30 minutes."
                        : "Your order is progressing. Check back for updates."}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <FlaskConical className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40 text-sm">No orders match your search.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
