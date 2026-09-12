"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { checkLoginRateLimit, logLoginAttempt, logSecurityEvent, recordAdminLogin } from "@/lib/admin/security";

export async function login(formData: FormData) {
  if (!isSupabaseConfigured) {
    redirect("/admin/login?error=config");
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const rateLimit = await checkLoginRateLimit(email);
  if (rateLimit.blocked) {
    await logSecurityEvent("login_blocked_rate_limit", {
      actorEmail: email,
      telegramNote: "Sai mật khẩu quá nhiều lần liên tiếp — tạm chặn 15 phút.",
    });
    redirect("/admin/login?error=locked");
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

    redirect("/admin/login?error=1");
  }

  const phone = typeof data.user.user_metadata?.phone === "string" ? data.user.user_metadata.phone : null;
  await recordAdminLogin(data.user.id, data.user.email ?? null, phone);

  redirect("/admin");
}
