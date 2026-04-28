"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Leaf, ArrowRight, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // TODO: replace with real API call to POST /api/v1/auth/login
      await new Promise((r) => setTimeout(r, 1200));
      window.location.href = "/dashboard";
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040a04] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#1e6b1a]/15 blur-[80px] rounded-full" />
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
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-white/50 text-sm mb-7">Sign in to your Soil Intelligence account</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  required
                  type="email"
                  placeholder="farmer@example.lt"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 pl-10 text-white placeholder-white/20 text-sm outline-none transition-all focus:bg-[#0d1a0d]"
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
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 pl-10 pr-10 text-white placeholder-white/20 text-sm outline-none transition-all focus:bg-[#0d1a0d]"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-xs text-[#6fab69] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1e6b1a] hover:bg-[#26881f] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#1e6b1a]/20"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-[#6fab69] font-medium hover:underline">
              Create one free
            </Link>
          </p>

          <div className="mt-6 pt-6 border-t border-[#1a2e18] grid grid-cols-2 gap-3">
            <Link
              href="/admin"
              className="text-center py-2.5 border border-[#b87d12]/20 hover:border-[#b87d12]/40 text-[#edbf46]/60 hover:text-[#edbf46] text-xs font-medium rounded-xl transition-all"
            >
              Admin Portal →
            </Link>
            <Link
              href="/worker"
              className="text-center py-2.5 border border-[#2a88b8]/20 hover:border-[#2a88b8]/40 text-[#5aadd4]/60 hover:text-[#5aadd4] text-xs font-medium rounded-xl transition-all"
            >
              Worker Panel →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
