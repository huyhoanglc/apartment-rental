import SessionsManager from "@/components/admin/SessionsManager";
import { getAdminAccounts } from "@/lib/admin/accounts";
import { requirePageAccess } from "@/lib/admin/rolePermissions";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 20;

export default async function AdminSessionsPage({ searchParams }: { searchParams: { page?: string } }) {
  await requirePageAccess("/admin/sessions");
  const page = Math.max(1, Number(searchParams.page) || 1);

  const supabase = createClient();
  const [
    { accounts, total },
    {
      data: { user: currentUser },
    },
  ] = await Promise.all([getAdminAccounts(page, PAGE_SIZE), supabase.auth.getUser()]);

  return (
    <SessionsManager accounts={accounts} total={total} page={page} pageSize={PAGE_SIZE} currentUserId={currentUser?.id} />
  );
}
