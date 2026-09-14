import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminRole } from "@/lib/admin/roles";

export interface AdminAccount {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: AdminRole;
  locked: boolean;
  has_mfa: boolean;
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

/** Supabase không có "khoá vĩnh viễn" thật sự — dùng ban_duration rất dài để mô phỏng. */
const LOCK_DURATION = "876000h";

export async function getAdminAccounts(): Promise<AdminAccount[]> {
  await requireAuthenticated();
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.listUsers();
  if (error) throw error;

  // listUsers() không trả kèm MFA factors (luôn rỗng) — phải gọi riêng
  // mfa.listFactors cho từng user mới biết chính xác đã bật MFA hay chưa.
  const mfaByUserId = new Map<string, boolean>();
  await Promise.all(
    data.users.map(async (u) => {
      const { data: factorsData } = await admin.auth.admin.mfa.listFactors({ userId: u.id });
      mfaByUserId.set(u.id, (factorsData?.factors ?? []).some((f) => f.status === "verified"));
    })
  );

  return data.users
    .map((u) => ({
      id: u.id,
      email: u.email ?? "",
      full_name: typeof u.user_metadata?.full_name === "string" ? u.user_metadata.full_name : null,
      phone: typeof u.user_metadata?.phone === "string" ? u.user_metadata.phone : null,
      role: roleOf(u.app_metadata),
      locked: Boolean(u.banned_until) && new Date(u.banned_until as string) > new Date(),
      has_mfa: mfaByUserId.get(u.id) ?? false,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      providers: (u.identities ?? []).map((i) => i.provider),
    }))
    .sort((a, b) => a.email.localeCompare(b.email));
}

export async function createAdminAccount(
  email: string,
  password: string,
  role: AdminRole,
  fullName: string,
  phone: string
): Promise<void> {
  await requireAuthenticated();
  const admin = createAdminClient();

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role },
    user_metadata: { full_name: fullName, phone: phone || null },
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

export async function setAdminAccountLocked(id: string, locked: boolean): Promise<void> {
  await requireAuthenticated();
  const admin = createAdminClient();

  const { error } = await admin.auth.admin.updateUserById(id, {
    ban_duration: locked ? LOCK_DURATION : "none",
  });

  if (error) throw error;
}

/** Đặt lại mật khẩu về đúng số điện thoại đã nhập lúc tạo tài khoản. */
export async function resetAdminAccountPassword(id: string, phone: string): Promise<void> {
  await requireAuthenticated();
  const admin = createAdminClient();

  const { error } = await admin.auth.admin.updateUserById(id, { password: phone });
  if (error) throw error;
}

/**
 * Ép đăng xuất phiên đang hoạt động của user khác. Supabase Admin API không
 * có hàm "sign out theo user id" (auth.admin.signOut cần chính jwt của phiên
 * đó, không phải id — không dùng được ở đây), nên xoá thẳng session trong DB
 * qua RPC (hàm public.admin_force_logout, SECURITY DEFINER — xem
 * supabase/schema.sql). Access token họ đang cầm vẫn hợp lệ về mặt chữ ký
 * tới khi hết hạn tự nhiên, nhưng getUser() ở lần tải trang/thao tác kế tiếp
 * sẽ thất bại vì session đã bị xoá.
 */
export async function forceLogoutAccount(id: string): Promise<void> {
  await requireAuthenticated();
  const admin = createAdminClient();

  const { error } = await admin.rpc("admin_force_logout", { target_user_id: id });
  if (error) throw error;
}

/**
 * Gỡ MFA của 1 tài khoản khác — dùng khi họ mất thiết bị authenticator và
 * không tự đăng nhập được nữa (role admin bắt buộc có MFA nên không có cách
 * tự khôi phục nào khác). Sau khi gỡ, họ đăng nhập lại bình thường rồi bị bắt
 * enroll lại từ đầu ở /admin/mfa-setup.
 */
export async function resetAdminAccountMfa(id: string): Promise<void> {
  await requireAuthenticated();
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.mfa.listFactors({ userId: id });
  if (error) throw error;

  for (const factor of data.factors) {
    const { error: deleteError } = await admin.auth.admin.mfa.deleteFactor({
      id: factor.id,
      userId: id,
    });
    if (deleteError) throw deleteError;
  }
}
