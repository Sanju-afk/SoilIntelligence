"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, Download, Search, Eye, RefreshCw,
  CheckCircle2, Clock, AlertTriangle
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const REPORTS = [
  { id: "r1", report_number: "RPT-2025-00059", order: "SI-2025-00059", farmer: "Petras Vaitkus",     farm: "Vaitkus West Field", package: "Standard 5ha",      grade: "B", score: 74, generated: "2025-06-17 14:32", size_kb: 882,  downloads: 1, compliance: true },
  { id: "r2", report_number: "RPT-2025-00048", order: "SI-2025-00048", farmer: "Laima Bražienė",     farm: "Bražienė Organic",   package: "Professional 10ha", grade: "A", score: 84, generated: "2025-06-17 11:18", size_kb: 1240, downloads: 3, compliance: true },
  { id: "r3", report_number: "RPT-2025-00047", order: "SI-2025-00047", farmer: "Vytautas Šimkus",    farm: "Šimkus North",       package: "Starter 1ha",       grade: "C", score: 58, generated: "2025-06-16 16:45", size_kb: 540,  downloads: 2, compliance: false },
  { id: "r4", report_number: "RPT-2025-00042", order: "SI-2025-00042", farmer: "Andrius Kazlauskas", farm: "North Field",        package: "Standard 5ha",      grade: "A", score: 82, generated: "2025-06-15 09:20", size_kb: 842,  downloads: 4, compliance: true },
  { id: "r5", report_number: "RPT-2025-00040", order: "SI-2025-00040", farmer: "Irena Kazlauskienė", farm: "Kazlauskienė East",  package: "Standard 5ha",      grade: "B", score: 71, generated: "2025-06-14 15:30", size_kb: 798,  downloads: 1, compliance: true },
];

const GRADE_COLOR: Record<string, string> = {
  "A+": "#3d8838", A: "#3d8838", B: "#b87d12", C: "#ef4444", D: "#ef4444", F: "#ef4444",
};

export default function AdminReportsPage() {
  const [search, setSearch] = useState("");
  const [regenerating, setRegenerating] = useState<string | null>(null);

  const filtered = REPORTS.filter(
    (r) =>
      r.report_number.toLowerCase().includes(search.toLowerCase()) ||
      r.farmer.toLowerCase().includes(search.toLowerCase()) ||
      r.farm.toLowerCase().includes(search.toLowerCase())
  );

  const handleRegenerate = async (id: string) => {
    setRegenerating(id);
    await new Promise((r) => setTimeout(r, 2000));
    setRegenerating(null);
  };

  const totalDownloads = REPORTS.reduce((s, r) => s + r.downloads, 0);

  return (
    <DashboardLayout role="admin">
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Report Management</h1>
            <p className="text-white/50 text-sm mt-0.5">
              {REPORTS.length} reports generated · {totalDownloads} total downloads
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Reports Generated", value: REPORTS.length,                                    color: "text-[#6fab69]" },
            { label: "EU Compliant",       value: REPORTS.filter((r) => r.compliance).length,        color: "text-[#5aadd4]" },
            { label: "Total Downloads",    value: totalDownloads,                                    color: "text-[#edbf46]" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-4 text-center"
            >
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-white/40 text-xs mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports…"
            className="w-full bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/20 text-sm outline-none focus:border-[#3d8838]/60 transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl overflow-hidden">
          <div className="hidden lg:grid grid-cols-8 gap-3 px-6 py-3 border-b border-[#1a2e18] text-xs text-white/30 font-medium uppercase tracking-wider">
            <span className="col-span-2">Report / Farmer</span>
            <span>Package</span>
            <span>Grade</span>
            <span>EU Compliance</span>
            <span>Size</span>
            <span>Downloads</span>
            <span>Actions</span>
          </div>

          <div className="divide-y divide-[#1a2e18]">
            {filtered.map((report, i) => {
              const gradeColor = GRADE_COLOR[report.grade] || "#ef4444";
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="grid grid-cols-1 lg:grid-cols-8 gap-3 items-center px-6 py-4 hover:bg-white/[0.02] transition-colors group"
                >
                  {/* Report info */}
                  <div className="lg:col-span-2 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#1a2e18] flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-[#6fab69]" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{report.farmer}</p>
                      <p className="text-white/40 text-xs">
                        {report.report_number} · {report.farm}
                      </p>
                    </div>
                  </div>

                  <div className="text-white/60 text-sm">{report.package}</div>

                  {/* Grade */}
                  <div>
                    <span
                      className="text-lg font-display font-bold"
                      style={{ color: gradeColor }}
                    >
                      Grade {report.grade}
                    </span>
                    <p className="text-white/30 text-xs">{report.score}/100</p>
                  </div>

                  {/* Compliance */}
                  <div>
                    {report.compliance ? (
                      <span className="flex items-center gap-1 text-xs text-[#6fab69] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Compliant
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-[#edbf46] font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" /> Gaps Found
                      </span>
                    )}
                  </div>

                  <div className="text-white/50 text-xs">
                    {(report.size_kb / 1024).toFixed(1)} MB
                  </div>

                  <div className="text-white/60 text-sm flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {report.downloads}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-7 h-7 rounded-lg bg-[#1a2e18] hover:bg-[#243d24] flex items-center justify-center text-white/50 hover:text-white transition-all">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-7 h-7 rounded-lg bg-[#1e6b1a]/20 hover:bg-[#1e6b1a]/40 flex items-center justify-center text-[#6fab69] transition-all">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRegenerate(report.id)}
                      disabled={regenerating === report.id}
                      className="w-7 h-7 rounded-lg bg-[#2a88b8]/20 hover:bg-[#2a88b8]/30 flex items-center justify-center text-[#5aadd4] transition-all disabled:opacity-40"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${regenerating === report.id ? "animate-spin" : ""}`}
                      />
                    </button>
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
