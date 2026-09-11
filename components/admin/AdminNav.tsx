"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/app/admin/(dashboard)/actions";
import PresenceIndicator from "@/components/admin/PresenceIndicator";
import type { AdminRole } from "@/lib/admin/roles";

interface AdminNavProps {
  userId: string;
  email: string;
  role: AdminRole;
}

const COLLAPSE_STORAGE_KEY = "admin-sidebar-collapsed";

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12 11.204 3.045a1.125 1.125 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

function InboxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 9h4.125c.504 0 .933.348 1.09.827a2.997 2.997 0 0 0 5.696 0c.157-.48.586-.827 1.09-.827H20.25M3.75 9l1.5-5.25A1.125 1.125 0 0 1 6.324 3h11.352a1.125 1.125 0 0 1 1.074.75L20.25 9M3.75 9v9.375c0 .621.504 1.125 1.125 1.125h14.25c.621 0 1.125-.504 1.125-1.125V9"
      />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 21h18M6 21V6.75A1.5 1.5 0 0 1 7.5 5.25h4.5A1.5 1.5 0 0 1 13.5 6.75V21M13.5 21V11.25A1.5 1.5 0 0 1 15 9.75h3a1.5 1.5 0 0 1 1.5 1.5V21M9 8.25h.008v.008H9V8.25Zm0 3h.008v.008H9V11.25Zm0 3h.008v.008H9V14.25Z"
      />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
      />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
      />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v6.646c0 5.108-3.246 9.542-8.086 11.343a1.115 1.115 0 0 1-.828 0C7.246 21.03 4 16.594 4 11.486V4.774c0-.54.384-1.007.917-1.096A48.32 48.32 0 0 1 12 3Z"
      />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/admin", label: "Phòng", icon: HomeIcon, adminOnly: false },
  { href: "/admin/projects", label: "Dự án", icon: BuildingIcon, adminOnly: false },
  { href: "/admin/leads", label: "Leads", icon: InboxIcon, adminOnly: false },
  { href: "/admin/blog", label: "Blog", icon: DocumentIcon, adminOnly: false },
  { href: "/admin/activity", label: "Lịch sử", icon: ClockIcon, adminOnly: false },
  { href: "/admin/staff", label: "Nhân viên", icon: UsersIcon, adminOnly: true },
  { href: "/admin/accounts", label: "Tài khoản", icon: KeyIcon, adminOnly: true },
  { href: "/admin/security", label: "Bảo mật", icon: ShieldIcon, adminOnly: false },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export default function AdminNav({ userId, email, role }: AdminNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || role === "admin");

  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1");
    setHydrated(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2.5 py-3">
      {visibleItems.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            } ${collapsed ? "md:justify-center md:px-0" : ""}`}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${
                collapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  const UserFooter = () => (
    <div className={`border-t border-border p-2.5 ${collapsed ? "md:flex md:flex-col md:items-center md:gap-2" : ""}`}>
      <div className={`flex items-center px-0.5 pb-2 ${collapsed ? "md:justify-center" : "justify-start"}`}>
        <PresenceIndicator userId={userId} email={email} />
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-muted ${
            collapsed ? "md:justify-center md:px-0" : ""
          }`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-semibold text-white shadow-sm">
            {(email[0] || "?").toUpperCase()}
          </span>
          <span
            className={`min-w-0 overflow-hidden whitespace-nowrap transition-all duration-200 ${
              collapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"
            }`}
          >
            <span className="block truncate text-sm font-medium text-foreground">{email}</span>
          </span>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute bottom-full left-0 z-50 mb-2 w-60 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
              <div className="border-b border-border px-4 py-3">
                <p className="text-xs text-muted-foreground">Đăng nhập với</p>
                <p className="truncate text-sm font-medium text-foreground">{email}</p>
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  Đăng xuất
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Thanh trên cùng chỉ hiện ở mobile — sidebar thật nằm bên trái ở md+. */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 shadow-sm backdrop-blur md:hidden">
        <Link href="/admin" className="flex items-center gap-2 text-base font-bold text-primary-700 dark:text-primary-300">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 text-xs text-white shadow-sm">
            TT
          </span>
          Quản trị
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground"
          aria-label="Mở menu"
        >
          <span className="text-lg">{mobileOpen ? "✕" : "☰"}</span>
        </button>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-card shadow-xl">
            <div className="flex h-14 items-center gap-2 border-b border-border px-4 text-base font-bold text-primary-700 dark:text-primary-300">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 text-xs text-white shadow-sm">
                TT
              </span>
              Quản trị
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
            <UserFooter />
          </aside>
        </div>
      )}

      <aside
        className={`sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-border bg-card md:flex ${
          hydrated ? "transition-[width] duration-200" : ""
        } ${collapsed ? "md:w-[68px]" : "md:w-60"}`}
      >
        <div className={`flex h-14 items-center gap-2 border-b border-border px-4 ${collapsed ? "md:justify-center md:px-0" : ""}`}>
          <Link href="/admin" className="flex items-center gap-2 overflow-hidden text-primary-700 dark:text-primary-300">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 text-xs font-bold text-white shadow-sm">
              TT
            </span>
            <span
              className={`overflow-hidden whitespace-nowrap text-sm font-bold transition-all duration-200 ${
                collapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"
              }`}
            >
              Tổ Thuê TP.HCM
            </span>
          </Link>
        </div>

        <NavLinks />
        <UserFooter />

        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
          className="absolute -right-3 top-16 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:text-foreground"
        >
          <ChevronLeftIcon className={`h-3.5 w-3.5 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </aside>
    </>
  );
}
