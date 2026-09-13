"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  checkLoginRateLimit,
  logLoginAttempt,
  logSecurityEvent,
  lookupAccountByEmail,
  recordAdminLogin,
} from "@/lib/admin/security";

export async function login(formData: FormData) {
  if (!isSupabaseConfigured) {
    redirect("/admin/login?error=config");
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  // Giữ lại email đã gõ khi redirect về do lỗi — chỉ email (không phải bí
  // mật), tuyệt đối không đưa password vào query string.
  const emailParam = `&email=${encodeURIComponent(email)}`;

  const rateLimit = await checkLoginRateLimit(email);
  if (rateLimit.blocked) {
    await logSecurityEvent("login_blocked_rate_limit", {
      actorEmail: email,
      telegramNote: "Sai mật khẩu quá nhiều lần liên tiếp — tạm chặn 15 phút.",
    });
    redirect(`/admin/login?error=locked${emailParam}`);
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    await logLoginAttempt(email, false);

    const failedCount = (await checkLoginRateLimit(email)).blocked;
    if (failedCount) {
      await logSecurityEvent("account_locked_auto", {
        actorEmail: email,
        telegramNote: "Vừa chạm ngưỡng 5 lần sai trong 15 phút — tài khoản tạm khoá đăng nhập.",
      });
    }

    // Theo yêu cầu: tách rõ "email không tồn tại" vs "sai mật khẩu" thay vì
    // dùng chung 1 thông báo — đây vốn là user enumeration (lộ email nào có
    // tài khoản thật), nhưng chấp nhận đánh đổi vì app nội bộ ít tài khoản,
    // ưu tiên UX rõ ràng hơn. Sai email -> không giữ lại giá trị đã gõ (reset
    // ô nhập); sai mật khẩu -> giữ nguyên email đã gõ. RIÊNG role admin vẫn
    // dùng thông báo chung khi sai mật khẩu — đây là nhóm tài khoản toàn
    // quyền, không lộ thêm "email này chắc chắn là admin".
    const account = await lookupAccountByEmail(email);
    if (!account.exists) {
      redirect("/admin/login?error=wrong_email");
    }
    if (account.role === "admin") {
      redirect(`/admin/login?error=1${emailParam}`);
    }
    redirect(`/admin/login?error=wrong_password${emailParam}`);
  }

  const phone = typeof data.user.user_metadata?.phone === "string" ? data.user.user_metadata.phone : null;
  await recordAdminLogin(data.user.id, data.user.email ?? null, phone);

  redirect("/admin");
}
