"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminAccount, deleteAdminAccount } from "@/lib/admin/accounts";

export interface CreateAccountState {
  error?: string;
  success?: boolean;
}

export async function createAccountAction(
  _prevState: CreateAccountState,
  formData: FormData
): Promise<CreateAccountState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "Email không hợp lệ." };
  }
  if (password.length < 8) {
    return { error: "Mật khẩu phải có ít nhất 8 ký tự." };
  }

  try {
    await createAdminAccount(email, password);
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
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id === id) {
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
