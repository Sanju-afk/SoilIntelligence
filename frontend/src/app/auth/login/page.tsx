"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Leaf, ArrowRight, CheckCircle2, Mail, Lock, User, Phone } from "lucide-react";

function AuthCard({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen bg-[#040a04] flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#1e6b1a]/15 blur-[80px] rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#3d8838] to-[#1e6b1a] flex items-center justify-center shadow-lg shadow-[#1e6b1a]/30">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white">
            Soil<span className="text-[#6fab69]">Intelligence</span>
          </span>
        </div>

        <div className="bg-[#0d1a0c]/80 backdrop-blur-xl border border-[#1a2e18] rounded-3xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
          <p className="text-white/50 text-sm mb-7">{subtitle}</p>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function InputField({
  label, type = "text", placeholder, icon: Icon, value, onChange, showToggle, onToggle
}: {
  label: string; type?: string; placeholder: string; icon: React.ElementType;
  value: string; onChange: (v: string) => void; showToggle?: boolean; onToggle?: () => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/60 mb-2">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 pl-10 text-white placeholder-white/20 text-sm outline-none transition-all focus:bg-[#0d1a0d] focus:ring-1 focus:ring-[#3d8838]/30"
        />
        {showToggle && (
          <button onClick={onToggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
            {type === "password" ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    window.location.href = "/dashboard";
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your Soil Intelligence account">
      <form onSubmit={handleLogin} className="space-y-4">
        <InputField label="Email address" type="email" placeholder="farmer@example.lt" icon={Mail} value={email} onChange={setEmail} />
        <InputField label="Password" type={showPw ? "text" : "password"} placeholder="Your password" icon={Lock} value={password} onChange={setPassword} showToggle onToggle={() => setShowPw(!showPw)} />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="w-4 h-4 rounded border border-[#1a2e18] bg-[#0a120a]" />
            <span className="text-xs text-white/50">Remember me</span>
          </label>
          <Link href="/auth/forgot-password" className="text-xs text-[#6fab69] hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1e6b1a] hover:bg-[#26881f] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#1e6b1a]/20 mt-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Sign In <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-white/40 mt-6">
        Don't have an account?{" "}
        <Link href="/auth/register" className="text-[#6fab69] font-medium hover:underline">
          Create one free
        </Link>
      </p>

      <div className="mt-6 pt-6 border-t border-[#1a2e18]">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/admin" className="text-center py-2.5 border border-[#b87d12]/20 hover:border-[#b87d12]/40 text-[#edbf46]/60 hover:text-[#edbf46] text-xs font-medium rounded-xl transition-all">
            Admin Portal →
          </Link>
          <Link href="/worker" className="text-center py-2.5 border border-[#2a88b8]/20 hover:border-[#2a88b8]/40 text-[#5aadd4]/60 hover:text-[#5aadd4] text-xs font-medium rounded-xl transition-all">
            Worker Panel →
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}

export function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "",
    farmName: "", district: "", areaHa: "", primaryCrop: "",
  });
  const [showPw, setShowPw] = useState(false);

  const set = (key: keyof typeof form) => (val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    window.location.href = "/dashboard";
  };

  const CROPS = ["Winter Wheat", "Rapeseed", "Spring Barley", "Potato", "Sugar Beet", "Maize", "Rye", "Mixed"];
  const DISTRICTS = ["Vilnius", "Kaunas", "Klaipėda", "Šiauliai", "Panevėžys", "Alytus", "Marijampolė", "Telšiai", "Utena", "Tauragė"];

  return (
    <AuthCard title={step === 1 ? "Create your account" : "Tell us about your farm"} subtitle={step === 1 ? "Join 200+ Lithuanian farmers on Soil Intelligence" : "Step 2 of 2 — Farm details for your profile"}>
      {/* Step indicator */}
      <div className="flex gap-2 mb-7">
        {[1, 2].map((s) => (
          <div key={s} className={`h-1 rounded-full flex-1 transition-all duration-300 ${s <= step ? "bg-[#3d8838]" : "bg-[#1a2e18]"}`} />
        ))}
      </div>

      <form onSubmit={handleNext} className="space-y-4">
        {step === 1 ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="First Name" placeholder="Andrius" icon={User} value={form.firstName} onChange={set("firstName")} />
              <InputField label="Last Name" placeholder="Kazlauskas" icon={User} value={form.lastName} onChange={set("lastName")} />
            </div>
            <InputField label="Email address" type="email" placeholder="andrius@farm.lt" icon={Mail} value={form.email} onChange={set("email")} />
            <InputField label="Phone number" placeholder="+370 600 00000" icon={Phone} value={form.phone} onChange={set("phone")} />
            <InputField label="Password" type={showPw ? "text" : "password"} placeholder="Min. 8 characters" icon={Lock} value={form.password} onChange={set("password")} showToggle onToggle={() => setShowPw(!showPw)} />
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">Farm Name</label>
              <input
                placeholder="e.g. Kazlauskas North Field"
                value={form.farmName} onChange={(e) => set("farmName")(e.target.value)}
                className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2">District</label>
                <select value={form.district} onChange={(e) => set("district")(e.target.value)}
                  className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all appearance-none">
                  <option value="">Select district</option>
                  {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2">Farm Size (ha)</label>
                <input type="number" placeholder="5.0" value={form.areaHa} onChange={(e) => set("areaHa")(e.target.value)}
                  className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">Primary Crop</label>
              <select value={form.primaryCrop} onChange={(e) => set("primaryCrop")(e.target.value)}
                className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all appearance-none">
                <option value="">Select crop</option>
                {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="bg-[#0a120a] border border-[#1a2e18] rounded-xl p-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6fab69] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-white/50 leading-relaxed">
                  By creating an account, you agree to our Terms of Service and Privacy Policy. Your farm data is encrypted and never shared with third parties.
                </p>
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1e6b1a] hover:bg-[#26881f] disabled:opacity-60 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#1e6b1a]/20"
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

      {step === 1 && (
        <p className="text-center text-sm text-white/40 mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#6fab69] font-medium hover:underline">Sign in</Link>
        </p>
      )}
      {step === 2 && (
        <button onClick={() => setStep(1)} className="w-full text-center text-sm text-white/40 hover:text-white/60 mt-4 transition-colors">
          ← Back to step 1
        </button>
      )}
    </AuthCard>
  );
}

export default LoginPage;
