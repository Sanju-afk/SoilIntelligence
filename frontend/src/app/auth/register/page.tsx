"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Leaf, ArrowRight, CheckCircle2, Mail, Lock, User, Phone } from "lucide-react";

const CROPS = [
  "Winter Wheat", "Rapeseed", "Spring Barley",
  "Potato", "Sugar Beet", "Maize", "Rye", "Mixed"
];
const DISTRICTS = [
  "Vilnius", "Kaunas", "Klaipėda", "Šiauliai",
  "Panevėžys", "Alytus", "Marijampolė", "Telšiai", "Utena", "Tauragė"
];

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#040a04] flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#1e6b1a]/15 blur-[80px] rounded-full" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#3d8838] to-[#1e6b1a] flex items-center justify-center shadow-lg">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white">
            Soil<span className="text-[#6fab69]">Intelligence</span>
          </span>
        </div>
        <div className="bg-[#0d1a0c]/80 backdrop-blur-xl border border-[#1a2e18] rounded-3xl p-8 shadow-2xl">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    phone: "", password: "",
    farmName: "", district: "", areaHa: "", primaryCrop: "",
  });

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setLoading(true);
    // TODO: call POST /api/v1/auth/register then POST /api/v1/farms/
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    window.location.href = "/dashboard";
  };

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold text-white mb-1">
        {step === 1 ? "Create your account" : "Your farm details"}
      </h1>
      <p className="text-white/50 text-sm mb-5">
        {step === 1
          ? "Join 200+ Lithuanian farmers on Soil Intelligence"
          : "Step 2 of 2 — used to personalise your soil reports"}
      </p>

      {/* Step progress */}
      <div className="flex gap-2 mb-7">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              s <= step ? "bg-[#3d8838]" : "bg-[#1a2e18]"
            }`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "First Name", key: "firstName", placeholder: "Andrius", icon: User },
                { label: "Last Name",  key: "lastName",  placeholder: "K.",       icon: User },
              ].map(({ label, key, placeholder, icon: Icon }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-white/60 mb-2">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      required
                      placeholder={placeholder}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => set(key as keyof typeof form)(e.target.value)}
                      className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 pl-10 text-white placeholder-white/20 text-sm outline-none transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  required type="email"
                  placeholder="andrius@farm.lt"
                  value={form.email}
                  onChange={(e) => set("email")(e.target.value)}
                  className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 pl-10 text-white placeholder-white/20 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  placeholder="+370 600 00000"
                  value={form.phone}
                  onChange={(e) => set("phone")(e.target.value)}
                  className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 pl-10 text-white placeholder-white/20 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  required
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => set("password")(e.target.value)}
                  className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 pl-10 pr-10 text-white placeholder-white/20 text-sm outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">Farm Name</label>
              <input
                required
                placeholder="e.g. Kazlauskas North Field"
                value={form.farmName}
                onChange={(e) => set("farmName")(e.target.value)}
                className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2">District</label>
                <select
                  value={form.district}
                  onChange={(e) => set("district")(e.target.value)}
                  className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all appearance-none"
                >
                  <option value="">Select…</option>
                  {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2">Area (ha)</label>
                <input
                  type="number" min="0.1" step="0.1"
                  placeholder="5.0"
                  value={form.areaHa}
                  onChange={(e) => set("areaHa")(e.target.value)}
                  className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">Primary Crop</label>
              <select
                value={form.primaryCrop}
                onChange={(e) => set("primaryCrop")(e.target.value)}
                className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all appearance-none"
              >
                <option value="">Select crop…</option>
                {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="bg-[#0a120a] border border-[#1a2e18] rounded-xl p-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6fab69] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-white/50 leading-relaxed">
                  By creating an account you agree to our Terms of Service and Privacy Policy.
                  Farm data is encrypted and never shared with third parties.
                </p>
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1e6b1a] hover:bg-[#26881f] disabled:opacity-60 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#1e6b1a]/20 mt-1"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : step === 1 ? (
            <>Continue <ArrowRight className="w-4 h-4" /></>
          ) : (
            <>Create Account <CheckCircle2 className="w-4 h-4" /></>
          )}
        </button>
      </form>

      {step === 1 ? (
        <p className="text-center text-sm text-white/40 mt-5">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#6fab69] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      ) : (
        <button
          onClick={() => setStep(1)}
          className="w-full text-center text-sm text-white/40 hover:text-white/60 mt-4 transition-colors"
        >
          ← Back to step 1
        </button>
      )}
    </AuthShell>
  );
}
