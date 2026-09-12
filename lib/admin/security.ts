import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { sendTelegramMessage } from "@/lib/telegram";

export interface LoginEvent {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

/**
 * Ghi 1 dòng lịch sử đăng nhập. Lỗi ở đây chỉ log ra console, không throw —
 * một bản ghi audit log thất bại không được làm hỏng luồng đăng nhập chính.
 */
export async function logLoginEvent(userId: string): Promise<void> {
  const headerList = headers();
  const ipAddress = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = headerList.get("user-agent");

  const supabase = createClient();
  const { error } = await supabase.from("admin_login_events").insert({
    user_id: userId,
    ip_address: ipAddress,
    user_agent: userAgent,
  });

  if (error) console.error("[logLoginEvent]", error);
}

const PROVIDER_LABELS = {
  email: "Email/mật khẩu",
  google: "Google",
} as const;

/**
 * Ghi log + báo Telegram cho 1 lần đăng nhập thành công — dùng chung cho cả
 * luồng email/password (app/admin/login/actions.ts) và OAuth
 * (app/auth/callback/route.ts) để 2 cách đăng nhập được audit như nhau.
 */
export async function recordAdminLogin(
  userId: string,
  email: string | null,
  phone: string | null,
  provider: keyof typeof PROVIDER_LABELS
): Promise<void> {
  await logLoginEvent(userId);

  const headerList = headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "không rõ";
  const device = parseUserAgent(headerList.get("user-agent"));

  await sendTelegramMessage(
    "🔔 <b>Thông Báo Đăng Nhập Admin Dashboard</b>\n" +
      "━━━━━━━━━━━━━━━━━\n" +
      `👤 <b>Tài khoản:</b> ${email ?? "?"}\n` +
      (phone ? `📱 <b>Số điện thoại:</b> ${phone}\n` : "") +
      `🔑 <b>Phương thức:</b> ${PROVIDER_LABELS[provider]}\n` +
      `🕒 <b>Thời gian:</b> ${new Date().toLocaleString("vi-VN")}\n` +
      `🌐 <b>IP:</b> <code>${ip}</code>\n` +
      `💻 <b>Thiết bị:</b> ${device}`
  );
}

export async function getLoginEvents(): Promise<LoginEvent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("admin_login_events")
    .select("id, ip_address, user_agent, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data ?? [];
}

/** Parse gọn user-agent thành "Trình duyệt · Hệ điều hành", không dùng thư viện. */
export function parseUserAgent(userAgent: string | null): string {
  if (!userAgent) return "Không xác định";

  let browser = "Trình duyệt khác";
  if (/edg\//i.test(userAgent)) browser = "Edge";
  else if (/chrome\//i.test(userAgent)) browser = "Chrome";
  else if (/firefox\//i.test(userAgent)) browser = "Firefox";
  else if (/safari\//i.test(userAgent)) browser = "Safari";

  let os = "Hệ điều hành khác";
  if (/windows/i.test(userAgent)) os = "Windows";
  else if (/mac os/i.test(userAgent)) os = "macOS";
  else if (/android/i.test(userAgent)) os = "Android";
  else if (/iphone|ipad/i.test(userAgent)) os = "iOS";
  else if (/linux/i.test(userAgent)) os = "Linux";

  return `${browser} · ${os}`;
}
