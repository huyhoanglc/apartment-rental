import Link from "next/link";
import { logout } from "@/app/admin/(dashboard)/actions";
import PresenceIndicator from "@/components/admin/PresenceIndicator";

interface AdminNavProps {
  userId: string;
  email: string;
}

export default function AdminNav({ userId, email }: AdminNavProps) {
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
          <Link href="/admin/blog" className="text-foreground hover:text-primary-700 dark:hover:text-primary-300">
            Blog
          </Link>
          <Link href="/admin/security" className="text-foreground hover:text-primary-700 dark:hover:text-primary-300">
            Bảo mật
          </Link>
          <PresenceIndicator userId={userId} email={email} />
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
