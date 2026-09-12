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

const EMPLOYMENT_TYPES = ["full_time", "part_time"] as const;

/**
 * Chỉ sửa được user_metadata (hồ sơ cá nhân) của CHÍNH tài khoản đang đăng
 * nhập (supabase.auth.updateUser dùng client cookie-session thường, không
 * phải service role) — không đụng được tới app_metadata.role hay tài khoản
 * khác. Supabase merge `data` vào user_metadata sẵn có (không ghi đè hết),
 * nên avatar_url lấy từ Google lúc đăng nhập vẫn giữ nguyên.
 */
export async function updateProfileAction(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const dateOfBirth = String(formData.get("date_of_birth") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim();
  const employmentTypeRaw = String(formData.get("employment_type") ?? "");
  const startDate = String(formData.get("start_date") ?? "").trim();

  if (!fullName) {
    return { error: "Vui lòng nhập họ và tên." };
  }

  const employment_type = EMPLOYMENT_TYPES.includes(employmentTypeRaw as (typeof EMPLOYMENT_TYPES)[number])
    ? employmentTypeRaw
    : null;

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      date_of_birth: dateOfBirth || null,
      position: position || null,
      employment_type,
      start_date: startDate || null,
    },
  });
  if (error) {
    console.error("[updateProfileAction]", error);
    return { error: "Cập nhật thất bại, vui lòng thử lại." };
  }

  revalidatePath("/admin/security");
  return { success: true };
}
