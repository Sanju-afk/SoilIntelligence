"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  MapPin, Package, Calendar, CheckCircle2,
  ArrowRight, ArrowLeft, Leaf, FlaskConical, Clock,
  Info, ChevronDown, Euro
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

// ─── Data ────────────────────────────────

const PACKAGES = [
  {
    id: "starter_1ha",
    name: "Starter",
    area: "1 Hectare",
    price: 50,
    vat: 10.5,
    sampling_points: 3,
    turnaround: "48 hours",
    features: [
      "3-point soil sampling", "Full NPK + pH + EC analysis",
      "AI soil health score", "PDF diagnostic report",
      "EU compliance check", "Email delivery",
    ],
    color: "moss",
    popular: false,
  },
  {
    id: "standard_5ha",
    name: "Standard",
    area: "5 Hectares",
    price: 120,
    vat: 25.2,
    sampling_points: 7,
    turnaround: "48 hours",
    features: [
      "7-point soil sampling", "Full NPK + pH + EC + moisture",
      "AI health score + grade", "Fertiliser recommendation plan",
      "EU compliance docs", "30-min agronomist consultation",
      "Field sampling heatmap",
    ],
    color: "amber",
    popular: true,
  },
  {
    id: "professional_10ha",
    name: "Professional",
    area: "10 Hectares",
    price: 150,
    vat: 31.5,
    sampling_points: 12,
    turnaround: "48 hours",
    features: [
      "12-point soil sampling", "Full 7-parameter analysis",
      "Multi-season comparison", "Precision fertiliser optimisation",
      "Full EU Soil Monitoring report", "Crop rotation planning",
      "60-min consultation", "Priority scheduling",
    ],
    color: "sky",
    popular: false,
  },
];

const MOCK_FARMS = [
  { id: "farm-1", name: "North Field — Kazlauskas", area_ha: 5.2, district: "Kaunas", crop: "Winter Wheat" },
  { id: "farm-2", name: "East Plot — Kazlauskas",   area_ha: 9.8, district: "Kaunas", crop: "Rapeseed"     },
  { id: "farm-3", name: "South Meadow",              area_ha: 1.1, district: "Kaunas", crop: "Barley"       },
];

const STEPS = ["Package", "Farm", "Schedule"];

// ─── Components ──────────────────────────

