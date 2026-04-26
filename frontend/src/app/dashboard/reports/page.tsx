"use client";

// ── Reports Page ──────────────────────────────────────────────────────────────
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Download, FileText, Eye, Calendar, Package, Filter, Search } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const REPORTS = [
  { id: "rpt-1", report_number: "RPT-2025-00042", farm: "North Field — Kazlauskas", package: "Standard 5ha", date: "2025-06-15", type: "Full Diagnostic", grade: "A", score: 82, pdf_size_kb: 842, includes_compliance: true, includes_heatmap: true },
  { id: "rpt-2", report_number: "RPT-2025-00028", farm: "East Plot",               package: "Professional 10ha", date: "2025-04-10", type: "Full Diagnostic", grade: "B", score: 74, pdf_size_kb: 1240, includes_compliance: true, includes_heatmap: true },
  { id: "rpt-3", report_number: "RPT-2025-00011", farm: "South Meadow",            package: "Starter 1ha",  date: "2025-05-22", type: "Basic Diagnostic", grade: "B", score: 69, pdf_size_kb: 540, includes_compliance: true, includes_heatmap: false },
];

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const filtered = REPORTS.filter((r) => r.farm.toLowerCase().includes(search.toLowerCase()) || r.report_number.includes(search));

  return (
    <DashboardLayout role="farmer">
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Soil Reports</h1>
            <p className="text-white/50 text-sm mt-0.5">{REPORTS.length} reports generated · All available for download</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by farm or report number…"
            className="w-full bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/20 text-sm outline-none focus:border-[#3d8838]/60 transition-all"
          />
        </div>

        <div className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl overflow-hidden">
          <div className="hidden sm:grid grid-cols-6 gap-4 px-6 py-3 border-b border-[#1a2e18] text-xs text-white/30 font-medium uppercase tracking-wider">
            <span className="col-span-2">Report</span>
            <span>Date</span>
            <span>Grade</span>
            <span>Includes</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-[#1a2e18]">
            {filtered.map((r, i) => {
              const gradeColor = r.grade === "A" ? "#3d8838" : r.grade === "B" ? "#b87d12" : "#ef4444";
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.07 }}
                  className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-center px-6 py-4 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="sm:col-span-2 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#1a2e18] flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-[#6fab69]" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{r.farm}</p>
                      <p className="text-white/40 text-xs">{r.report_number} · {r.package}</p>
                    </div>
                  </div>
                  <div className="text-sm text-white/60 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {r.date}</div>
                  <div>
                    <span className="font-display font-bold" style={{ color: gradeColor }}>Grade {r.grade}</span>
                    <p className="text-white/30 text-xs">{r.score}/100</p>
                  </div>
                  <div className="flex gap-1">
                    {r.includes_compliance && <span className="text-[10px] bg-[#1e6b1a]/20 text-[#6fab69] px-1.5 py-0.5 rounded">EU</span>}
                    {r.includes_heatmap && <span className="text-[10px] bg-[#1a3d6b]/20 text-[#5aadd4] px-1.5 py-0.5 rounded">Map</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/analysis`} className="w-8 h-8 rounded-lg bg-[#1a2e18] hover:bg-[#243d24] flex items-center justify-center text-white/50 hover:text-white transition-all">
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                    <button className="w-8 h-8 rounded-lg bg-[#1e6b1a]/20 hover:bg-[#1e6b1a]/40 flex items-center justify-center text-[#6fab69] transition-all">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-white/20 text-[10px] hidden group-hover:block">{(r.pdf_size_kb / 1024).toFixed(1)} MB</span>
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
