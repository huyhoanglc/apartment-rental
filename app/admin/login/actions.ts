"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { logLoginEvent, parseUserAgent } from "@/lib/admin/security";
import { sendTelegramMessage } from "@/lib/telegram";

export async function login(formData: FormData) {
  if (!isSupabaseConfigured) {
    redirect("/admin/login?error=config");
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect("/admin/login?error=1");
  }

  await logLoginEvent(data.user.id);

  const headerList = headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "không rõ";
  const device = parseUserAgent(headerList.get("user-agent"));
  await sendTelegramMessage(
    `🔐 <b>Đăng nhập admin</b>\n` +
      `Email: ${data.user.email}\n` +
      `Thời gian: ${new Date().toLocaleString("vi-VN")}\n` +
      `IP: ${ip}\n` +
      `Thiết bị: ${device}`
  );

  redirect("/admin");
}
