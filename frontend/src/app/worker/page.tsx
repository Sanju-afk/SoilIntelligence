"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Package, CheckCircle2, Clock, ChevronRight,
  Navigation, Camera, AlertTriangle, Phone, ArrowRight,
  Truck, FlaskConical, Upload, Star, Wifi, Battery,
  CheckCheck
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

// ─── Task Data ───────────────────────────

const ACTIVE_TASK = {
  id: "WT-2025-00148",
  order_id: "SI-2025-00048",
  farmer: "Petras Vaitkus",
  farmer_phone: "+370 600 12345",
  farm_name: "Vaitkus West Field",
  address: "Kauno r. sav., Zapyškio sen., Zapyškyje",
  lat: 54.8985,
  lng: 23.8940,
  area_ha: 5,
  package: "Standard 5ha",
  sampling_points: 7,
  crop: "Winter Wheat",
  sensor_kit: "SK-LT-0042",
  parcel_locker: "Omniva Kaunas Mega — Locker 7",
  special_instructions: "Gate code: 4421. Call farmer before arrival. Dog on property.",
  status: "equipment_collected",
};

const TASK_STEPS = [
  { key: "accepted",            label: "Task Accepted",       icon: CheckCircle2,  done: true },
  { key: "equipment_collected", label: "Kit Collected",       icon: Package,       done: true,  active: false },
  { key: "arrived_at_farm",    label: "Arrived at Farm",     icon: MapPin,        done: false, active: true },
  { key: "sampling_started",   label: "Sampling Started",    icon: FlaskConical,  done: false },
  { key: "sampling_completed", label: "Sampling Complete",   icon: CheckCheck,    done: false },
  { key: "equipment_returned", label: "Kit Returned",        icon: Truck,         done: false },
];

const PAST_TASKS = [
  { id: "WT-2025-00141", farm: "Bražienė Organic Plot", date: "2025-06-16", status: "completed", rating: 5 },
  { id: "WT-2025-00135", farm: "Jokubaitis Farm A",     date: "2025-06-14", status: "completed", rating: 5 },
  { id: "WT-2025-00128", farm: "Šimkus North",          date: "2025-06-12", status: "completed", rating: 4 },
];

// ─── Components ──────────────────────────

