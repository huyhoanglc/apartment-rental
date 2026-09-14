import AccountsManager from "@/components/admin/AccountsManager";
import { getAdminAccounts } from "@/lib/admin/accounts";
import { requirePageAccess, getAllRolePermissions } from "@/lib/admin/rolePermissions";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAccountsPage() {
  await requirePageAccess("/admin/accounts");

  const supabase = createClient();
  const [
    accounts,
    permissions,
    {
      data: { user: currentUser },
    },
  ] = await Promise.all([getAdminAccounts(), getAllRolePermissions(), supabase.auth.getUser()]);

  return <AccountsManager accounts={accounts} currentUserId={currentUser?.id} permissions={permissions} />;
}
