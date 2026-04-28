"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Plus, Leaf, FlaskConical, ChevronRight, Edit2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const FARMS = [
  { id: "farm-1", name: "North Field — Kazlauskas", area_ha: 5.2, district: "Kaunas r.", municipality: "Zapyškis", crop: "Winter Wheat", soil_type: "Clay Loam", organic: false, cadastral: "5244/0012:0456", lat: 54.8985, lng: 23.8940, tests_count: 3, last_test: "2025-06-15", health_score: 82, grade: "A" },
  { id: "farm-2", name: "East Plot",                area_ha: 9.8, district: "Kaunas r.", municipality: "Garliava",  crop: "Rapeseed",     soil_type: "Sandy Loam", organic: false, cadastral: "5244/0018:0112", lat: 54.8720, lng: 23.9210, tests_count: 2, last_test: "2025-04-10", health_score: 74, grade: "B" },
  { id: "farm-3", name: "South Meadow",             area_ha: 1.1, district: "Kaunas r.", municipality: "Zapyškis", crop: "Organic Herbs", soil_type: "Loam",      organic: true,  cadastral: "5244/0012:0789", lat: 54.8860, lng: 23.8850, tests_count: 1, last_test: "2025-05-22", health_score: 69, grade: "B" },
];

export default function FarmsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <DashboardLayout role="farmer">
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">My Farms</h1>
            <p className="text-white/50 text-sm mt-0.5">{FARMS.length} farms registered · {FARMS.reduce((s, f) => s + f.area_ha, 0).toFixed(1)} ha total</p>
          </div>
          <Link href="/dashboard/farms/new" className="flex items-center gap-2 bg-[#1e6b1a] hover:bg-[#26881f] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-[#1e6b1a]/20">
            <Plus className="w-4 h-4" /> Add Farm
          </Link>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {FARMS.map((farm, i) => {
            const gradeColor = farm.grade === "A" ? "#3d8838" : farm.grade === "B" ? "#b87d12" : "#ef4444";
            return (
              <motion.div
                key={farm.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-[#0d1a0c]/80 border border-[#1a2e18] hover:border-[#3d8838]/40 rounded-2xl overflow-hidden transition-all duration-300 group"
              >
                {/* Map preview placeholder */}
                <div className="h-32 bg-gradient-to-br from-[#0f1e0d] to-[#071409] relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(61,136,56,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(61,136,56,0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                  <div className="relative flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#3d8838]/30 border-2 border-[#3d8838] flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-[#6fab69]" />
                    </div>
                    <span className="text-white/30 text-xs font-mono">{farm.lat.toFixed(4)}°N, {farm.lng.toFixed(4)}°E</span>
                  </div>
                  {farm.organic && (
                    <div className="absolute top-3 right-3 bg-[#1e6b1a]/80 border border-[#3d8838]/50 rounded-full px-2.5 py-1 flex items-center gap-1">
                      <Leaf className="w-3 h-3 text-[#6fab69]" />
                      <span className="text-[#6fab69] text-[10px] font-bold">Organic</span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{farm.name}</h3>
                      <p className="text-white/40 text-xs mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {farm.municipality}, {farm.district}
                      </p>
                    </div>
                    {farm.health_score && (
                      <div className="text-right">
                        <span className="text-xl font-display font-bold" style={{ color: gradeColor }}>Grade {farm.grade}</span>
                        <p className="text-white/30 text-[10px]">Latest score: {farm.health_score}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { label: "Area", value: `${farm.area_ha} ha` },
                      { label: "Crop", value: farm.crop },
                      { label: "Soil Type", value: farm.soil_type },
                      { label: "Tests", value: `${farm.tests_count} tests` },
                    ].map((m) => (
                      <div key={m.label} className="bg-[#0a120a] rounded-xl p-2.5">
                        <p className="text-[10px] text-white/30">{m.label}</p>
                        <p className="text-sm text-white/80 font-medium">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/orders/new?farm=${farm.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#1e6b1a]/20 hover:bg-[#1e6b1a]/40 text-[#6fab69] text-xs font-semibold rounded-xl transition-all"
                    >
                      <FlaskConical className="w-3.5 h-3.5" /> Order Test
                    </Link>
                    <Link href={`/dashboard/farms/${farm.id}`} className="w-9 h-9 flex items-center justify-center bg-[#1a2e18] hover:bg-[#243d24] text-white/50 hover:text-white rounded-xl transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    <button className="w-9 h-9 flex items-center justify-center bg-[#1a2e18] hover:bg-[#243d24] text-white/50 hover:text-white rounded-xl transition-all">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Add Farm Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: FARMS.length * 0.08 }}>
            <Link href="/dashboard/farms/new" className="flex flex-col items-center justify-center h-full min-h-[280px] border-2 border-dashed border-[#1a2e18] hover:border-[#3d8838]/40 rounded-2xl transition-all group text-center p-8">
              <div className="w-12 h-12 rounded-2xl bg-[#1a2e18] group-hover:bg-[#1e6b1a]/20 flex items-center justify-center mb-3 transition-all">
                <Plus className="w-5 h-5 text-white/30 group-hover:text-[#6fab69] transition-colors" />
              </div>
              <p className="text-white/40 group-hover:text-white/70 font-medium transition-colors">Add New Farm</p>
              <p className="text-white/20 text-xs mt-1">Register a new field for soil testing</p>
            </Link>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
