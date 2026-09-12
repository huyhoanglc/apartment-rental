"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVerifiedTotpFactor, verifyTotpChallenge } from "@/lib/admin/mfa";
import { logSecurityEvent } from "@/lib/admin/security";

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/**
 * Re-auth (step-up) bằng mã TOTP của chính người đang gọi — dùng trước các
 * thao tác nhạy cảm (xoá tài khoản, đổi vai trò, ép đăng xuất) qua
 * components/admin/ReauthDialog.tsx. Dùng lại mã TOTP thay vì mật khẩu vì
 * role admin bắt buộc có MFA nên luôn có sẵn, kể cả tài khoản chỉ đăng nhập
 * Google (không có mật khẩu).
 */
export async function verifyReauthMfaAction(code: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const factor = await getVerifiedTotpFactor();
  if (!factor) {
    return { ok: false, error: "Tài khoản chưa bật MFA, không thể xác thực lại." };
  }

  const ok = await verifyTotpChallenge(factor.id, code);
  if (!ok) {
    await logSecurityEvent("reauth_failed", {
      actorUserId: user?.id,
      actorEmail: user?.email,
    });
    return { ok: false, error: "Mã xác thực không đúng." };
  }

  return { ok: true };
}
