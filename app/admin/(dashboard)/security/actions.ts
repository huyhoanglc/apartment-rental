"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signOutOtherDevices(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut({ scope: "others" });
  revalidatePath("/admin/security");
}

export interface UpdateProfileState {
  error?: string;
  success?: boolean;
}

/**
 * Chỉ sửa được user_metadata.full_name của CHÍNH tài khoản đang đăng nhập
 * (supabase.auth.updateUser dùng client cookie-session thường, không phải
 * service role) — không đụng được tới app_metadata.role hay tài khoản khác.
 */
export async function updateProfileAction(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) {
    return { error: "Vui lòng nhập họ và tên." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
  if (error) {
    console.error("[updateProfileAction]", error);
    return { error: "Cập nhật thất bại, vui lòng thử lại." };
  }

  revalidatePath("/admin/security");
  return { success: true };
}
