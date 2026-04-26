"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, AlertTriangle, CheckCircle2, TrendingUp,
  FlaskConical, Leaf, Shield, ChevronDown, ChevronUp,
  Download, Info, Zap, Droplets, Thermometer, Star
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

// ─── Mock Analysis Data ───────────────────

const ANALYSIS = {
  order_id: "SI-2025-00042",
  farm: "North Field — Kazlauskas",
  processed_at: "2025-06-15T14:32:00Z",
  overall_score: 82,
  soil_health_grade: "A",
  fertility_class: "High",
  confidence_score: 93.5,
  model_version: "1.2.1",

  scores: {
    npk_balance: 79,
    ph: 91,
    moisture: 84,
    eu_compliance: 88,
  },

  readings: {
    nitrogen: 112, phosphorus: 48, potassium: 168,
    ph: 6.8, ec: 340, moisture: 31, temperature: 14.2,
  },

  deficiencies: [
    {
      nutrient: "Phosphorus (P)", severity: "moderate",
      current_value: 48, optimal_min: 60, optimal_max: 90,
      deficit_percent: 20,
    },
  ],
  excesses: [],
  anomalies: [
    {
      parameter: "nitrogen_mg_kg", sampling_point: 3,
      value: 145, field_average: 112, z_score: 2.7,
      description: "Sampling point 3 shows anomalous nitrogen — 145 mg/kg vs field avg 112 mg/kg",
    },
  ],

  fertilizer_recommendations: [
    {
      nutrient: "P", product_name: "TSP (0-46-0)",
      application_rate_kg_ha: 85, timing: "Autumn application before tillage",
      priority: "high", estimated_cost_eur_ha: 49.3,
      justification: "Phosphorus deficit of 20% below optimal for Winter Wheat. Yield impact estimated at 6.0% if untreated.",
    },
  ],
  lime_recommendation_kg_ha: null,

  crop_suitability: [
    { crop: "Winter Wheat",  suitability_score: 89, limiting_factors: [],               recommendation: "Highly suitable" },
    { crop: "Spring Barley", suitability_score: 85, limiting_factors: ["Low P"],        recommendation: "Suitable with amendments" },
    { crop: "Rapeseed",      suitability_score: 78, limiting_factors: ["Low P"],        recommendation: "Suitable with amendments" },
    { crop: "Sugar Beet",    suitability_score: 65, limiting_factors: ["Low P", "pH"], recommendation: "Marginal — significant intervention required" },
    { crop: "Potato",        suitability_score: 60, limiting_factors: ["Low P"],        recommendation: "Marginal — significant intervention required" },
  ],

  eu_compliance_status: "compliant",
  eu_compliance_score: 88,
  compliance_gaps: [],

  crop_rotation_recommendation: [
    { year: 1, crop: "Winter Wheat",  notes: "Current crop — primary recommendation" },
    { year: 2, crop: "Spring Barley", notes: "Break disease cycle, nitrogen-efficient crop" },
    { year: 3, crop: "Oilseed Rape",  notes: "Breaks cereal pests, adds organic matter" },
    { year: 4, crop: "Winter Wheat",  notes: "Return to primary crop with improved soil structure" },
  ],

  summary_text: "Your soil achieved an overall health score of 82/100 (Grade A). Minor Phosphorus imbalances were detected requiring targeted correction. EU Soil Monitoring compliance status: COMPLIANT.",
  detailed_narrative: `## Field Diagnostic Summary\n\nSoil analysis was conducted across 5 ha of Winter Wheat cultivation area using LoRaWAN real-time sensor technology.\n\n**pH Analysis:** Soil pH measured at 6.8 — within optimal range for Winter Wheat (target: 6.0–7.0). No corrective liming required at this time.\n\n**Nutrient Status:** Nitrogen at 112 mg/kg (good), Phosphorus at 48 mg/kg (below optimal), Potassium at 168 mg/kg (excellent).\n\n**Soil Moisture & EC:** Moisture content 31% — adequate for current conditions. Electrical conductivity 340 µS/cm — within acceptable range.\n\n**Priority Recommendations:** 1 fertiliser application is recommended. TSP (0-46-0) at 85 kg/ha (Autumn application before tillage).\n\n**EU Soil Monitoring Law Status:** This report fulfils documentation requirements under the EU Soil Monitoring Law (Directive 2025). Compliance score: 88.`,
};

