"use client";

import { motion } from "framer-motion";
import { Shield, CheckCircle2, AlertTriangle, Download, ExternalLink, Calendar, FileText } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const COMPLIANCE_RECORDS = [
  { id: "c-1", farm: "North Field", year: 2025, status: "compliant", score: 88, directive: "EU Soil Monitoring Law 2025", submitted: false, deadline: "2025-09-30", gaps: 0 },
  { id: "c-2", farm: "East Plot",   year: 2025, status: "partial",   score: 64, directive: "EU Soil Monitoring Law 2025", submitted: false, deadline: "2025-09-30", gaps: 2 },
  { id: "c-3", farm: "South Meadow",year: 2024, status: "compliant", score: 91, directive: "Nitrates Directive 91/676/EEC", submitted: true,  deadline: "2024-12-01", gaps: 0 },
];

const STATUS_CFG = {
  compliant:           { label: "Compliant",        color: "text-[#6fab69]",  bg: "bg-[#1e6b1a]/20",  border: "border-[#3d8838]/30",  icon: CheckCircle2 },
  partial:             { label: "Partial",           color: "text-[#edbf46]",  bg: "bg-[#b87d12]/15",  border: "border-[#b87d12]/30",  icon: AlertTriangle },
  non_compliant:       { label: "Non-Compliant",     color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/30",    icon: AlertTriangle },
  pending_assessment:  { label: "Pending",           color: "text-white/50",   bg: "bg-white/5",       border: "border-white/10",      icon: Calendar },
};

export default function CompliancePage() {
  return (
    <DashboardLayout role="farmer">
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">EU Compliance</h1>
          <p className="text-white/50 text-sm mt-0.5">EU Soil Monitoring Law 2025 · Nitrates Directive · Nutrient Management</p>
        </div>

        {/* Info Banner */}
        <div className="bg-[#1a3d6b]/15 border border-[#2a88b8]/30 rounded-2xl p-5 flex gap-4">
          <Shield className="w-5 h-5 text-[#5aadd4] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-white font-medium mb-1">EU Soil Monitoring Law — Deadline: 30 September 2025</p>
            <p className="text-white/60 text-sm leading-relaxed">
              The new EU Soil Monitoring Law requires all farms to document soil health data annually. Your Soil Intelligence reports are pre-formatted for submission to the Lithuanian Paying Agency (NMA).
            </p>
          </div>
          <a href="https://eur-lex.europa.eu" target="_blank" className="flex items-center gap-1 text-xs text-[#5aadd4] hover:underline whitespace-nowrap">
            <ExternalLink className="w-3.5 h-3.5" /> EU Directive
          </a>
        </div>

        {/* Records */}
        <div className="space-y-4">
          {COMPLIANCE_RECORDS.map((rec, i) => {
            const cfg = STATUS_CFG[rec.status as keyof typeof STATUS_CFG] || STATUS_CFG.pending_assessment;
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`bg-[#0d1a0c]/80 border ${cfg.border} rounded-2xl p-5`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <cfg.icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold">{rec.farm}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <p className="text-white/40 text-sm">{rec.directive} · {rec.year}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{rec.score}</p>
                      <p className="text-white/30 text-[10px]">Score</p>
                    </div>
                    <div className="flex gap-2">
                      {rec.submitted ? (
                        <span className="flex items-center gap-1 text-xs text-[#6fab69] bg-[#1e6b1a]/20 px-2.5 py-1 rounded-full font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Submitted
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-[#edbf46] bg-[#b87d12]/15 px-2.5 py-1 rounded-full font-medium">
                          <Calendar className="w-3 h-3" /> Due {rec.deadline}
                        </span>
                      )}
                      <button className="flex items-center gap-1.5 text-xs text-[#6fab69] bg-[#1e6b1a]/20 hover:bg-[#1e6b1a]/40 px-3 py-1.5 rounded-xl transition-all font-medium">
                        <Download className="w-3.5 h-3.5" /> Certificate
                      </button>
                    </div>
                  </div>
                </div>

                {rec.gaps > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#1a2e18]">
                    <p className="text-[#edbf46] text-sm font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> {rec.gaps} compliance gap{rec.gaps > 1 ? "s" : ""} require attention
                    </p>
                    <ul className="space-y-1.5">
                      {["Nutrient management plan not yet submitted", "Phosphorus balance documentation missing"].slice(0, rec.gaps).map((gap) => (
                        <li key={gap} className="text-xs text-white/50 flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-[#edbf46]" /> {gap}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Action Panel */}
        <div className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#6fab69]" /> Required Documentation Checklist
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { task: "Annual soil health monitoring report", done: true },
              { task: "Nutrient management plan (NMP)",       done: false },
              { task: "Nitrate Vulnerable Zone declaration",  done: true },
              { task: "Soil organic matter baseline",         done: true },
              { task: "Submit to Lithuanian Paying Agency",   done: false },
              { task: "Confirm organic matter % on all fields", done: false },
            ].map((item) => (
              <div key={item.task} className={`flex items-center gap-3 p-3 rounded-xl ${item.done ? "bg-[#1e6b1a]/10" : "bg-[#b87d12]/10 border border-[#b87d12]/20"}`}>
                {item.done
                  ? <CheckCircle2 className="w-4 h-4 text-[#6fab69] flex-shrink-0" />
                  : <AlertTriangle className="w-4 h-4 text-[#edbf46] flex-shrink-0" />
                }
                <span className={`text-sm ${item.done ? "text-white/70" : "text-[#edbf46]/80"}`}>{item.task}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
