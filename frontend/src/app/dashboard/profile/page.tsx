"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Globe, Shield, Bell, Save, CheckCircle2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const LANGUAGES = [
  { code: "lt", label: "Lietuvių" },
  { code: "en", label: "English" },
  { code: "pl", label: "Polski" },
  { code: "ru", label: "Русский" },
];

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    firstName: "Andrius",
    lastName: "Kazlauskas",
    email: "andrius@farm.lt",
    phone: "+370 600 11111",
    language: "lt",
    notifications_email: true,
    notifications_sms: true,
    notifications_report: true,
    notifications_compliance: true,
  });

  const set = (key: keyof typeof form) => (val: string | boolean) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call PATCH /api/v1/users/me
    await new Promise((r) => setTimeout(r, 800));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout role="farmer">
      <div className="p-6 lg:p-8 space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
          <p className="text-white/50 text-sm mt-0.5">Manage your account information and preferences</p>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Avatar */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#6fab69]" /> Personal Information
            </h2>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3d8838] to-[#1e6b1a] flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-white">
                  {form.firstName[0]}{form.lastName[0]}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">{form.firstName} {form.lastName}</p>
                <p className="text-white/40 text-sm">Farmer · Active since January 2025</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "First Name", key: "firstName", icon: User },
                { label: "Last Name",  key: "lastName",  icon: User },
              ].map(({ label, key, icon: Icon }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-white/60 mb-2">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      value={form[key as keyof typeof form] as string}
                      onChange={(e) => set(key as keyof typeof form)(e.target.value)}
                      className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 pl-10 text-white text-sm outline-none transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email")(e.target.value)}
                    className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 pl-10 text-white text-sm outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    value={form.phone}
                    onChange={(e) => set("phone")(e.target.value)}
                    className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 pl-10 text-white text-sm outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-white/60 mb-2">
                <Globe className="w-3 h-3 inline mr-1" /> Interface Language
              </label>
              <div className="grid grid-cols-4 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => set("language")(lang.code)}
                    className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                      form.language === lang.code
                        ? "border-[#3d8838] bg-[#1e6b1a]/20 text-[#6fab69]"
                        : "border-[#1a2e18] text-white/40 hover:border-[#3d8838]/30"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#6fab69]" /> Notification Preferences
            </h2>
            <div className="space-y-3">
              {[
                { key: "notifications_email",      label: "Email notifications",             sub: "Order updates, worker dispatch, report delivery" },
                { key: "notifications_sms",        label: "SMS notifications",               sub: "Field technician arrival and key milestones" },
                { key: "notifications_report",     label: "Report ready alerts",             sub: "Instant notification when your PDF is generated" },
                { key: "notifications_compliance", label: "EU compliance reminders",         sub: "Deadline warnings 30 and 7 days before submission" },
              ].map(({ key, label, sub }) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-white text-sm font-medium">{label}</p>
                    <p className="text-white/40 text-xs">{sub}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set(key as keyof typeof form)(!form[key as keyof typeof form])}
                    className={`w-10 h-6 rounded-full transition-all duration-200 flex-shrink-0 relative ${
                      form[key as keyof typeof form] ? "bg-[#1e6b1a]" : "bg-[#1a2e18]"
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                      form[key as keyof typeof form] ? "left-5" : "left-1"
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Security */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#6fab69]" /> Security
            </h2>
            <button
              type="button"
              className="w-full py-3 border border-[#1a2e18] hover:border-[#3d8838]/30 text-white/60 hover:text-white text-sm font-medium rounded-xl transition-all"
            >
              Change Password
            </button>
          </motion.div>

          {/* Save */}
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#1e6b1a] hover:bg-[#26881f] text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-[#1e6b1a]/20"
          >
            {saved ? (
              <><CheckCircle2 className="w-4 h-4" /> Saved!</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
