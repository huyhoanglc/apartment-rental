"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createAdminAccount,
  deleteAdminAccount,
  resetAdminAccountPassword,
  setAdminAccountLocked,
  updateAdminAccountRole,
} from "@/lib/admin/accounts";
import { isCurrentUserAdmin, type AdminRole } from "@/lib/admin/roles";

export interface CreateAccountState {
  error?: string;
  success?: boolean;
}

async function getCurrentUserId(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id;
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

  revalidatePath("/admin/accounts");
  return { success: true };
}

export async function deleteAccountAction(id: string): Promise<{ error?: string }> {
  if (!(await isCurrentUserAdmin())) {
    return { error: "Bạn không có quyền xoá tài khoản." };
  }

  if ((await getCurrentUserId()) === id) {
    return { error: "Không thể tự xoá tài khoản đang đăng nhập." };
  }

  try {
    await deleteAdminAccount(id);
  } catch (err) {
    console.error("[deleteAccountAction]", err);
    return { error: "Xoá tài khoản thất bại, vui lòng thử lại." };
  }

  revalidatePath("/admin/accounts");
  return {};
}

export async function updateAccountRoleAction(
  id: string,
  role: AdminRole
): Promise<{ error?: string }> {
  if (!(await isCurrentUserAdmin())) {
    return { error: "Bạn không có quyền đổi vai trò." };
  }

  if ((await getCurrentUserId()) === id) {
    return { error: "Không thể tự đổi vai trò của tài khoản đang đăng nhập." };
  }

  try {
    await updateAdminAccountRole(id, role);
  } catch (err) {
    console.error("[updateAccountRoleAction]", err);
    return { error: "Đổi vai trò thất bại, vui lòng thử lại." };
  }

  revalidatePath("/admin/accounts");
  return {};
}

export async function setAccountLockedAction(
  id: string,
  locked: boolean
): Promise<{ error?: string }> {
  if (!(await isCurrentUserAdmin())) {
    return { error: "Bạn không có quyền khoá/mở khoá tài khoản." };
  }

  if ((await getCurrentUserId()) === id) {
    return { error: "Không thể tự khoá tài khoản đang đăng nhập." };
  }

  try {
    await setAdminAccountLocked(id, locked);
  } catch (err) {
    console.error("[setAccountLockedAction]", err);
    return { error: locked ? "Khoá tài khoản thất bại, vui lòng thử lại." : "Mở khoá thất bại, vui lòng thử lại." };
  }

  revalidatePath("/admin/accounts");
  return {};
}

export async function resetAccountPasswordAction(
  id: string,
  phone: string
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

  revalidatePath("/admin/accounts");
  return {};
}
