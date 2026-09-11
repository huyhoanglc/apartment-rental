import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentRole } from "@/lib/admin/roles";
import AdminNav from "@/components/admin/AdminNav";
import AdminTopBar from "@/components/admin/AdminTopBar";
import AdminUIProvider from "@/components/admin/AdminUIProvider";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const role = await getCurrentRole();
  // full_name/avatar_url do Supabase tự điền từ Google khi đăng nhập OAuth;
  // tài khoản email/mật khẩu tạo qua /admin/accounts chỉ có full_name (do
  // admin nhập), không có avatar — fallback về chữ cái đầu tên là đủ.
  const fullName =
    (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null) ??
    (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null);
  const avatarUrl =
    (typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null) ??
    (typeof user.user_metadata?.picture === "string" ? user.user_metadata.picture : null);

  return (
    <AdminUIProvider>
      <div className="flex min-h-screen bg-background">
        <AdminNav
          userId={user.id}
          email={user.email ?? ""}
          fullName={fullName}
          avatarUrl={avatarUrl}
          role={role}
        />
        <main className="min-w-0 flex-1">
          <AdminTopBar />
          <div className="px-4 py-8 md:px-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </div>
        </main>
      </div>
    </AdminUIProvider>
  );
}
