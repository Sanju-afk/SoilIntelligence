"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Truck, UserCheck, MapPin, Star, CheckCircle2,
  Plus, Search, MoreHorizontal, Package, Clock
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const WORKERS = [
  { id: "w1", name: "Tomas Kačinskas",      region: "Kaunas",     district: "Kaunas r.",    status: "on_site",           tasks_today: 2, tasks_total: 47, rating: 4.9, verified: true,  available: true,  joined: "2024-09-01" },
  { id: "w2", name: "Rimas Paulauskas",     region: "Vilnius",    district: "Vilniaus r.",  status: "equipment_collected", tasks_today: 1, tasks_total: 31, rating: 4.8, verified: true,  available: true,  joined: "2024-10-15" },
  { id: "w3", name: "Diana Valčiukaitė",    region: "Šiauliai",   district: "Šiaulių r.",   status: "completed",         tasks_today: 3, tasks_total: 22, rating: 5.0, verified: true,  available: false, joined: "2025-01-20" },
  { id: "w4", name: "Gintautas Morkūnas",   region: "Panevėžys",  district: "Panevėžio r.", status: "available",         tasks_today: 0, tasks_total: 8,  rating: 4.7, verified: false, available: true,  joined: "2025-03-05" },
  { id: "w5", name: "Aušra Petrauskaitė",   region: "Klaipėda",   district: "Klaipėdos r.", status: "available",         tasks_today: 0, tasks_total: 15, rating: 4.8, verified: true,  available: true,  joined: "2025-02-10" },
];

const STATUS_CFG: Record<string, { label: string; color: string; dot: string }> = {
  available:            { label: "Available",     color: "text-[#6fab69]",  dot: "bg-[#6fab69]" },
  on_site:              { label: "On Site",       color: "text-[#5aadd4]",  dot: "bg-[#5aadd4] animate-pulse" },
  equipment_collected:  { label: "En Route",      color: "text-[#edbf46]",  dot: "bg-[#edbf46] animate-pulse" },
  completed:            { label: "Day Complete",  color: "text-white/40",   dot: "bg-white/20" },
  unavailable:          { label: "Unavailable",   color: "text-red-400",    dot: "bg-red-400" },
};

export default function AdminWorkersPage() {
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  const filtered = WORKERS.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="admin">
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Field Workers</h1>
            <p className="text-white/50 text-sm mt-0.5">
              {WORKERS.length} workers · {WORKERS.filter((w) => w.available).length} available now
            </p>
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 bg-[#1e6b1a] hover:bg-[#26881f] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-[#1e6b1a]/20"
          >
            <Plus className="w-4 h-4" /> Invite Worker
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Workers",      value: WORKERS.length,                                    color: "text-white" },
            { label: "Available Now",      value: WORKERS.filter((w) => w.available).length,          color: "text-[#6fab69]" },
            { label: "Verified Soil Tech", value: WORKERS.filter((w) => w.verified).length,           color: "text-[#5aadd4]" },
            { label: "Avg Rating",         value: (WORKERS.reduce((s,w) => s+w.rating,0)/WORKERS.length).toFixed(1) + " ★", color: "text-[#edbf46]" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-4 text-center">
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
            placeholder="Search workers…"
            className="w-full bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/20 text-sm outline-none focus:border-[#3d8838]/60 transition-all"
          />
        </div>

        {/* Worker cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((worker, i) => {
            const statusCfg = STATUS_CFG[worker.status] || STATUS_CFG.available;
            return (
              <motion.div key={worker.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-[#0d1a0c]/80 border border-[#1a2e18] hover:border-[#3d8838]/30 rounded-2xl p-5 transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3d8838] to-[#1e6b1a] flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {worker.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </span>
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#08150a] ${statusCfg.dot}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-white font-medium text-sm">{worker.name}</p>
                        {worker.verified && (
                          <UserCheck className="w-3.5 h-3.5 text-[#6fab69] flex-shrink-0" />
                        )}
                      </div>
                      <p className={`text-xs ${statusCfg.color}`}>{statusCfg.label}</p>
                    </div>
                  </div>
                  <button className="text-white/30 hover:text-white transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-[#0a120a] rounded-xl p-2.5 text-center">
                    <p className="text-white font-bold">{worker.tasks_today}</p>
                    <p className="text-white/30 text-[10px]">Today</p>
                  </div>
                  <div className="bg-[#0a120a] rounded-xl p-2.5 text-center">
                    <p className="text-white font-bold">{worker.tasks_total}</p>
                    <p className="text-white/30 text-[10px]">Total</p>
                  </div>
                  <div className="bg-[#0a120a] rounded-xl p-2.5 text-center">
                    <p className="text-[#edbf46] font-bold">{worker.rating}</p>
                    <p className="text-white/30 text-[10px]">Rating</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 mb-4 text-xs text-white/40">
                  <MapPin className="w-3 h-3" />
                  <span>{worker.district}</span>
                  <span className="text-white/20">·</span>
                  <span>Since {worker.joined}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {worker.available ? (
                    <button className="flex-1 py-2 bg-[#1e6b1a]/20 hover:bg-[#1e6b1a]/40 text-[#6fab69] text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1">
                      <Package className="w-3.5 h-3.5" /> Assign Order
                    </button>
                  ) : (
                    <div className="flex-1 py-2 bg-white/5 text-white/20 text-xs font-medium rounded-xl text-center cursor-not-allowed">
                      Not available
                    </div>
                  )}
                  {!worker.verified && (
                    <button className="py-2 px-3 bg-[#2a88b8]/20 hover:bg-[#2a88b8]/30 text-[#5aadd4] text-xs font-medium rounded-xl transition-all flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Invite Modal */}
        {showInvite && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0d1a0c] border border-[#3d8838]/40 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
              <h2 className="text-white font-bold text-lg mb-5">Invite Field Worker</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-white/50 mb-2">Full Name</label>
                  <input placeholder="Worker full name" className="w-full bg-[#0a120a] border border-[#1a2e18] rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2">Email</label>
                  <input type="email" placeholder="worker@email.lt" className="w-full bg-[#0a120a] border border-[#1a2e18] rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2">Region</label>
                  <input placeholder="e.g. Kaunas" className="w-full bg-[#0a120a] border border-[#1a2e18] rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowInvite(false)} className="flex-1 py-3 border border-[#1a2e18] text-white/60 rounded-xl hover:bg-white/5 text-sm">Cancel</button>
                <button onClick={() => setShowInvite(false)} className="flex-1 py-3 bg-[#1e6b1a] text-white font-semibold rounded-xl hover:bg-[#26881f] text-sm">Send Invite</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
