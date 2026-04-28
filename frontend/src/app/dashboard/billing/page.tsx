"use client";

import { motion } from "framer-motion";
import { CreditCard, Download, CheckCircle2, Clock, FileText, Euro } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const PAYMENTS = [
  { id: "pay-1", invoice: "INV-2025-042", order: "SI-2025-00042", description: "Standard 5ha Package — North Field", amount: 145.20, vat: 25.20, date: "2025-06-15", status: "paid", method: "Visa •••• 4242" },
  { id: "pay-2", invoice: "INV-2025-028", order: "SI-2025-00028", description: "Professional 10ha Package — East Plot", amount: 181.50, vat: 31.50, date: "2025-06-10", status: "paid", method: "Visa •••• 4242" },
  { id: "pay-3", invoice: "INV-2025-011", order: "SI-2025-00011", description: "Starter 1ha Package — South Meadow", amount: 60.50, vat: 10.50, date: "2025-05-22", status: "paid", method: "Banklink" },
];

const total = PAYMENTS.reduce((s, p) => s + p.amount, 0);

export default function BillingPage() {
  return (
    <DashboardLayout role="farmer">
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Billing & Invoices</h1>
          <p className="text-white/50 text-sm mt-0.5">Payment history and downloadable invoices</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Spent",    value: `€${total.toFixed(2)}`, icon: Euro,       color: "text-[#6fab69]",  bg: "bg-[#1e6b1a]/15" },
            { label: "Invoices",       value: PAYMENTS.length,        icon: FileText,   color: "text-[#5aadd4]",  bg: "bg-[#2a88b8]/15" },
            { label: "Payment Method", value: "Visa •••• 4242",       icon: CreditCard, color: "text-[#edbf46]", bg: "bg-[#b87d12]/15" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-4">
              <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-white font-bold text-lg">{s.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Payment method */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Payment Method</h2>
            <button className="text-xs text-[#6fab69] hover:underline">Update</button>
          </div>
          <div className="flex items-center gap-4 p-4 bg-[#0a120a] rounded-xl border border-[#1a2e18]">
            <div className="w-10 h-7 bg-gradient-to-r from-[#1a6690] to-[#2a88b8] rounded flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[9px] font-bold">VISA</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Visa ending in 4242</p>
              <p className="text-white/40 text-xs">Expires 08/2027</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-[#6fab69] ml-auto" />
          </div>
        </motion.div>

        {/* Invoice list */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-[#0d1a0c]/80 border border-[#1a2e18] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1a2e18]">
            <h2 className="text-white font-semibold">Invoice History</h2>
          </div>
          <div className="divide-y divide-[#1a2e18]">
            {PAYMENTS.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 + i * 0.07 }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-[#1a2e18] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-[#6fab69]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{p.description}</p>
                  <p className="text-white/40 text-xs">{p.invoice} · {p.date} · {p.method}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-semibold">€{p.amount.toFixed(2)}</p>
                  <p className="text-white/30 text-xs">incl. €{p.vat.toFixed(2)} VAT</p>
                </div>
                <span className="bg-[#1e6b1a]/20 text-[#6fab69] text-xs font-medium px-2 py-0.5 rounded-full">
                  Paid
                </span>
                <button className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-[#1e6b1a]/20 hover:bg-[#1e6b1a]/40 flex items-center justify-center text-[#6fab69] transition-all">
                  <Download className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* VAT note */}
        <p className="text-white/30 text-xs">
          All prices include 21% Lithuanian VAT (PVM). VAT invoices are issued by Soil Intelligence UAB, VAT LT123456789.
          Invoices are compliant with Lithuanian accounting requirements.
        </p>
      </div>
    </DashboardLayout>
  );
}
