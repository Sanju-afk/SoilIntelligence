"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Filter, MoreHorizontal, UserCheck, Mail, Phone, MapPin, ChevronDown } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const USERS = [
  { id: "u1", name: "Andrius Kazlauskas",  email: "andrius@farm.lt",    phone: "+370 600 11111", role: "farmer",  district: "Kaunas",    farms: 3, orders: 7, last_active: "2025-06-17", status: "active",   spend: 714.6 },
  { id: "u2", name: "Laima Bražienė",      email: "laima@organic.lt",   phone: "+370 600 22222", role: "farmer",  district: "Panevėžys", farms: 1, orders: 3, last_active: "2025-06-16", status: "active",   spend: 362.1 },
  { id: "u3", name: "Tomas Kačinskas",     email: "tomas@worker.lt",    phone: "+370 600 33333", role: "worker",  district: "Kaunas",    farms: 0, orders: 0, last_active: "2025-06-17", status: "active",   spend: 0 },
  { id: "u4", name: "Vytautas Šimkus",     email: "vytautas@farm.lt",   phone: "+370 600 44444", role: "farmer",  district: "Šiauliai",  farms: 2, orders: 2, last_active: "2025-06-10", status: "active",   spend: 181.5 },
  { id: "u5", name: "Dr. Rimas Paulauskas",email: "rimas@agro.lt",      phone: "+370 600 55555", role: "agronomist", district: "Vilnius", farms: 0, orders: 0, last_active: "2025-06-15", status: "active", spend: 0 },
  { id: "u6", name: "Irena Kazlauskienė",  email: "irena@kazlausk.lt",  phone: "+370 600 66666", role: "farmer",  district: "Kaunas",    farms: 1, orders: 4, last_active: "2025-05-30", status: "inactive", spend: 483.6 },
];

const ROLE_COLORS: Record<string, string> = {
  farmer:     "bg-[#1e6b1a]/20 text-[#6fab69]",
  worker:     "bg-[#2a88b8]/20 text-[#5aadd4]",
  agronomist: "bg-purple-500/20 text-purple-400",
  admin:      "bg-[#b87d12]/20 text-[#edbf46]",
  super_admin:"bg-red-500/20 text-red-400",
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = USERS.filter((u) =>
    (roleFilter === "all" || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout role="admin">
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-white/50 text-sm mt-0.5">{USERS.length} total users · {USERS.filter(u => u.status === "active").length} active</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className="w-full bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/20 text-sm outline-none focus:border-[#3d8838]/60 transition-all" />
          </div>
          <div className="flex gap-1 bg-[#0a120a] rounded-xl p-1">
            {["all", "farmer", "worker", "agronomist"].map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)} className={`text-xs font-medium px-3 py-1.5 rounded-lg capitalize transition-all ${roleFilter === r ? "bg-[#1e6b1a]/40 text-[#6fab69]" : "text-white/40 hover:text-white/70"}`}>{r}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl overflow-hidden">
          <div className="hidden lg:grid grid-cols-7 gap-4 px-6 py-3 border-b border-[#1a2e18] text-xs text-white/30 font-medium uppercase tracking-wider">
            <span className="col-span-2">User</span>
            <span>Role</span>
            <span>District</span>
            <span>Activity</span>
            <span>Total Spend</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-[#1a2e18]">
            {filtered.map((user, i) => (
              <motion.div key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="grid grid-cols-1 lg:grid-cols-7 gap-3 items-center px-6 py-4 hover:bg-white/[0.02] transition-colors group">
                <div className="lg:col-span-2 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3d8838] to-[#1e6b1a] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">{user.name.split(" ").map(n => n[0]).join("").slice(0,2)}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{user.name}</p>
                    <p className="text-white/40 text-xs flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</p>
                  </div>
                </div>
                <div><span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${ROLE_COLORS[user.role] || "bg-white/5 text-white/40"}`}>{user.role}</span></div>
                <div className="text-white/60 text-sm flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{user.district}</div>
                <div>
                  <p className="text-white/60 text-xs">{user.last_active}</p>
                  {user.farms > 0 && <p className="text-white/30 text-[10px]">{user.farms} farms · {user.orders} orders</p>}
                </div>
                <div className="font-data font-bold text-white/80 text-sm">{user.spend > 0 ? `€${user.spend.toFixed(2)}` : "—"}</div>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${user.status === "active" ? "bg-[#6fab69]" : "bg-white/20"}`} />
                  <button className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white transition-all">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
