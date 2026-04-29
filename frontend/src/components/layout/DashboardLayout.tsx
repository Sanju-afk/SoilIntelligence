"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FlaskConical, FileText, MapPin,
  Settings, Bell, LogOut, Leaf, ChevronRight, Menu, X,
  BarChart3, Shield, MessageSquare, CreditCard, User,
  Truck, Wrench, Home, TrendingUp,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  role?: string[];
}

const FARMER_NAV: NavItem[] = [
  { label: "Overview",        href: "/dashboard",                   icon: LayoutDashboard },
  { label: "My Farms",        href: "/dashboard/farms",             icon: MapPin },
  { label: "Soil Tests",      href: "/dashboard/orders",            icon: FlaskConical },
  { label: "Reports",         href: "/dashboard/reports",           icon: FileText },
  { label: "AI Analysis",     href: "/dashboard/analysis",          icon: BarChart3 },
  { label: "Consultations",   href: "/dashboard/consultations",     icon: MessageSquare },
  { label: "Compliance",      href: "/dashboard/compliance",        icon: Shield },
  { label: "Billing",         href: "/dashboard/billing",           icon: CreditCard },
  { label: "Profile",         href: "/dashboard/profile",           icon: User },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard",       href: "/admin",                       icon: LayoutDashboard },
  { label: "Users",           href: "/admin/users",                 icon: User },
  { label: "Orders",          href: "/admin/orders",                icon: FlaskConical },
  { label: "Workers",         href: "/admin/workers",               icon: Truck },
  { label: "Reports",         href: "/admin/reports",               icon: FileText },
  { label: "Analytics",       href: "/admin/analytics",             icon: TrendingUp },
  { label: "Compliance",      href: "/admin/compliance",            icon: Shield },
  { label: "Settings",        href: "/admin/settings",              icon: Settings },
];

const WORKER_NAV: NavItem[] = [
  { label: "My Tasks",        href: "/worker",                      icon: LayoutDashboard },
  { label: "Active Task",     href: "/worker/active",               icon: Wrench },
  { label: "Task History",    href: "/worker/history",              icon: FileText },
  { label: "Profile",         href: "/worker/profile",              icon: User },
];

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/admin" && item.href !== "/worker" && pathname.startsWith(item.href));

  return (
    <Link href={item.href}>
      <motion.div
        whileHover={{ x: 2 }}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer ${
          isActive
            ? "bg-[#1e6b1a]/30 text-[#6fab69] border border-[#3d8838]/40"
            : "text-white/50 hover:text-white/90 hover:bg-white/5"
        }`}
      >
        <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-[#6fab69]" : ""}`} />
        {!collapsed && (
          <span className="text-sm font-medium truncate flex-1">{item.label}</span>
        )}
        {!collapsed && item.badge && (
          <span className="bg-[#3d8838] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
        {!collapsed && isActive && (
          <ChevronRight className="w-3.5 h-3.5 text-[#6fab69]/60 ml-auto" />
        )}
      </motion.div>
    </Link>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: "farmer" | "admin" | "worker";
}

export default function DashboardLayout({ children, role = "farmer" }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);

  const navItems = role === "admin" ? ADMIN_NAV : role === "worker" ? WORKER_NAV : FARMER_NAV;
  const roleLabel = role === "admin" ? "Admin Portal" : role === "worker" ? "Worker Panel" : "Farmer Dashboard";
  const roleColor = role === "admin" ? "text-[#b87d12]" : role === "worker" ? "text-[#2a88b8]" : "text-[#6fab69]";

  return (
    <div className="flex h-screen bg-[#06100a] overflow-hidden">
      {/* ── Desktop Sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden lg:flex flex-col bg-[#08150a] border-r border-[#1a2e18] flex-shrink-0 overflow-hidden relative"
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-[#1a2e18] ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3d8838] to-[#1e6b1a] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#1e6b1a]/30">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-display font-bold text-base text-white">
                Soil<span className="text-[#6fab69]">Intel</span>
              </span>
              <p className={`text-[10px] font-medium ${roleColor} -mt-0.5`}>{roleLabel}</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-[#1a2e18] space-y-1">
          <NavLink item={{ label: "Settings", href: `/${role}/settings`, icon: Settings }} collapsed={collapsed} />
          <button
            onClick={() => {/* logout */}}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-[#1a2e18] border border-[#3d8838]/40 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:border-[#3d8838] transition-all z-10"
        >
          <ChevronRight className={`w-3 h-3 transition-transform ${collapsed ? "" : "rotate-180"}`} />
        </button>
      </motion.aside>

      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-[#08150a] border-r border-[#1a2e18] z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between h-16 px-4 border-b border-[#1a2e18]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3d8838] to-[#1e6b1a] flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-display font-bold text-white">Soil<span className="text-[#6fab69]">Intel</span></span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-white/50 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {navItems.map((item) => (
                  <NavLink key={item.href} item={item} collapsed={false} />
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-[#08150a]/80 backdrop-blur-xl border-b border-[#1a2e18] flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-white/60 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-white/40">
            <Home className="w-3.5 h-3.5" />
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/70">{roleLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
              <Bell className="w-4 h-4" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#3d8838] rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-2 pl-3 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3d8838] to-[#1e6b1a] flex items-center justify-center">
                <span className="text-xs font-bold text-white">AK</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-white text-sm font-medium leading-none">Andrius K.</p>
                <p className={`text-[10px] ${roleColor} capitalize`}>{role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
