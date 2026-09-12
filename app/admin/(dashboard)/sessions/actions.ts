"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { forceLogoutAccount } from "@/lib/admin/accounts";
import { isCurrentUserAdmin } from "@/lib/admin/roles";

async function getCurrentUserId(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id;
}

export async function forceLogoutAction(id: string): Promise<{ error?: string }> {
  if (!(await isCurrentUserAdmin())) {
    return { error: "Bạn không có quyền ép đăng xuất." };
  }

  if ((await getCurrentUserId()) === id) {
    return { error: "Không thể tự ép đăng xuất chính mình — dùng nút Đăng xuất." };
  }

  try {
    await forceLogoutAccount(id);
  } catch (err) {
    console.error("[forceLogoutAction]", err);
    return { error: "Ép đăng xuất thất bại, vui lòng thử lại." };
  }

  revalidatePath("/admin/sessions");
  return {};
}
