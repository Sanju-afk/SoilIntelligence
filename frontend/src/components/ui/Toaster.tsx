"use client";
import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";
interface Toast { id: string; type: ToastType; title: string; message?: string; duration?: number; }

interface ToastCtx { toast: (t: Omit<Toast, "id">) => void; success: (title: string, msg?: string) => void; error: (title: string, msg?: string) => void; }
const ToastContext = createContext<ToastCtx>({} as ToastCtx);

export function useToast() { return useContext(ToastContext); }

const ICONS = { success: CheckCircle2, error: AlertTriangle, warning: AlertTriangle, info: Info };
const STYLES = {
  success: "border-[#3d8838]/40 bg-[#1e6b1a]/20",
  error:   "border-red-500/40 bg-red-500/15",
  warning: "border-[#b87d12]/40 bg-[#b87d12]/15",
  info:    "border-[#2a88b8]/40 bg-[#2a88b8]/15",
};
const ICON_COLORS = { success: "text-[#6fab69]", error: "text-red-400", warning: "text-[#edbf46]", info: "text-[#5aadd4]" };

export function Toaster({ children }: { children?: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-3), { ...t, id }]);
    setTimeout(() => remove(id), t.duration ?? 4500);
  }, [remove]);

  const success = useCallback((title: string, message?: string) => toast({ type: "success", title, message }), [toast]);
  const error   = useCallback((title: string, message?: string) => toast({ type: "error", title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 w-80">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 80, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.9 }}
                className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-xl ${STYLES[t.type]}`}
              >
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${ICON_COLORS[t.type]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{t.title}</p>
                  {t.message && <p className="text-white/60 text-xs mt-0.5">{t.message}</p>}
                </div>
                <button onClick={() => remove(t.id)} className="text-white/30 hover:text-white transition-colors flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
