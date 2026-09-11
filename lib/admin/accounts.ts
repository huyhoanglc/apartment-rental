import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminRole } from "@/lib/admin/roles";

export interface AdminAccount {
  id: string;
  email: string;
  role: AdminRole;
  created_at: string;
  last_sign_in_at: string | null;
  providers: string[];
}

/**
 * Mọi hàm ở đây dùng service role key (bỏ qua RLS) — bắt buộc tự xác nhận
 * người gọi đang có session hợp lệ trước, không dựa vào việc "chỉ được gọi
 * từ trang admin" (Server Action vẫn có thể bị gọi trực tiếp bằng request
 * thủ công nếu biết action id, nên phải tự kiểm tra ở đây, không chỉ ở UI).
 */
async function requireAuthenticated(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Chưa đăng nhập.");
}

function roleOf(appMetadata: Record<string, unknown> | undefined): AdminRole {
  return appMetadata?.role === "member" ? "member" : "admin";
}

export async function getAdminAccounts(): Promise<AdminAccount[]> {
  await requireAuthenticated();
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.listUsers();
  if (error) throw error;

  return data.users
    .map((u) => ({
      id: u.id,
      email: u.email ?? "",
      role: roleOf(u.app_metadata),
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      providers: (u.identities ?? []).map((i) => i.provider),
    }))
    .sort((a, b) => a.email.localeCompare(b.email));
}

export async function createAdminAccount(
  email: string,
  password: string,
  role: AdminRole
): Promise<void> {
  await requireAuthenticated();
  const admin = createAdminClient();

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role },
  });

  if (error) throw error;
}

export async function deleteAdminAccount(id: string): Promise<void> {
  await requireAuthenticated();
  const admin = createAdminClient();

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) throw error;
}

export async function updateAdminAccountRole(id: string, role: AdminRole): Promise<void> {
  await requireAuthenticated();
  const admin = createAdminClient();

  const { error } = await admin.auth.admin.updateUserById(id, {
    app_metadata: { role },
  });

  if (error) throw error;
}