function StepIndicator({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              i < current ? "bg-[#1e6b1a] text-white" :
              i === current ? "bg-[#3d8838] text-white ring-4 ring-[#3d8838]/20" :
              "bg-[#1a2e18] text-white/30"
            }`}>
              {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${i <= current ? "text-white/70" : "text-white/20"}`}>{label}</span>
          </div>
          {i < total - 1 && (
            <div className={`h-px w-12 sm:w-20 mx-1 mb-5 transition-all duration-500 ${i < current ? "bg-[#3d8838]" : "bg-[#1a2e18]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────

export default function NewOrderPage() {
  const [step, setStep] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<string | null>("standard_5ha");
  const [selectedFarm, setSelectedFarm] = useState<string | null>("farm-1");
  const [preferredDate, setPreferredDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  const pkg = PACKAGES.find((p) => p.id === selectedPackage);
  const farm = MOCK_FARMS.find((f) => f.id === selectedFarm);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setPlacing(false);
    setPlaced(true);
  };

  if (placed) {
    return (
      <DashboardLayout role="farmer">
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 rounded-3xl bg-[#1e6b1a]/30 border border-[#3d8838]/50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-[#6fab69]" />
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-3">Order Placed!</h1>
            <p className="text-white/60 leading-relaxed mb-2">
              Order <strong className="text-white">SI-2025-00049</strong> has been confirmed. A field technician will be assigned within 2 hours.
            </p>
            <p className="text-white/40 text-sm mb-8">You'll receive an SMS and email notification with tracking details.</p>
            <div className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-4 mb-8 text-left space-y-2">
              <div className="flex justify-between text-sm"><span className="text-white/50">Package</span><span className="text-white">{pkg?.name} {pkg?.area}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/50">Farm</span><span className="text-white">{farm?.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/50">Total (incl. VAT)</span><span className="text-[#6fab69] font-bold">€{((pkg?.price || 0) + (pkg?.vat || 0)).toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/50">Est. Report</span><span className="text-white">Within 48 hours</span></div>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard" className="flex-1 py-3 border border-[#1a2e18] hover:border-[#3d8838]/30 text-white/70 hover:text-white text-sm font-medium rounded-xl transition-all text-center">
                Go to Dashboard
              </Link>
              <Link href="/dashboard/orders" className="flex-1 py-3 bg-[#1e6b1a] hover:bg-[#26881f] text-white text-sm font-semibold rounded-xl transition-all text-center">
                Track Order
              </Link>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="farmer">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white">New Soil Test Order</h1>
          <p className="text-white/50 text-sm mt-0.5">Select a package and schedule field work at your convenience.</p>
        </div>

        <StepIndicator current={step} total={STEPS.length} labels={STEPS} />

        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {/* ── STEP 0: Package Selection ── */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-white font-semibold text-lg mb-5">Choose your service package</h2>
                <div className="grid md:grid-cols-3 gap-5">
                  {PACKAGES.map((p) => (
                    <motion.button
                      key={p.id}
                      onClick={() => setSelectedPackage(p.id)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`relative text-left p-6 rounded-2xl border-2 transition-all duration-200 ${
                        selectedPackage === p.id
                          ? "border-[#3d8838] bg-[#1e6b1a]/15 shadow-lg shadow-[#1e6b1a]/10"
                          : "border-[#1a2e18] bg-[#0d1a0c]/80 hover:border-[#3d8838]/40"
                      }`}
                    >
                      {p.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3d8838] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                          POPULAR
                        </span>
                      )}
                      {selectedPackage === p.id && (
                        <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[#3d8838] flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      <h3 className="text-white font-bold text-lg mb-0.5">{p.name}</h3>
                      <p className="text-white/40 text-sm mb-4">{p.area}</p>
                      <div className="mb-4">
                        <span className="text-3xl font-display font-bold text-white">€{p.price}</span>
                        <span className="text-white/40 text-xs ml-1.5">+ VAT</span>
                      </div>
                      <div className="flex gap-2 mb-4">
                        <span className="bg-white/5 text-white/50 text-[10px] px-2 py-1 rounded-full">{p.sampling_points} points</span>
                        <span className="bg-white/5 text-white/50 text-[10px] px-2 py-1 rounded-full">{p.turnaround}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {p.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-xs text-white/60">
                            <CheckCircle2 className="w-3 h-3 text-[#6fab69] mt-0.5 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── STEP 1: Farm Selection ── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-white font-semibold text-lg">Select the farm to test</h2>
                  <Link href="/dashboard/farms/new" className="text-sm text-[#6fab69] hover:underline flex items-center gap-1">
                    + Add new farm
                  </Link>
                </div>
                <div className="space-y-3">
                  {MOCK_FARMS.map((f) => (
                    <motion.button
                      key={f.id}
                      onClick={() => setSelectedFarm(f.id)}
                      whileHover={{ scale: 1.005 }}
                      className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${
                        selectedFarm === f.id
                          ? "border-[#3d8838] bg-[#1e6b1a]/15"
                          : "border-[#1a2e18] bg-[#0d1a0c]/80 hover:border-[#3d8838]/30"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedFarm === f.id ? "bg-[#1e6b1a]/40" : "bg-[#1a2e18]"}`}>
                        <MapPin className={`w-4 h-4 ${selectedFarm === f.id ? "text-[#6fab69]" : "text-white/30"}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{f.name}</p>
                        <p className="text-white/40 text-sm">{f.district} · {f.area_ha} ha · {f.crop}</p>
                      </div>
                      {selectedFarm === f.id && <CheckCircle2 className="w-5 h-5 text-[#6fab69]" />}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Schedule ── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-white font-semibold text-lg mb-5">Schedule your field visit</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-medium text-white/60 mb-2">Preferred Date</label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                        className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all [color-scheme:dark]"
                      />
                      <p className="text-white/30 text-xs mt-1.5 flex items-center gap-1">
                        <Info className="w-3 h-3" /> We'll schedule within 1 business day of your preference.
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/60 mb-2">Special Instructions (optional)</label>
                      <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="e.g. Gate code: 1234. Call before arrival. Dog on property."
                        rows={4}
                        className="w-full bg-[#0a120a] border border-[#1a2e18] focus:border-[#3d8838]/60 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-5">
                      <h3 className="text-white font-medium mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-[#6fab69]" /> Scheduling Process</h3>
                      <ol className="space-y-3">
                        {[
                          "Order confirmed instantly",
                          "Worker assigned within 2 hours",
                          "SMS notification with technician contact",
                          "Field visit on your preferred date",
                          "Report delivered within 48 hours",
                        ].map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                            <span className="w-5 h-5 rounded-full bg-[#1a2e18] text-[#6fab69] text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                            {s}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="bg-[#b87d12]/10 border border-[#b87d12]/20 rounded-2xl p-4 flex gap-3">
                      <Info className="w-4 h-4 text-[#edbf46] flex-shrink-0 mt-0.5" />
                      <p className="text-white/60 text-xs leading-relaxed">
                        If LoRaWAN coverage is unavailable at your location, data will be stored locally on the sensor kit and uploaded when returned.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-sm text-white/50">Confirm your preferred visit date and place the order.</p>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={!preferredDate || placing}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 bg-[#1e6b1a] hover:bg-[#26881f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#1e6b1a]/20 text-sm"
                  >
                    {placing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><Euro className="w-4 h-4" /> Confirm Order</>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#1a2e18]">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-2 text-white/50 hover:text-white/80 font-medium text-sm disabled:opacity-0 disabled:pointer-events-none transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
            {step < STEPS.length - 1 && (
              <button
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                disabled={(step === 0 && !selectedPackage) || (step === 1 && !selectedFarm)}
                className="flex items-center gap-2 bg-[#1e6b1a] hover:bg-[#26881f] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
