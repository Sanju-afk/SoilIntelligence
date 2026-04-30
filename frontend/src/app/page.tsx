"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Leaf, BarChart3, Shield,
  MapPin, ChevronDown, Star, Cpu, Zap, Globe,
  FlaskConical, TrendingDown, Award, Play
} from "lucide-react";

// ─────────────────────────────────────────
// Data
// ─────────────────────────────────────────

const PRICING_PLANS = [
  {
    id: "starter",
    name: "Starter",
    subtitle: "1 Hectare",
    price: 50,
    vat: true,
    color: "moss",
    sampling_points: 3,
    turnaround: "3 days",
    features: [
      "3-point soil sampling",
      "Full NPK + pH + EC analysis",
      "AI-generated soil health score",
      "PDF diagnostic report",
      "EU compliance status check",
      "Email delivery",
    ],
    cta: "Order Starter",
    popular: false,
  },
  {
    id: "standard",
    name: "Standard",
    subtitle: "5 Hectares",
    price: 100,
    vat: true,
    color: "amber",
    sampling_points: 7,
    turnaround: "3 days",
    features: [
      "7-point soil sampling",
      "Full NPK + pH + EC + moisture analysis",
      "AI soil health score + grade",
      "Fertiliser recommendation plan",
      "Crop suitability report",
      "EU compliance documentation",
      "30-min agronomist consultation",
      "Field sampling heatmap",
    ],
    cta: "Order Standard",
    popular: true,
  },
  {
    id: "professional",
    name: "Professional",
    subtitle: "10 Hectares",
    price: 150,
    vat: true,
    color: "sky",
    sampling_points: 12,
    turnaround: "3 days",
    features: [
      "12-point soil sampling",
      "Full 7-parameter sensor analysis",
      "Multi-season trend comparison",
      "Precision fertiliser cost optimisation",
      "Complete EU Soil Monitoring Law report",
      "Crop rotation planning",
      "60-min agronomist consultation",
      "Geospatial soil heatmap",
      "Priority field scheduling",
    ],
    cta: "Order Professional",
    popular: false,
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Order Online",
    description:
      "Select your package, enter your farm GPS coordinates, and pay securely via Stripe or BankLink. Takes 3 minutes.",
    icon: "🌐",
  },
  {
    step: "02",
    title: "Worker Dispatched",
    description:
      "Our system auto-posts a geo-tagged task on WORKIS. A verified Soil Tech collects a pre-packaged sensor kit from a nearby Omniva locker.",
    icon: "🚗",
  },
  {
    step: "03",
    title: "Field Sampling",
    description:
      "The contractor deploys 7-in-1 LoRaWAN sensors at your GPS-specified sampling points. Data streams live to our cloud via The Things Network.",
    icon: "🌱",
  },
  {
    step: "04",
    title: "AI Analysis",
    description:
      "Our agronomic AI engine processes NPK, pH, EC, moisture and temperature against Lithuanian crop standards (LST ISO) and EU Soil Monitoring Law thresholds.",
    icon: "🤖",
  },
  {
    step: "05",
    title: "Report Delivered",
    description:
      "A professional PDF report with your soil health score, fertiliser recommendations, and EU compliance documentation arrives in your inbox within 3 days.",
    icon: "📊",
  },
];

const FAQS = [
  {
    q: "Do I need to be at the farm when the technician arrives?",
    a: "No — we coordinate access directly with you via SMS. Most farmers simply leave gate access instructions in their order notes. Our WORKIS-verified technicians are fully briefed on the sampling protocol.",
  },
  {
    q: "How accurate are the sensor readings compared to laboratory analysis?",
    a: "Our LoRaWAN 7-in-1 sensors were validated against parallel LUFA laboratory testing during our pilot programme. Readings were within 4% of lab results — well within the ±5% industry-acceptable threshold.",
  },
  {
    q: "Does the report fulfil EU Soil Monitoring Law requirements?",
    a: "Yes. Every report includes a compliance section structured to the EU Soil Monitoring Law (Directive 2025) requirements, including nutrient balance documentation, soil health scoring, and submission-ready data for the Lithuanian Paying Agency.",
  },
  {
    q: "What happens if the LoRaWAN signal is weak in my area?",
    a: "All sensor kits have internal SD card logging as a backup. If LoRaWAN connectivity is unavailable at your location, data is stored locally and synced when the kit returns to our hub. Lithuania has 91%+ LoRaWAN coverage of agricultural land, so this is rare.",
  },
  {
    q: "Can I order multiple packages for different fields?",
    a: "Absolutely. You can manage multiple farms and order separate diagnostic packages for each field directly from your dashboard. Bulk pricing is available for 5+ field orders — contact us for an enterprise quote.",
  },
  {
    q: "How do I book the agronomist consultation included in my package?",
    a: "After your report is delivered, a booking link appears in your dashboard. Consultations are conducted via video call (Google Meet or Zoom) with one of our certified Lithuanian agronomists.",
  },
];

