"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Video, Phone, Mail, Calendar, Clock, CheckCircle2, Plus, Star } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const CONSULTATIONS = [
  { id: "con-1", type: "video", agronomist: "Dr. Rimas Paulauskas", date: "2025-06-20", time: "14:00", duration: 30, status: "scheduled", topic: "Phosphorus correction strategy for North Field", meeting_url: "https://meet.google.com/abc-defg-hij" },
  { id: "con-2", type: "phone", agronomist: "Jolita Vaičiūtė",     date: "2025-05-28", time: "10:00", duration: 30, status: "completed",  topic: "Spring barley rotation planning" },
  { id: "con-3", type: "video", agronomist: "Dr. Rimas Paulauskas", date: "2025-04-15", time: "15:30", duration: 60, status: "completed",  topic: "Full farm agronomic consultation" },
];

const TYPE_CFG = { video: { icon: Video, color: "text-[#5aadd4]", bg: "bg-[#2a88b8]/15" }, phone: { icon: Phone, color: "text-[#6fab69]", bg: "bg-[#1e6b1a]/15" }, email: { icon: Mail, color: "text-purple-400", bg: "bg-purple-500/10" } };
const STATUS_CFG = { scheduled: { label: "Scheduled", color: "text-[#5aadd4]", bg: "bg-[#2a88b8]/15" }, completed: { label: "Completed", color: "text-[#6fab69]", bg: "bg-[#1e6b1a]/15" }, cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-500/10" } };

export default function ConsultationsPage() {
  const [showBooking, setShowBooking] = useState(false);
  const [bookType, setBookType] = useState("video");
  const [bookDate, setBookDate] = useState("");

  return (
    <DashboardLayout role="farmer">
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Consultations</h1>
            <p className="text-white/50 text-sm mt-0.5">Book expert agronomist sessions included with your service package</p>
          </div>
          <button
            onClick={() => setShowBooking(true)}
            className="flex items-center gap-2 bg-[#1e6b1a] hover:bg-[#26881f] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-[#1e6b1a]/20"
          >
            <Plus className="w-4 h-4" /> Book Session
          </button>
        </div>

        {/* Available Credits */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Consultations Remaining", value: "2", sub: "From Standard & Professional packages", color: "text-[#6fab69]" },
            { label: "Total Sessions Completed", value: "3", sub: "All time", color: "text-white" },
          ].map((s) => (
            <div key={s.label} className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-white/60 text-sm font-medium mt-0.5">{s.label}</p>
              <p className="text-white/30 text-xs mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Consultation List */}
        <div className="space-y-3">
          {CONSULTATIONS.map((con, i) => {
            const typeCfg = TYPE_CFG[con.type as keyof typeof TYPE_CFG];
            const statusCfg = STATUS_CFG[con.status as keyof typeof STATUS_CFG];
            return (
              <motion.div
                key={con.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-[#0d1a0c]/80 border border-[#1a2e18] hover:border-[#3d8838]/30 rounded-2xl p-5 flex items-start gap-4 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeCfg.bg}`}>
                  <typeCfg.icon className={`w-4 h-4 ${typeCfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-medium">{con.topic}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>{statusCfg.label}</span>
                  </div>
                  <p className="text-white/50 text-sm mt-0.5">{con.agronomist} · {con.duration} min {con.type}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {con.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {con.time}</span>
                  </div>
                </div>
                {con.status === "scheduled" && con.meeting_url && (
                  <a href={con.meeting_url} target="_blank" className="flex items-center gap-1.5 bg-[#2a88b8]/20 hover:bg-[#2a88b8]/30 text-[#5aadd4] text-xs font-semibold px-3 py-2 rounded-xl transition-all whitespace-nowrap">
                    <Video className="w-3.5 h-3.5" /> Join Call
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Booking Modal */}
        {showBooking && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0d1a0c] border border-[#3d8838]/40 rounded-3xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-white font-bold text-lg mb-5">Book a Consultation</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-white/50 mb-2">Session Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ id: "video", label: "Video Call", icon: Video }, { id: "phone", label: "Phone", icon: Phone }, { id: "email", label: "Email", icon: Mail }].map((t) => (
                      <button key={t.id} onClick={() => setBookType(t.id)} className={`p-3 rounded-xl border text-center transition-all ${bookType === t.id ? "border-[#3d8838] bg-[#1e6b1a]/20 text-[#6fab69]" : "border-[#1a2e18] text-white/40 hover:border-[#3d8838]/30"}`}>
                        <t.icon className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-xs font-medium">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2">Preferred Date</label>
                  <input type="date" value={bookDate} onChange={(e) => setBookDate(e.target.value)} className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 text-white text-sm outline-none [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2">Topic / Notes</label>
                  <textarea rows={3} placeholder="What would you like to discuss?" className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowBooking(false)} className="flex-1 py-3 border border-[#1a2e18] text-white/60 rounded-xl hover:bg-white/5 transition-all text-sm">Cancel</button>
                <button onClick={() => setShowBooking(false)} className="flex-1 py-3 bg-[#1e6b1a] text-white font-semibold rounded-xl hover:bg-[#26881f] transition-all text-sm">Book Session</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
