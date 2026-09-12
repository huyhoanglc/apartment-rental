import SessionsManager from "@/components/admin/SessionsManager";
import { getAdminAccounts } from "@/lib/admin/accounts";
import { requireAdminPage } from "@/lib/admin/roles";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSessionsPage() {
  await requireAdminPage();

  const supabase = createClient();
  const [
    accounts,
    {
      data: { user: currentUser },
    },
  ] = await Promise.all([getAdminAccounts(), supabase.auth.getUser()]);

  return <SessionsManager accounts={accounts} currentUserId={currentUser?.id} />;
}
