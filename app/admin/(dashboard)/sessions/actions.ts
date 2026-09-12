"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { forceLogoutAccount } from "@/lib/admin/accounts";
import { isCurrentUserAdmin } from "@/lib/admin/roles";
import { logSecurityEvent } from "@/lib/admin/security";

async function getCurrentUser(): Promise<{ id: string; email: string | null } | undefined> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { id: user.id, email: user.email ?? null } : undefined;
}

export async function forceLogoutAction(id: string, targetEmail: string): Promise<{ error?: string }> {
  if (!(await isCurrentUserAdmin())) {
    return { error: "Bạn không có quyền ép đăng xuất." };
  }

  const actor = await getCurrentUser();
  if (actor?.id === id) {
    return { error: "Không thể tự ép đăng xuất chính mình — dùng nút Đăng xuất." };
  }

  try {
    await forceLogoutAccount(id);
  } catch (err) {
    console.error("[forceLogoutAction]", err);
    return { error: "Ép đăng xuất thất bại, vui lòng thử lại." };
  }

  await logSecurityEvent("session_revoked", {
    actorUserId: actor?.id,
    actorEmail: actor?.email,
    targetUserId: id,
    targetEmail,
    telegramNote: `Phiên đăng nhập của "${targetEmail}" vừa bị ép đăng xuất.`,
  });

  revalidatePath("/admin/sessions");
  return {};
}
