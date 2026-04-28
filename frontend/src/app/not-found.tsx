import Link from "next/link";
import { Leaf } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#040a04] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#3d8838] to-[#1e6b1a] flex items-center justify-center mb-6">
        <Leaf className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-6xl font-display font-bold text-white mb-2">404</h1>
      <p className="text-white/50 text-lg mb-8">
        This page doesn&apos;t exist — just like soil without data.
      </p>
      <Link
        href="/"
        className="bg-[#1e6b1a] hover:bg-[#26881f] text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-[#1e6b1a]/20"
      >
        Back to Home
      </Link>
    </div>
  );
}
