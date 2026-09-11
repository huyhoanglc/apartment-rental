import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentRole } from "@/lib/admin/roles";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const role = await getCurrentRole();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNav userId={user.id} email={user.email ?? ""} role={role} />
      <main className="min-w-0 flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