// ─── Components ──────────────────────────

function ScoreRing({ score, label, size = 80, color = "#3d8838" }: { score: number; label: string; size?: number; color?: string }) {
  const r = 35;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r={r} fill="none" stroke="#1a2e18" strokeWidth="6" />
          <circle
            cx="40" cy="40" r={r} fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={c} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}60)`, transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-white">{score}</span>
        </div>
      </div>
      <span className="text-[10px] text-white/40 text-center leading-tight">{label}</span>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const cfg = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    moderate: "bg-[#b87d12]/20 text-[#edbf46] border-[#b87d12]/30",
    mild: "bg-[#2a88b8]/20 text-[#5aadd4] border-[#2a88b8]/30",
    high: "bg-red-500/20 text-red-400 border-red-500/30",
  }[severity] || "bg-white/5 text-white/40 border-white/10";

  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg}`}>
      {severity}
    </span>
  );
}

function NarrativeCard({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const lines = text.split("\n").filter(Boolean);

  return (
    <div className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Detailed AI Report</h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-white/40 hover:text-white/80 flex items-center gap-1 transition-colors"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? "Collapse" : "Read Full Report"}
        </button>
      </div>
      <div className={`text-sm text-white/70 leading-relaxed space-y-2 overflow-hidden transition-all duration-300 ${expanded ? "max-h-[800px]" : "max-h-24"}`}>
        {lines.map((line, i) => {
          if (line.startsWith("## ")) return <h4 key={i} className="text-white font-bold mt-4 first:mt-0">{line.replace("## ", "")}</h4>;
          if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-white/90">{line.replace(/\*\*/g, "")}</p>;
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={i}>{parts.map((p, j) =>
              p.startsWith("**") ? <strong key={j} className="text-white/90">{p.replace(/\*\*/g, "")}</strong> : p
            )}</p>
          );
        })}
      </div>
      {!expanded && <div className="h-12 bg-gradient-to-t from-[#0d1a0c]/80 to-transparent -mt-12 relative rounded-b-xl" />}
    </div>
  );
}

// ─── Page ────────────────────────────────

