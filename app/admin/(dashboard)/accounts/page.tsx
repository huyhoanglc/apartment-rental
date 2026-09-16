import AccountsManager from "@/components/admin/AccountsManager";
import { getAdminAccounts } from "@/lib/admin/accounts";
import { requirePageAccess, getAllRolePermissions, getAllRoles } from "@/lib/admin/rolePermissions";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 20;

export default async function AdminAccountsPage({ searchParams }: { searchParams: { page?: string } }) {
  await requirePageAccess("/admin/accounts");
  const page = Math.max(1, Number(searchParams.page) || 1);

  const supabase = createClient();
  const [
    { accounts, total },
    roles,
    permissions,
    {
      data: { user: currentUser },
    },
  ] = await Promise.all([
    getAdminAccounts(page, PAGE_SIZE),
    getAllRoles(),
    getAllRolePermissions(),
    supabase.auth.getUser(),
  ]);

  return (
    <AccountsManager
      accounts={accounts}
      total={total}
      page={page}
      pageSize={PAGE_SIZE}
      currentUserId={currentUser?.id}
      roles={roles}
      permissions={permissions}
    />
  );
}
