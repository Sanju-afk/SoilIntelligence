export default function Loading() {
  return (
    <div className="min-h-screen bg-[#040a04] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#1a2e18] border-t-[#3d8838] rounded-full animate-spin" />
        <p className="text-white/30 text-sm">Loading…</p>
      </div>
    </div>
  );
}