export default function AIAnalysisPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "nutrients" | "crops" | "compliance" | "rotation">("overview");

  const gradeColor = { "A+": "#3d8838", A: "#3d8838", B: "#b87d12", C: "#b87d12", D: "#ef4444", F: "#ef4444" }[ANALYSIS.soil_health_grade] || "#3d8838";

  return (
    <DashboardLayout role="farmer">
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-white/30">{ANALYSIS.order_id}</span>
              <span className="text-white/20">·</span>
              <span className="text-xs text-white/40">AI Model v{ANALYSIS.model_version}</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{ANALYSIS.farm}</h1>
            <p className="text-white/50 text-sm mt-0.5">
              Analysed {new Date(ANALYSIS.processed_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · Confidence {ANALYSIS.confidence_score}%
            </p>
          </div>
          <button className="flex items-center gap-2 bg-[#1e6b1a] hover:bg-[#26881f] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all w-fit shadow-lg shadow-[#1e6b1a]/20">
            <Download className="w-4 h-4" />
            Download PDF Report
          </button>
        </div>

        {/* Summary Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1e6b1a]/10 border border-[#3d8838]/30 rounded-2xl p-5 flex items-start gap-4"
        >
          <div className="flex-1">
            <p className="text-white font-medium mb-1">{ANALYSIS.summary_text}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-4xl font-display font-bold" style={{ color: gradeColor }}>Grade {ANALYSIS.soil_health_grade}</div>
            <p className="text-xs text-white/40">Soil Health</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#0a120a] rounded-xl p-1 overflow-x-auto">
          {(["overview", "nutrients", "crops", "compliance", "rotation"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs sm:text-sm font-medium px-3 sm:px-5 py-2 rounded-lg capitalize whitespace-nowrap transition-all ${
                activeTab === tab ? "bg-[#1e6b1a]/40 text-[#6fab69]" : "text-white/40 hover:text-white/70"
              }`}
            >
              {tab === "rotation" ? "Crop Rotation" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Score Grid */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-5">Composite Scores</h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-6">
                <ScoreRing score={ANALYSIS.overall_score} label="Overall Score" size={90} color={gradeColor} />
                <ScoreRing score={ANALYSIS.scores.npk_balance} label="NPK Balance" color="#3d8838" />
                <ScoreRing score={ANALYSIS.scores.ph} label="pH Score" color="#7c3aed" />
                <ScoreRing score={ANALYSIS.scores.moisture} label="Moisture" color="#2a88b8" />
                <ScoreRing score={ANALYSIS.eu_compliance_score} label="EU Compliance" color="#b87d12" />
              </div>
            </motion.div>

            {/* Readings */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">Sensor Readings Summary</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Nitrogen (N)", value: ANALYSIS.readings.nitrogen, unit: "mg/kg", icon: Leaf, color: "text-[#6fab69]", bg: "bg-[#1e6b1a]/15", status: "good" },
                  { label: "Phosphorus (P)", value: ANALYSIS.readings.phosphorus, unit: "mg/kg", icon: BarChart3, color: "text-[#edbf46]", bg: "bg-[#b87d12]/15", status: "low" },
                  { label: "Potassium (K)", value: ANALYSIS.readings.potassium, unit: "mg/kg", icon: TrendingUp, color: "text-[#5aadd4]", bg: "bg-[#2a88b8]/15", status: "good" },
                  { label: "pH Level", value: ANALYSIS.readings.ph, unit: "", icon: FlaskConical, color: "text-purple-400", bg: "bg-purple-500/10", status: "good" },
                  { label: "EC (µS/cm)", value: ANALYSIS.readings.ec, unit: "", icon: Zap, color: "text-[#edbf46]", bg: "bg-[#b87d12]/10", status: "good" },
                  { label: "Moisture %", value: `${ANALYSIS.readings.moisture}%`, unit: "", icon: Droplets, color: "text-[#5aadd4]", bg: "bg-[#2a88b8]/10", status: "good" },
                  { label: "Temperature", value: `${ANALYSIS.readings.temperature}°C`, unit: "", icon: Thermometer, color: "text-orange-400", bg: "bg-orange-500/10", status: "good" },
                  { label: "Fertility Class", value: ANALYSIS.fertility_class, unit: "", icon: Star, color: "text-[#6fab69]", bg: "bg-[#1e6b1a]/15", status: "good" },
                ].map((r) => (
                  <div key={r.label} className={`${r.bg} rounded-xl p-4 border ${r.status === "low" ? "border-[#b87d12]/30" : "border-transparent"}`}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <r.icon className={`w-3.5 h-3.5 ${r.color}`} />
                      <span className="text-[10px] text-white/50">{r.label}</span>
                      {r.status === "low" && <AlertTriangle className="w-3 h-3 text-[#edbf46] ml-auto" />}
                    </div>
                    <p className="text-lg font-bold text-white">{r.value}{r.unit && <span className="text-xs text-white/40 ml-1">{r.unit}</span>}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <NarrativeCard text={ANALYSIS.detailed_narrative} />
          </div>
        )}

        {/* ── NUTRIENTS TAB ── */}
        {activeTab === "nutrients" && (
          <div className="space-y-5">
            {/* Deficiencies */}
            {ANALYSIS.deficiencies.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#1a2e18] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#edbf46]" />
                  <h2 className="text-white font-semibold">Nutrient Deficiencies</h2>
                </div>
                {ANALYSIS.deficiencies.map((d, i) => (
                  <div key={i} className="px-6 py-5">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-white font-medium flex-1">{d.nutrient}</h3>
                      <SeverityBadge severity={d.severity} />
                      <span className="text-[#edbf46] text-sm font-bold">-{d.deficit_percent}%</span>
                    </div>
                    <div className="relative h-3 bg-[#1a2e18] rounded-full overflow-hidden mb-2">
                      <div className="absolute inset-y-0 left-0 bg-[#b87d12]/40 rounded-full" style={{ width: `${(d.optimal_min / (d.optimal_max * 1.2)) * 100}%` }} />
                      <div className="absolute inset-y-0 left-0 bg-[#b87d12] rounded-full" style={{ width: `${(d.current_value / (d.optimal_max * 1.2)) * 100}%` }} />
                      <div className="absolute inset-y-0 top-0 bottom-0 w-0.5 bg-[#6fab69]" style={{ left: `${(d.optimal_min / (d.optimal_max * 1.2)) * 100}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-white/40">
                      <span>Current: <strong className="text-white/70">{d.current_value} mg/kg</strong></span>
                      <span>Target: <strong className="text-white/70">{d.optimal_min}–{d.optimal_max} mg/kg</strong></span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Fertilizer Recommendations */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#1a2e18]">
                <h2 className="text-white font-semibold">Fertiliser Recommendations</h2>
              </div>
              {ANALYSIS.fertilizer_recommendations.map((rec, i) => (
                <div key={i} className="px-6 py-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#2a88b8]/15 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[#5aadd4]">{rec.nutrient}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-medium">{rec.product_name}</h3>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${rec.priority === "high" ? "bg-[#b87d12]/20 text-[#edbf46]" : "bg-[#1e6b1a]/20 text-[#6fab69]"}`}>{rec.priority}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div className="bg-[#0a120a] rounded-xl p-3 text-center">
                          <p className="text-[10px] text-white/40">Rate</p>
                          <p className="text-sm font-bold text-white">{rec.application_rate_kg_ha} kg/ha</p>
                        </div>
                        <div className="bg-[#0a120a] rounded-xl p-3 text-center">
                          <p className="text-[10px] text-white/40">Est. Cost</p>
                          <p className="text-sm font-bold text-[#6fab69]">€{rec.estimated_cost_eur_ha}/ha</p>
                        </div>
                        <div className="bg-[#0a120a] rounded-xl p-3 text-center">
                          <p className="text-[10px] text-white/40">Priority</p>
                          <p className="text-sm font-bold text-white capitalize">{rec.priority}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-start gap-2 bg-[#0a120a] rounded-xl p-3">
                        <Info className="w-3.5 h-3.5 text-white/30 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-white/50 leading-relaxed">{rec.justification}</p>
                      </div>
                      <p className="mt-2 text-xs text-white/40 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3d8838]" />
                        {rec.timing}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Anomalies */}
            {ANALYSIS.anomalies.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#0d1a0c]/80 border border-[#b87d12]/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 text-[#edbf46]" />
                  <h2 className="text-white font-semibold">Anomaly Detection</h2>
                </div>
                {ANALYSIS.anomalies.map((a, i) => (
                  <div key={i} className="bg-[#b87d12]/10 border border-[#b87d12]/20 rounded-xl p-4">
                    <p className="text-[#edbf46] text-sm font-medium mb-1">Point {a.sampling_point}: Statistical Outlier Detected</p>
                    <p className="text-white/60 text-sm">{a.description}</p>
                    <p className="text-white/40 text-xs mt-2">Z-score: {a.z_score} (threshold: 2.5)</p>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* ── CROPS TAB ── */}
        {activeTab === "crops" && (
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#1a2e18]">
                <h2 className="text-white font-semibold">Crop Suitability Analysis</h2>
                <p className="text-white/40 text-xs mt-0.5">Ranked by suitability score for current soil conditions</p>
              </div>
              <div className="divide-y divide-[#1a2e18]">
                {ANALYSIS.crop_suitability.map((c, i) => (
                  <div key={c.crop} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                    <span className="text-white/30 text-sm font-mono w-4">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-white font-medium text-sm">{c.crop}</h3>
                        {c.limiting_factors.length === 0 && <CheckCircle2 className="w-3.5 h-3.5 text-[#6fab69]" />}
                      </div>
                      <div className="h-1.5 bg-[#1a2e18] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${c.suitability_score}%` }}
                          transition={{ delay: i * 0.08, duration: 0.6 }}
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: c.suitability_score >= 80 ? "#3d8838" : c.suitability_score >= 60 ? "#b87d12" : "#ef4444",
                          }}
                        />
                      </div>
                      {c.limiting_factors.length > 0 && (
                        <p className="text-[10px] text-[#edbf46]/70 mt-1">Limiting: {c.limiting_factors.join(", ")}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-white">{c.suitability_score}<span className="text-xs text-white/30">%</span></p>
                      <p className="text-[10px] text-white/40 max-w-24 text-right">{c.recommendation.split(" ")[0]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* ── COMPLIANCE TAB ── */}
        {activeTab === "compliance" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="bg-[#1e6b1a]/10 border border-[#3d8838]/40 rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1e6b1a]/30 flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#6fab69]" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">EU Compliant</h2>
                <p className="text-white/60 text-sm">EU Soil Monitoring Law (Directive 2025) · Score: {ANALYSIS.eu_compliance_score}/100</p>
              </div>
              <div className="ml-auto">
                <button className="flex items-center gap-2 bg-[#1e6b1a]/30 hover:bg-[#1e6b1a]/50 text-[#6fab69] text-sm font-medium px-4 py-2 rounded-xl transition-all">
                  <Download className="w-4 h-4" /> Download Certificate
                </button>
              </div>
            </div>

            <div className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Compliance Checklist</h3>
              <div className="space-y-3">
                {[
                  { item: "Soil pH within EU acceptable range (4.5–8.5)", pass: true },
                  { item: "Nitrogen balance below NVZ ceiling (170 kg N/ha)", pass: true },
                  { item: "Electrical conductivity within salinity limit", pass: true },
                  { item: "Soil organic matter documentation", pass: true },
                  { item: "Annual soil health monitoring record", pass: true },
                  { item: "Nutrient management plan submitted", pass: false },
                ].map((check, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${check.pass ? "bg-[#1e6b1a]/10" : "bg-[#b87d12]/10 border border-[#b87d12]/20"}`}>
                    {check.pass
                      ? <CheckCircle2 className="w-4 h-4 text-[#6fab69] flex-shrink-0" />
                      : <AlertTriangle className="w-4 h-4 text-[#edbf46] flex-shrink-0" />
                    }
                    <span className={`text-sm ${check.pass ? "text-white/70" : "text-[#edbf46]/80"}`}>{check.item}</span>
                    {!check.pass && <span className="ml-auto text-xs text-[#edbf46] font-medium">Required</span>}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── CROP ROTATION TAB ── */}
        {activeTab === "rotation" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-5">4-Year Crop Rotation Plan</h2>
            <div className="grid sm:grid-cols-4 gap-4">
              {ANALYSIS.crop_rotation_recommendation.map((r, i) => (
                <div key={r.year} className={`p-5 rounded-2xl border text-center ${i === 0 ? "bg-[#1e6b1a]/20 border-[#3d8838]/50" : "bg-[#0a120a] border-[#1a2e18]"}`}>
                  <div className="text-[10px] text-white/40 font-mono mb-2">YEAR {r.year}</div>
                  <div className="w-10 h-10 rounded-xl bg-[#1a2e18] flex items-center justify-center mx-auto mb-3">
                    <Leaf className={`w-4 h-4 ${i === 0 ? "text-[#6fab69]" : "text-white/40"}`} />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-2">{r.crop}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{r.notes}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
