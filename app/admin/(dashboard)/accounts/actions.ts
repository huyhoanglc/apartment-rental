"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createAdminAccount,
  deleteAdminAccount,
  resetAdminAccountMfa,
  resetAdminAccountPassword,
  setAdminAccountLocked,
  updateAdminAccountRole,
} from "@/lib/admin/accounts";
import { isCurrentUserAdmin, type AdminRole } from "@/lib/admin/roles";
import { setAllowedPages } from "@/lib/admin/rolePermissions";
import { logSecurityEvent } from "@/lib/admin/security";

export interface CreateAccountState {
  error?: string;
  success?: boolean;
}

async function getCurrentUser(): Promise<{ id: string; email: string | null } | undefined> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { id: user.id, email: user.email ?? null } : undefined;
}

export async function createAccountAction(
  _prevState: CreateAccountState,
  formData: FormData
): Promise<CreateAccountState> {
  if (!(await isCurrentUserAdmin())) {
    return { error: "Bạn không có quyền tạo tài khoản." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const role = formData.get("role") === "admin" ? "admin" : "member";

  if (!fullName) {
    return { error: "Vui lòng nhập họ và tên." };
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "Email không hợp lệ." };
  }
  if (!phone) {
    return { error: "Vui lòng nhập số điện thoại (dùng làm mật khẩu mặc định khi cần reset)." };
  }
  if (password.length < 8) {
    return { error: "Mật khẩu phải có ít nhất 8 ký tự." };
  }

  try {
    await createAdminAccount(email, password, role, fullName, phone);
  } catch (err) {
    console.error("[createAccountAction]", err);
    const message = err instanceof Error ? err.message : "";
    return {
      error: message.includes("already been registered")
        ? "Email này đã có tài khoản."
        : "Tạo tài khoản thất bại, vui lòng thử lại.",
    };
  }

  const actor = await getCurrentUser();
  await logSecurityEvent("account_created", {
    actorUserId: actor?.id,
    actorEmail: actor?.email,
    targetEmail: email,
    metadata: { role },
    telegramNote: `Tài khoản mới: "${email}" (vai trò ${role === "admin" ? "Admin" : "Staff"}).`,
  });

  revalidatePath("/admin/accounts");
  return { success: true };
}

export async function deleteAccountAction(id: string, targetEmail: string): Promise<{ error?: string }> {
  if (!(await isCurrentUserAdmin())) {
    return { error: "Bạn không có quyền xoá tài khoản." };
  }

  const actor = await getCurrentUser();
  if (actor?.id === id) {
    return { error: "Không thể tự xoá tài khoản đang đăng nhập." };
  }

  try {
    await deleteAdminAccount(id);
  } catch (err) {
    console.error("[deleteAccountAction]", err);
    return { error: "Xoá tài khoản thất bại, vui lòng thử lại." };
  }

  await logSecurityEvent("account_deleted", {
    actorUserId: actor?.id,
    actorEmail: actor?.email,
    targetUserId: id,
    targetEmail,
    telegramNote: `Tài khoản "${targetEmail}" vừa bị xoá.`,
  });

  revalidatePath("/admin/accounts");
  return {};
}

export async function updateAccountRoleAction(
  id: string,
  role: AdminRole,
  targetEmail: string
): Promise<{ error?: string }> {
  if (!(await isCurrentUserAdmin())) {
    return { error: "Bạn không có quyền đổi vai trò." };
  }

  const actor = await getCurrentUser();
  if (actor?.id === id) {
    return { error: "Không thể tự đổi vai trò của tài khoản đang đăng nhập." };
  }

  try {
    await updateAdminAccountRole(id, role);
  } catch (err) {
    console.error("[updateAccountRoleAction]", err);
    return { error: "Đổi vai trò thất bại, vui lòng thử lại." };
  }

  await logSecurityEvent("role_changed", {
    actorUserId: actor?.id,
    actorEmail: actor?.email,
    targetUserId: id,
    targetEmail,
    metadata: { newRole: role },
    telegramNote: `Tài khoản "${targetEmail}" vừa được đổi vai trò thành "${role}".`,
  });

  revalidatePath("/admin/accounts");
  return {};
}

export async function setAccountLockedAction(
  id: string,
  locked: boolean,
  targetEmail: string
): Promise<{ error?: string }> {
  if (!(await isCurrentUserAdmin())) {
    return { error: "Bạn không có quyền khoá/mở khoá tài khoản." };
  }

  const actor = await getCurrentUser();
  if (actor?.id === id) {
    return { error: "Không thể tự khoá tài khoản đang đăng nhập." };
  }

  try {
    await setAdminAccountLocked(id, locked);
  } catch (err) {
    console.error("[setAccountLockedAction]", err);
    return { error: locked ? "Khoá tài khoản thất bại, vui lòng thử lại." : "Mở khoá thất bại, vui lòng thử lại." };
  }

  await logSecurityEvent(locked ? "account_locked" : "account_unlocked", {
    actorUserId: actor?.id,
    actorEmail: actor?.email,
    targetUserId: id,
    targetEmail,
    telegramNote: locked
      ? `Tài khoản "${targetEmail}" vừa bị khoá — không đăng nhập được cho tới khi mở khoá lại.`
      : `Tài khoản "${targetEmail}" vừa được mở khoá.`,
  });

  revalidatePath("/admin/accounts");
  return {};
}

export async function resetAccountPasswordAction(
  id: string,
  phone: string,
  targetEmail: string
): Promise<{ error?: string }> {
  if (!(await isCurrentUserAdmin())) {
    return { error: "Bạn không có quyền reset mật khẩu." };
  }

  if (!phone) {
    return { error: "Tài khoản này chưa có số điện thoại để đặt làm mật khẩu mặc định." };
  }

  try {
    await resetAdminAccountPassword(id, phone);
  } catch (err) {
    console.error("[resetAccountPasswordAction]", err);
    return { error: "Reset mật khẩu thất bại, vui lòng thử lại." };
  }

  const actor = await getCurrentUser();
  await logSecurityEvent("password_reset_by_admin", {
    actorUserId: actor?.id,
    actorEmail: actor?.email,
    targetUserId: id,
    targetEmail,
    telegramNote: `Mật khẩu của "${targetEmail}" vừa bị đặt lại (về số điện thoại).`,
  });

  revalidatePath("/admin/accounts");
  return {};
}

export async function updateRolePermissionsAction(role: AdminRole, allowedHrefs: string[]): Promise<{ error?: string }> {
  if (!(await isCurrentUserAdmin())) {
    return { error: "Bạn không có quyền đổi phân quyền." };
  }
  if (role === "admin") {
    return { error: "Admin luôn có toàn quyền, không chỉnh được." };
  }

  try {
    await setAllowedPages(role, allowedHrefs);
  } catch (err) {
    console.error("[updateRolePermissionsAction]", err);
    return { error: "Đổi phân quyền thất bại, vui lòng thử lại." };
  }

  const actor = await getCurrentUser();
  await logSecurityEvent("role_permissions_updated", {
    actorUserId: actor?.id,
    actorEmail: actor?.email,
    metadata: { role, allowedHrefs },
    telegramNote: `Phân quyền vai trò "${role}" vừa được đổi — ${allowedHrefs.length} trang được xem.`,
  });

  revalidatePath("/admin/accounts");
  revalidatePath("/admin", "layout");
  return {};
}

export async function resetAccountMfaAction(
  id: string,
  targetEmail: string
): Promise<{ error?: string }> {
  if (!(await isCurrentUserAdmin())) {
    return { error: "Bạn không có quyền reset MFA." };
  }

  const actor = await getCurrentUser();

  try {
    await resetAdminAccountMfa(id);
  } catch (err) {
    console.error("[resetAccountMfaAction]", err);
    return { error: "Reset MFA thất bại, vui lòng thử lại." };
  }

  await logSecurityEvent("mfa_reset_by_admin", {
    actorUserId: actor?.id,
    actorEmail: actor?.email,
    targetUserId: id,
    targetEmail,
    telegramNote: `MFA của "${targetEmail}" vừa bị gỡ — họ sẽ phải enroll lại ở lần đăng nhập kế tiếp.`,
  });

  revalidatePath("/admin/accounts");
  return {};
}
