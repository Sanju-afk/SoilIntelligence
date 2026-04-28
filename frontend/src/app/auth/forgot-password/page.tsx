"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Leaf, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: POST /api/v1/auth/forgot-password
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

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
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1e6b1a]/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-[#6fab69]" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Check your email</h1>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                If an account exists for <strong className="text-white/70">{email}</strong>,
                a password reset link has been sent. Check your spam folder if you don&apos;t see it.
              </p>
              <Link
                href="/auth/login"
                className="text-[#6fab69] text-sm font-medium hover:underline"
              >
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
              </Link>

              <h1 className="text-2xl font-bold text-white mb-1">Reset your password</h1>
              <p className="text-white/50 text-sm mb-7">
                Enter your email and we&apos;ll send a secure reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                      className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 pl-10 text-white placeholder-white/20 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1e6b1a] hover:bg-[#26881f] disabled:opacity-60 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#1e6b1a]/20"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