function StepTracker({ steps, currentStep }: { steps: typeof TASK_STEPS; currentStep: string }) {
  return (
    <div className="relative">
      {/* Connector line */}
      <div className="absolute left-4 top-4 bottom-4 w-px bg-[#1a2e18]" />

      <div className="space-y-2">
        {steps.map((step, i) => {
          const isActive = step.key === currentStep || (step.active);
          const isDone = step.done;
          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 relative ${
                isActive ? "bg-[#1e6b1a]/20 border border-[#3d8838]/40"
                  : isDone ? "opacity-70"
                  : "opacity-40"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${
                isDone ? "bg-[#1e6b1a] border-2 border-[#3d8838]"
                  : isActive ? "bg-[#1a2e18] border-2 border-[#3d8838] animate-pulse"
                  : "bg-[#0d1a0c] border-2 border-[#1a2e18]"
              }`}>
                <step.icon className={`w-3.5 h-3.5 ${isDone ? "text-[#6fab69]" : isActive ? "text-[#6fab69]" : "text-white/30"}`} />
              </div>
              <span className={`text-sm font-medium ${isDone || isActive ? "text-white" : "text-white/40"}`}>
                {step.label}
              </span>
              {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-[#6fab69] ml-auto flex-shrink-0" />}
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#6fab69] animate-pulse flex-shrink-0" />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function SensorStatus({ kitId }: { kitId: string }) {
  const sensors = [
    { param: "N / P / K", value: "Ready", ok: true },
    { param: "pH Probe",   value: "6.8 pH", ok: true },
    { param: "EC Sensor",  value: "340 µS", ok: true },
    { param: "Moisture",   value: "31%",    ok: true },
    { param: "Temp",       value: "14.2°C", ok: true },
    { param: "LoRaWAN",    value: "Signal OK", ok: true },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium text-sm">Sensor Kit Status</h3>
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-[#6fab69]" />
          <span className="text-xs text-[#6fab69] font-medium">{kitId}</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {sensors.map((s) => (
          <div key={s.param} className={`p-2.5 rounded-xl border text-center ${s.ok ? "bg-[#1e6b1a]/10 border-[#3d8838]/20" : "bg-red-500/10 border-red-500/20"}`}>
            <p className="text-[10px] text-white/40 mb-1">{s.param}</p>
            <p className={`text-xs font-bold ${s.ok ? "text-[#6fab69]" : "text-red-400"}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SamplingPointGrid({ total, completed }: { total: number; completed: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium text-sm">Sampling Points</h3>
        <span className="text-xs text-white/40">{completed}/{total} complete</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: total }, (_, i) => i + 1).map((pt) => (
          <div
            key={pt}
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
              pt <= completed
                ? "bg-[#1e6b1a] text-white shadow-lg shadow-[#1e6b1a]/30"
                : pt === completed + 1
                ? "bg-[#1a2e18] border-2 border-[#3d8838] text-[#6fab69] animate-pulse"
                : "bg-[#0d1a0c] border border-[#1a2e18] text-white/30"
            }`}
          >
            {pt <= completed ? "✓" : pt}
          </div>
        ))}
      </div>
      <div className="mt-3 h-1.5 bg-[#1a2e18] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(completed / total) * 100}%` }}
          transition={{ duration: 0.6 }}
          className="h-full bg-gradient-to-r from-[#1e6b1a] to-[#3d8838] rounded-full"
        />
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────

export default function WorkerPanel() {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [completedPoints, setCompletedPoints] = useState(3);
  const [currentStep, setCurrentStep] = useState("arrived_at_farm");
  const [showConfirm, setShowConfirm] = useState(false);
  const [stepDone, setStepDone] = useState<Record<string, boolean>>({
    accepted: true,
    equipment_collected: true,
  });

  const nextSteps: Record<string, string> = {
    arrived_at_farm:    "sampling_started",
    sampling_started:   "sampling_completed",
    sampling_completed: "equipment_returned",
    equipment_returned: "completed",
  };

  const handleStepConfirm = () => {
    const next = nextSteps[currentStep];
    setStepDone((prev) => ({ ...prev, [currentStep]: true }));
    if (next) setCurrentStep(next);
    setShowConfirm(false);
  };

  return (
    <DashboardLayout role="worker">
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Worker Panel</h1>
            <p className="text-white/50 text-sm">Tomas Kačinskas · Verified Soil Tech ✓</p>
          </div>
          <div className="flex items-center gap-1.5 bg-[#2a88b8]/10 border border-[#2a88b8]/30 rounded-xl px-3 py-2">
            <Battery className="w-4 h-4 text-[#5aadd4]" />
            <span className="text-[#5aadd4] text-sm font-medium">Kit: 87%</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#0a120a] rounded-xl p-1 w-fit">
          {(["active", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium px-5 py-2 rounded-lg capitalize transition-all ${
                activeTab === tab ? "bg-[#1e6b1a]/40 text-[#6fab69]" : "text-white/40 hover:text-white"
              }`}
            >
              {tab === "active" ? "Active Task" : "Task History"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "active" ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid lg:grid-cols-5 gap-5"
            >
              {/* Left: Task Details */}
              <div className="lg:col-span-3 space-y-5">
                {/* Task Card */}
                <div className="bg-[#0d1a0c]/80 border border-[#3d8838]/40 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-[#6fab69]/60">{ACTIVE_TASK.id}</span>
                        <span className="bg-[#2a88b8]/20 text-[#5aadd4] text-[10px] font-bold px-2 py-0.5 rounded-full">IN PROGRESS</span>
                      </div>
                      <h2 className="text-white font-bold text-lg">{ACTIVE_TASK.farm_name}</h2>
                      <p className="text-white/50 text-sm">{ACTIVE_TASK.farmer} · {ACTIVE_TASK.package}</p>
                    </div>
                    <a
                      href={`tel:${ACTIVE_TASK.farmer_phone}`}
                      className="w-10 h-10 rounded-xl bg-[#1e6b1a]/20 hover:bg-[#1e6b1a]/40 flex items-center justify-center text-[#6fab69] transition-all"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 mb-4 bg-[#0a120a] rounded-xl p-3">
                    <MapPin className="w-4 h-4 text-[#6fab69] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white/80 text-sm">{ACTIVE_TASK.address}</p>
                      <p className="text-white/40 text-xs mt-0.5">
                        {ACTIVE_TASK.lat.toFixed(4)}°N, {ACTIVE_TASK.lng.toFixed(4)}°E
                      </p>
                    </div>
                    <a
                      href={`https://maps.google.com/?q=${ACTIVE_TASK.lat},${ACTIVE_TASK.lng}`}
                      target="_blank"
                      className="ml-auto flex items-center gap-1 text-xs text-[#5aadd4] hover:text-[#5aadd4]/80 font-medium"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Navigate
                    </a>
                  </div>

                  {/* Special Instructions */}
                  {ACTIVE_TASK.special_instructions && (
                    <div className="bg-[#b87d12]/10 border border-[#b87d12]/20 rounded-xl p-3 flex gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#edbf46] flex-shrink-0 mt-0.5" />
                      <p className="text-[#edbf46]/80 text-xs leading-relaxed">{ACTIVE_TASK.special_instructions}</p>
                    </div>
                  )}

                  {/* Task Meta */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {[
                      { label: "Area", value: `${ACTIVE_TASK.area_ha} ha` },
                      { label: "Sample Points", value: ACTIVE_TASK.sampling_points },
                      { label: "Primary Crop", value: ACTIVE_TASK.crop },
                    ].map((m) => (
                      <div key={m.label} className="bg-[#0a120a] rounded-xl p-3 text-center">
                        <p className="text-[10px] text-white/40 mb-1">{m.label}</p>
                        <p className="text-sm font-bold text-white">{m.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sensor Status */}
                <div className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-5">
                  <SensorStatus kitId={ACTIVE_TASK.sensor_kit} />
                </div>

                {/* Sampling Progress */}
                <div className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-5">
                  <SamplingPointGrid
                    total={ACTIVE_TASK.sampling_points}
                    completed={completedPoints}
                  />
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setCompletedPoints((p) => Math.min(p + 1, ACTIVE_TASK.sampling_points))}
                      disabled={completedPoints >= ACTIVE_TASK.sampling_points}
                      className="flex-1 py-2.5 bg-[#1e6b1a] hover:bg-[#26881f] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all"
                    >
                      Mark Point {completedPoints + 1} Complete
                    </button>
                    <button className="w-10 h-10 bg-[#1a2e18] hover:bg-[#243d24] text-white/60 rounded-xl flex items-center justify-center transition-all">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Step Tracker + Action */}
              <div className="lg:col-span-2 space-y-5">
                {/* Step Flow */}
                <div className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-5">
                  <h3 className="text-white font-semibold mb-4">Task Progress</h3>
                  <StepTracker
                    steps={TASK_STEPS.map((s) => ({
                      ...s,
                      done: stepDone[s.key] || s.done,
                      active: s.key === currentStep,
                    }))}
                    currentStep={currentStep}
                  />
                </div>

                {/* Confirm Step Button */}
                <div className="bg-[#0d1a0c]/80 border border-[#3d8838]/40 rounded-2xl p-5">
                  <h3 className="text-white font-semibold mb-2">Current Action</h3>
                  <p className="text-white/50 text-sm mb-4">
                    {currentStep === "arrived_at_farm" && "Confirm your arrival at the farm location. Your GPS will be recorded."}
                    {currentStep === "sampling_started" && "Confirm you have started soil sampling at the first GPS point."}
                    {currentStep === "sampling_completed" && "Confirm all sampling points are complete and data is uploading."}
                    {currentStep === "equipment_returned" && "Confirm sensor kit has been returned to the designated Omniva locker."}
                  </p>
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1e6b1a] hover:bg-[#26881f] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#1e6b1a]/20 hover:scale-[1.02]"
                  >
                    Confirm Step <ArrowRight className="w-4 h-4" />
                  </button>

                  <button className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border border-[#b87d12]/30 hover:border-[#b87d12]/60 text-[#edbf46]/70 hover:text-[#edbf46] text-sm font-medium rounded-xl transition-all">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Report Issue
                  </button>
                </div>

                {/* Upload Data */}
                {currentStep === "sampling_completed" && (
                  <div className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-5">
                    <h3 className="text-white font-semibold mb-3">Data Upload</h3>
                    <div className="space-y-2">
                      {[
                        { label: "Sensor readings", status: "uploading", pct: 78 },
                        { label: "GPS coordinates", status: "done" },
                        { label: "Photos (3)",       status: "done" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3">
                          {item.status === "done"
                            ? <CheckCircle2 className="w-4 h-4 text-[#6fab69] flex-shrink-0" />
                            : <Upload className="w-4 h-4 text-[#5aadd4] flex-shrink-0 animate-bounce" />
                          }
                          <span className="text-sm text-white/70 flex-1">{item.label}</span>
                          {item.status === "uploading" && (
                            <span className="text-xs text-[#5aadd4]">{item.pct}%</span>
                          )}
                          {item.status === "done" && (
                            <span className="text-xs text-[#6fab69]">Done</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {PAST_TASKS.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-5 flex items-center gap-4 hover:border-[#3d8838]/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1e6b1a]/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-[#6fab69]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{task.farm}</p>
                    <p className="text-white/40 text-xs">{task.id} · {task.date}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: task.rating }).map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-[#edbf46] text-[#edbf46]" />
                    ))}
                  </div>
                  <span className="text-xs text-[#6fab69] bg-[#1e6b1a]/20 px-2.5 py-1 rounded-full font-medium">
                    Completed
                  </span>
                </motion.div>
              ))}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-2">
                {[
                  { label: "Total Tasks", value: "47" },
                  { label: "Avg Rating", value: "4.9 ★" },
                  { label: "This Month", value: "12" },
                ].map((s) => (
                  <div key={s.label} className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-white/40 text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirm Modal */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            >
              <motion.div
                initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                className="bg-[#0d1a0c] border border-[#3d8838]/50 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
              >
                <h3 className="text-white font-bold text-lg mb-2">Confirm Step</h3>
                <p className="text-white/60 text-sm mb-6">
                  This action will update your task status and notify the Soil Intelligence platform. Your GPS coordinates will be recorded.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-3 border border-white/10 text-white/60 font-medium rounded-xl hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStepConfirm}
                    className="flex-1 py-3 bg-[#1e6b1a] text-white font-semibold rounded-xl hover:bg-[#26881f] transition-all"
                  >
                    Confirm ✓
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
