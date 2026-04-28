"use client";

import { motion } from "framer-motion";
import {
  Shield, CheckCircle2, AlertTriangle, Download,
  Calendar, MapPin, TrendingUp
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const RECORDS = [
  { id: "c1", farm: "North Field — Kazlauskas",  farmer: "Andrius Kazlauskas", district: "Kaunas r.",    year: 2025, status: "compliant",           score: 88, deadline: "2025-09-30", submitted: false, gaps: 0 },
  { id: "c2", farm: "Bražienė Organic Plot",      farmer: "Laima Bražienė",     district: "Panevėžio r.", year: 2025, status: "partial",             score: 64, deadline: "2025-09-30", submitted: false, gaps: 2 },
  { id: "c3", farm: "Šimkus North",               farmer: "Vytautas Šimkus",    district: "Šiaulių r.",   year: 2025, status: "non_compliant",        score: 42, deadline: "2025-09-30", submitted: false, gaps: 3 },
  { id: "c4", farm: "East Plot — Kazlauskas",      farmer: "Andrius Kazlauskas", district: "Kaunas r.",    year: 2024, status: "compliant",           score: 91, deadline: "2024-12-01", submitted: true,  gaps: 0 },
  { id: "c5", farm: "Vaitkus West Field",          farmer: "Petras Vaitkus",     district: "Kauno r.",     year: 2025, status: "pending_assessment",  score: 0,  deadline: "2025-09-30", submitted: false, gaps: 0 },
];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  compliant:          { label: "Compliant",         color: "text-[#6fab69]",  bg: "bg-[#1e6b1a]/20",  border: "border-[#3d8838]/30",  icon: CheckCircle2 },
  partial:            { label: "Partial",           color: "text-[#edbf46]",  bg: "bg-[#b87d12]/15",  border: "border-[#b87d12]/30",  icon: AlertTriangle },
  non_compliant:      { label: "Non-Compliant",     color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/30",    icon: AlertTriangle },
  pending_assessment: { label: "Pending",           color: "text-white/40",   bg: "bg-white/5",       border: "border-white/10",      icon: Calendar },
};

export default function AdminCompliancePage() {
  const compliantCount    = RECORDS.filter((r) => r.status === "compliant").length;
  const nonCompliantCount = RECORDS.filter((r) => r.status === "non_compliant").length;
  const pendingCount      = RECORDS.filter((r) => r.status === "pending_assessment").length;
  const avgScore          = RECORDS.filter((r) => r.score > 0).reduce((s, r) => s + r.score, 0) /
                            RECORDS.filter((r) => r.score > 0).length;

  return (
    <DashboardLayout role="admin">
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">EU Compliance Overview</h1>
          <p className="text-white/50 text-sm mt-0.5">
            EU Soil Monitoring Law 2025 · Nitrates Directive · All registered farms
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Compliant Farms",     value: compliantCount,          color: "text-[#6fab69]",  bg: "bg-[#1e6b1a]/15" },
            { label: "Non-Compliant",        value: nonCompliantCount,       color: "text-red-400",    bg: "bg-red-500/10" },
            { label: "Pending Assessment",   value: pendingCount,            color: "text-white/50",   bg: "bg-white/5" },
            { label: "Avg Compliance Score", value: `${avgScore.toFixed(0)}/100`, color: "text-[#edbf46]", bg: "bg-[#b87d12]/15" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-4"
            >
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-white/40 text-xs mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Alert for non-compliant */}
        {nonCompliantCount > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium text-sm">
                {nonCompliantCount} farm{nonCompliantCount > 1 ? "s" : ""} at risk of EU subsidy loss
              </p>
              <p className="text-white/50 text-xs mt-0.5">
                Non-compliant farmers should be contacted immediately. Submission deadline: 30 September 2025.
              </p>
            </div>
          </div>
        )}

        {/* Records table */}
        <div className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl overflow-hidden">
          <div className="hidden lg:grid grid-cols-7 gap-3 px-6 py-3 border-b border-[#1a2e18] text-xs text-white/30 font-medium uppercase tracking-wider">
            <span className="col-span-2">Farm / Farmer</span>
            <span>District</span>
            <span>Status</span>
            <span>Score</span>
            <span>Deadline</span>
            <span>Actions</span>
          </div>

          <div className="divide-y divide-[#1a2e18]">
            {RECORDS.map((rec, i) => {
              const cfg = STATUS_CFG[rec.status] || STATUS_CFG.pending_assessment;
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="grid grid-cols-1 lg:grid-cols-7 gap-3 items-center px-6 py-4 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="lg:col-span-2 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{rec.farm}</p>
                      <p className="text-white/40 text-xs">{rec.farmer} · {rec.year}</p>
                    </div>
                  </div>

                  <div className="text-white/50 text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {rec.district}
                  </div>

                  <div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    {rec.gaps > 0 && (
                      <p className="text-[10px] text-[#edbf46] mt-0.5">{rec.gaps} gap{rec.gaps > 1 ? "s" : ""}</p>
                    )}
                  </div>

                  <div>
                    {rec.score > 0 ? (
                      <>
                        <p className="text-white font-semibold">{rec.score}</p>
                        <p className="text-white/30 text-xs">/ 100</p>
                      </>
                    ) : (
                      <p className="text-white/20 text-sm">—</p>
                    )}
                  </div>

                  <div className="text-white/50 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {rec.submitted ? (
                      <span className="text-[#6fab69] font-medium">Submitted</span>
                    ) : (
                      rec.deadline
                    )}
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-7 h-7 rounded-lg bg-[#1e6b1a]/20 hover:bg-[#1e6b1a]/40 flex items-center justify-center text-[#6fab69] transition-all">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {rec.gaps > 0 && (
                      <button className="py-1 px-2 rounded-lg bg-[#b87d12]/20 text-[#edbf46] text-[10px] font-medium hover:bg-[#b87d12]/30 transition-all">
                        Notify
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