const STATS = [
  { value: "15–20%", label: "Average fertiliser cost reduction", icon: TrendingDown },
  { value: "3 days", label: "Report delivery guarantee", icon: Zap },
  { value: "91%", label: "LoRaWAN agricultural coverage", icon: Globe },
  { value: "±4%", label: "Sensor accuracy vs lab testing", icon: FlaskConical },
];

// ─────────────────────────────────────────
// Components
// ─────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0f1e0d]/95 backdrop-blur-xl border-b border-white/10 shadow-xl"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-18">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3d8838] to-[#1e6b1a] flex items-center justify-center shadow-lg">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white tracking-tight">
            Soil<span className="text-[#6fab69]">Intelligence</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {["How it Works", "Pricing", "FAQ"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
            >
              {item}
            </a>
          ))}
          <a
            href="#pricing"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
          >
            Pricing
          </a>
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-white/80 hover:text-white px-4 py-2 rounded-lg transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="text-sm font-semibold text-[#0f1e0d] bg-[#6fab69] hover:bg-[#7dbf70] px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#3d8838]/20"
          >
            Order Soil Test
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0a160a]">
      {/* Background layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1e0d] via-[#0d2a1a] to-[#091810]" />
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[#1e6b1a]/20 rounded-full blur-[100px]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2a88b8]/10 rounded-full blur-[80px]" />
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Copy */}
        <div>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-[#1e6b1a]/30 border border-[#3d8838]/40 rounded-full px-4 py-2 mb-8"
          >
            <div className="w-1.5 h-1.5 bg-[#6fab69] rounded-full animate-pulse" />
            <span className="text-[#6fab69] text-xs font-semibold tracking-wider uppercase">
              EU Soil Monitoring Law — Dec 2025 Compliance Ready
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="font-display text-5xl lg:text-7xl font-bold text-white leading-[1.05] mb-6"
          >
            Your Soil.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6fab69] to-[#3db87d]">
              Diagnosed.
            </span>
            <br />
            Delivered in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#edbf46] to-[#f4a020]">
              3 Days.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-lg text-white/65 leading-relaxed mb-10 max-w-xl"
          >
            Professional-grade soil diagnostics — NPK, pH, EC, moisture, temperature — without
            owning a single sensor. Order a package, we handle everything. You receive an
            AI-powered report and EU compliance documentation within 3 days.
          </motion.p>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-x-6 gap-y-3 mb-10"
          >
            {[
              "No equipment to buy",
              "EU Compliance Included",
              "Results in 3 days",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-white/60">
                <CheckCircle2 className="w-4 h-4 text-[#6fab69]" />
                <span>{item}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="/auth/register"
              className="group flex items-center gap-2 bg-[#1e6b1a] hover:bg-[#26881f] text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-[#1e6b1a]/30 hover:shadow-[#1e6b1a]/50 hover:scale-[1.02]"
            >
              Start Soil Testing
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 text-white/70 hover:text-white font-medium px-6 py-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              <Play className="w-4 h-4" />
              See how it works
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-10 flex items-center gap-4"
          >
            <div className="flex -space-x-2">
              {["AK", "RP", "SJ", "MV"].map((initials) => (
                <div
                  key={initials}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3d8838] to-[#1e6b1a] border-2 border-[#0f1e0d] flex items-center justify-center"
                >
                  <span className="text-xs font-bold text-white">{initials}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#edbf46] text-[#edbf46]" />
                ))}
              </div>
              <p className="text-xs text-white/50 mt-0.5">Trusted by 200+ Lithuanian farmers</p>
            </div>
          </motion.div>
        </div>

        {/* Right: Dashboard Preview Card */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="hidden lg:block"
        >
          <DashboardPreviewCard />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
        <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </div>
    </section>
  );
}

function DashboardPreviewCard() {
  return (
    <div className="relative">
      {/* Glow behind card */}
      <div className="absolute inset-0 -m-8 bg-[#1e6b1a]/20 blur-3xl rounded-full" />

      <div className="relative bg-[#0f1e0d]/80 backdrop-blur-xl border border-[#3d8838]/30 rounded-3xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider">
              Soil Intelligence Report
            </p>
            <p className="text-white font-semibold mt-0.5">Farm: Kazlauskas Nord Field</p>
          </div>
          <div className="bg-[#1e6b1a]/40 border border-[#3d8838]/40 rounded-xl px-3 py-1.5">
            <span className="text-[#6fab69] text-xs font-bold">● LIVE</span>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-6 mb-6">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1a2e18" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="40" fill="none" stroke="#3d8838" strokeWidth="8"
                strokeDasharray="251.2" strokeDashoffset="50"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 8px rgba(61,136,56,0.6))" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">82</span>
              <span className="text-[10px] text-white/40">/ 100</span>
            </div>
          </div>
          <div>
            <div className="text-[#6fab69] text-3xl font-display font-bold">Grade A</div>
            <p className="text-white/50 text-sm mt-1">Soil Health Score</p>
            <div className="flex items-center gap-1 mt-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#6fab69]" />
              <span className="text-xs text-[#6fab69] font-medium">EU Compliant</span>
            </div>
          </div>
        </div>

        {/* NPK Bars */}
        {[
          { label: "Nitrogen (N)", value: 78, unit: "mg/kg", color: "#3d8838" },
          { label: "Phosphorus (P)", value: 52, unit: "mg/kg", color: "#2a88b8" },
          { label: "Potassium (K)", value: 91, unit: "mg/kg", color: "#b87d12" },
          { label: "pH Level", value: 68, unit: "6.8", color: "#7a3d8a" },
        ].map((item) => (
          <div key={item.label} className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-white/60">{item.label}</span>
              <span className="text-xs font-mono text-white/80">{item.unit}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ delay: 0.8 + Math.random() * 0.3, duration: 0.8 }}
                className="h-full rounded-full"
                style={{ backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}

        {/* Recommendations */}
        <div className="mt-5 pt-5 border-t border-white/10">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Top Recommendation</p>
          <div className="bg-[#b87d12]/15 border border-[#b87d12]/30 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#b87d12]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px]">⚠️</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#edbf46]">Nitrogen Deficit — 22%</p>
                <p className="text-xs text-white/50 mt-0.5">
                  Apply Urea (46-0-0) at 142 kg/ha before March tillage
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <section ref={ref} className="py-16 bg-[#0a160a] border-y border-[#1a2e18]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <stat.icon className="w-6 h-6 text-[#6fab69] mx-auto mb-3" />
              <div className="font-display text-4xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-white/50">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" ref={ref} className="py-28 bg-[#040a04]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-[#6fab69] text-sm font-semibold uppercase tracking-widest">
            The Process
          </span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mt-3 mb-4">
            Sensor-as-a-Service.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6fab69] to-[#3db87d]">
              Your field. Zero hassle.
            </span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            We handle the hardware, logistics, data capture, and analysis. You receive a
            professional report. No equipment. No calibration. No complexity.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-16 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#3d8838]/40 to-transparent" />

          <div className="grid lg:grid-cols-5 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="text-center relative"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#0f1e0d] border border-[#3d8838]/40 flex items-center justify-center text-2xl mx-auto mb-4 relative z-10 shadow-lg">
                  {step.icon}
                </div>
                <div className="text-[#6fab69]/50 text-xs font-mono mb-2">{step.step}</div>
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="pricing" ref={ref} className="py-28 bg-[#040a04]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-[#6fab69] text-sm font-semibold uppercase tracking-widest">Pricing</span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mt-3 mb-4">
            Simple, transparent pricing.
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Starting at just €50 for 1 hectare. Every package includes full sensor deployment,
            AI analysis, and EU compliance reporting.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {PRICING_PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.12 }}
              className={`relative rounded-3xl p-8 border transition-all duration-300 hover:scale-[1.02] ${
                plan.popular
                  ? "bg-gradient-to-br from-[#1e6b1a]/40 to-[#0d2a1a] border-[#3d8838]/60 shadow-2xl shadow-[#3d8838]/20"
                  : "bg-[#0d1a0c]/60 border-[#1a2e18] hover:border-[#3d8838]/40"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#3d8838] to-[#2a88b8] text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-lg">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
                <p className="text-white/40 text-sm">{plan.subtitle}</p>
              </div>

              <div className="mb-6">
                <span className="font-display text-5xl font-bold text-white">€{plan.price}</span>
                <span className="text-white/40 text-sm ml-2">+ VAT / test</span>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/5 text-white/60 text-xs px-3 py-1 rounded-full">
                  {plan.sampling_points} sampling points
                </span>
                <span className="bg-white/5 text-white/60 text-xs px-3 py-1 rounded-full">
                  {plan.turnaround}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#6fab69] flex-shrink-0 mt-0.5" />
                    <span className="text-white/70">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/register"
                className={`block text-center font-semibold py-3.5 rounded-xl transition-all duration-200 ${
                  plan.popular
                    ? "bg-[#1e6b1a] hover:bg-[#26881f] text-white shadow-lg shadow-[#1e6b1a]/30"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center text-white/40 text-sm mt-8"
        >
          All prices in EUR. 21% Lithuanian VAT applies. Enterprise pricing available for 5+ field orders.
        </motion.p>
      </div>
    </section>
  );
}

function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="faq" ref={ref} className="py-28 bg-[#040a04]">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-14"
        >
          <span className="text-[#6fab69] text-sm font-semibold uppercase tracking-widest">FAQ</span>
          <h2 className="font-display text-4xl font-bold text-white mt-3">Common questions</h2>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.07 }}
              className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                open === i
                  ? "border-[#3d8838]/60 bg-[#0f1e0d]/60"
                  : "border-[#1a2e18] bg-transparent hover:border-[#3d8838]/30"
              }`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="text-white font-medium text-sm pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform duration-200 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-white/60 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-28 bg-[#0a160a] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e6b1a]/20 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#1e6b1a]/15 blur-[80px] rounded-full" />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-[#1e6b1a]/20 border border-[#3d8838]/30 rounded-full px-4 py-2 mb-8">
            <Award className="w-4 h-4 text-[#6fab69]" />
            <span className="text-[#6fab69] text-sm font-medium">
              EU Soil Monitoring Law Ready — Launch your compliance journey today
            </span>
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-6">
            Your soil data.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6fab69] to-[#3db87d]">
              Ready in 3 days.
            </span>
          </h2>
          <p className="text-white/60 text-lg mb-10 leading-relaxed">
            Join 200+ Lithuanian farmers who've optimised their fertiliser spend and achieved EU
            compliance without purchasing a single sensor. Order now, results in 3 days.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/auth/register"
              className="group flex items-center gap-3 bg-[#1e6b1a] hover:bg-[#26881f] text-white font-semibold px-10 py-4 rounded-2xl transition-all duration-300 shadow-2xl shadow-[#1e6b1a]/40 hover:scale-[1.03]"
            >
              Order Your Soil Test
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="mailto:hello@soilintelligence.lt"
              className="text-white/70 hover:text-white font-medium px-8 py-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all"
            >
              Talk to an agronomist
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#040a04] border-t border-[#1a2e18] py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-4 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3d8838] to-[#1e6b1a] flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                Soil<span className="text-[#6fab69]">Intelligence</span>
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              AI-powered soil diagnostics and EU compliance reporting for Lithuanian SME farmers.
              No hardware. No complexity. Just answers.
            </p>
          </div>

          {[
            {
              title: "Platform",
              links: ["How It Works", "Pricing", "AI Analysis", "Reports", "Compliance"],
            },
            {
              title: "Company",
              links: ["About", "Team", "Blog", "Press", "Contact"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-white/40 hover:text-white/80 text-sm transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#1a2e18] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            © 2025 Soil Intelligence UAB. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-white/30 text-xs">
            <MapPin className="w-3.5 h-3.5" />
            Kaunas, Lithuania · EU Regulated
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────
// Page
// ─────────────────────────────────────────

export default function LandingPage() {
  return (
    <main className="bg-[#040a04]">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
