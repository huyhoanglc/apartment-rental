import SessionsManager from "@/components/admin/SessionsManager";
import { getAdminAccounts } from "@/lib/admin/accounts";
import { requirePageAccess } from "@/lib/admin/rolePermissions";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSessionsPage() {
  await requirePageAccess("/admin/sessions");

  const supabase = createClient();
  const [
    accounts,
    {
      data: { user: currentUser },
    },
  ] = await Promise.all([getAdminAccounts(), supabase.auth.getUser()]);

  return <SessionsManager accounts={accounts} currentUserId={currentUser?.id} />;
}
