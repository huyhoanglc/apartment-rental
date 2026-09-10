import Link from "next/link";
import { logout } from "@/app/admin/(dashboard)/actions";

export default function AdminNav() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/admin" className="text-lg font-bold text-primary-700 dark:text-primary-300">
          Quản trị Tổ Thuê TP.HCM
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/admin" className="text-foreground hover:text-primary-700 dark:hover:text-primary-300">
            Tin thuê
          </Link>
          <Link href="/admin/leads" className="text-foreground hover:text-primary-700 dark:hover:text-primary-300">
            Leads
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-border px-3 py-1.5 text-foreground hover:bg-muted"
            >
              Đăng xuất
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
