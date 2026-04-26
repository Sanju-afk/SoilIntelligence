"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Search, ChevronRight, MoreHorizontal, Truck, UserCheck, Play } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const ALL_ORDERS = [
  { id: "SI-2025-00049", farmer: "Petras Vaitkus",      farm: "Vaitkus West Field",  package: "standard_5ha",      status: "worker_assigned",     worker: "Tomas K.", amount: 145.2, date: "2025-06-17" },
  { id: "SI-2025-00048", farmer: "Laima Bražienė",      farm: "Bražienė Organic",    package: "professional_10ha", status: "field_work_started",  worker: "Rimas P.", amount: 181.5, date: "2025-06-17" },
  { id: "SI-2025-00047", farmer: "Vytautas Šimkus",     farm: "Šimkus North",        package: "starter_1ha",       status: "report_generated",    worker: "Diana V.", amount: 60.5,  date: "2025-06-16" },
  { id: "SI-2025-00046", farmer: "Irena Kazlauskienė",  farm: "Kazlauskienė East",   package: "standard_5ha",      status: "delivered",           worker: "Tomas K.", amount: 145.2, date: "2025-06-15" },
  { id: "SI-2025-00045", farmer: "Mindaugas Jokubaitis",farm: "Jokubaitis Farm A",   package: "professional_10ha", status: "pending",             worker: null,       amount: 181.5, date: "2025-06-15" },
  { id: "SI-2025-00044", farmer: "Andrius Kazlauskas",  farm: "North Field",         package: "standard_5ha",      status: "ai_analysis_running", worker: "Diana V.", amount: 145.2, date: "2025-06-14" },
];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending:             { label: "Pending",       color: "text-white/50",   bg: "bg-white/5" },
  confirmed:           { label: "Confirmed",     color: "text-[#5aadd4]", bg: "bg-[#2a88b8]/10" },
  worker_assigned:     { label: "Assigned",      color: "text-[#edbf46]", bg: "bg-[#b87d12]/10" },
  field_work_started:  { label: "Field Work",    color: "text-[#5aadd4]", bg: "bg-[#2a88b8]/10" },
  ai_analysis_running: { label: "AI Processing", color: "text-purple-400", bg: "bg-purple-500/10" },
  report_generated:    { label: "Report Ready",  color: "text-[#6fab69]", bg: "bg-[#1e6b1a]/15" },
  delivered:           { label: "Delivered",     color: "text-[#6fab69]", bg: "bg-[#1e6b1a]/15" },
};

const PKG_LABELS: Record<string, string> = {
  starter_1ha: "Starter 1ha", standard_5ha: "Standard 5ha",
  professional_10ha: "Professional 10ha", enterprise: "Enterprise",
};

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = ALL_ORDERS.filter((o) =>
    (statusFilter === "all" || o.status === statusFilter) &&
    (o.id.includes(search) || o.farmer.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout role="admin">
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Order Management</h1>
            <p className="text-white/50 text-sm mt-0.5">{ALL_ORDERS.length} orders · €{ALL_ORDERS.reduce((s, o) => s + o.amount, 0).toFixed(2)} total value</p>
          </div>
          <div className="flex gap-2">
            {selected.length > 0 && (
              <button className="flex items-center gap-2 bg-[#2a88b8]/20 border border-[#2a88b8]/30 text-[#5aadd4] text-sm font-medium px-4 py-2 rounded-xl transition-all">
                <Truck className="w-4 h-4" /> Assign Worker ({selected.length})
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order ID or farmer…" className="w-full bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/20 text-sm outline-none focus:border-[#3d8838]/60 transition-all" />
          </div>
          <div className="flex gap-1 bg-[#0a120a] rounded-xl p-1 overflow-x-auto no-scrollbar">
            {["all", "pending", "worker_assigned", "field_work_started", "report_generated", "delivered"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap capitalize transition-all ${statusFilter === s ? "bg-[#1e6b1a]/40 text-[#6fab69]" : "text-white/40 hover:text-white/70"}`}>
                {s === "all" ? "All" : STATUS_CFG[s]?.label || s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl overflow-hidden">
          <div className="hidden xl:grid grid-cols-8 gap-3 px-6 py-3 border-b border-[#1a2e18] text-xs text-white/30 font-medium uppercase tracking-wider">
            <span className="col-span-2">Order / Farmer</span>
            <span>Package</span>
            <span>Status</span>
            <span>Worker</span>
            <span>Amount</span>
            <span>Date</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-[#1a2e18]">
            {filtered.map((order, i) => {
              const s = STATUS_CFG[order.status] || STATUS_CFG.pending;
              const isSelected = selected.includes(order.id);
              return (
                <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className={`grid grid-cols-1 xl:grid-cols-8 gap-3 items-center px-6 py-4 hover:bg-white/[0.02] transition-colors group cursor-pointer ${isSelected ? "bg-[#1e6b1a]/5" : ""}`}
                  onClick={() => setSelected(prev => isSelected ? prev.filter(id => id !== order.id) : [...prev, order.id])}
                >
                  <div className="xl:col-span-2 flex items-center gap-3">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${isSelected ? "bg-[#3d8838] border-[#3d8838]" : "border-[#1a2e18]"}`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{order.farmer}</p>
                      <p className="text-white/40 text-xs">{order.id} · {order.farm}</p>
                    </div>
                  </div>
                  <div className="text-white/60 text-sm">{PKG_LABELS[order.package]}</div>
                  <div><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.bg} ${s.color}`}>{s.label}</span></div>
                  <div className="text-white/60 text-sm">{order.worker || <span className="text-white/25 italic">Unassigned</span>}</div>
                  <div className="font-data font-bold text-white text-sm">€{order.amount.toFixed(2)}</div>
                  <div className="text-white/40 text-xs">{order.date}</div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {order.status === "pending" && (
                      <button className="w-7 h-7 rounded-lg bg-[#2a88b8]/20 text-[#5aadd4] flex items-center justify-center hover:bg-[#2a88b8]/30 transition-all" onClick={(e) => e.stopPropagation()}>
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {order.status === "data_uploaded" && (
                      <button className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center hover:bg-purple-500/30 transition-all" onClick={(e) => e.stopPropagation()}>
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button className="w-7 h-7 rounded-lg bg-[#1a2e18] text-white/40 flex items-center justify-center hover:bg-[#243d24] hover:text-white transition-all" onClick={(e) => e.stopPropagation()}>
                      <ChevronRight className="w-3.5 h-3.5" />
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
