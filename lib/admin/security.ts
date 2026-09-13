import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatVNDateTime } from "@/lib/formatDate";
import { sendTelegramMessage } from "@/lib/telegram";

export interface LoginEvent {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

/** Số lần sai liên tiếp trong 1 cửa sổ thời gian trước khi tạm khoá đăng nhập theo email. */
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MINUTES = 15;

/**
 * Event có tín hiệu cao mới báo Telegram — login thành công thường/logout chỉ
 * ghi DB (xem logLoginAttempt/logSecurityEvent), tránh spam group Telegram.
 * Mọi cảnh báo bảo mật (kể cả login thành công, xem recordAdminLogin) ưu
 * tiên gửi vào TELEGRAM_SECURITY_CHAT_ID (group riêng, tách khỏi
 * TELEGRAM_CHAT_ID đang dùng cho thông báo lead mới) — chưa set thì tự rơi
 * về chung TELEGRAM_CHAT_ID.
 */
const TELEGRAM_ALERT_EVENTS = new Set([
  "login_blocked_rate_limit",
  "login_blocked_not_allowed",
  "account_locked_auto",
  "new_device",
  "role_changed",
  "session_revoked",
  "account_created",
  "account_deleted",
  "account_locked",
  "account_unlocked",
  "password_reset_by_admin",
  "mfa_enrolled",
  "mfa_removed",
  "mfa_reset_by_admin",
  "reauth_failed",
]);

export interface AccountLookup {
  exists: boolean;
  role: "admin" | "member" | null;
}

/**
 * Tra email ứng với tài khoản nào (có tồn tại không, role gì) — dùng để phân
 * biệt thông báo "email không tồn tại" vs "sai mật khẩu" ở
 * app/admin/login/actions.ts. Chấp nhận đánh đổi: đây vốn là thông tin user
 * enumeration (kẻ tấn công dò được email nào có tài khoản thật), nhưng UX rõ
 * ràng được ưu tiên hơn cho app nội bộ ít tài khoản này — RIÊNG role admin
 * vẫn được che (login.ts trả thông báo chung khi role=admin sai mật khẩu) vì
 * đây là nhóm tài khoản có toàn quyền, đáng bị nhắm tới nhất. Số tài khoản
 * nhỏ nên list hết 1 trang (perPage mặc định 50) là đủ, không cần phân trang.
 */
export async function lookupAccountByEmail(email: string): Promise<AccountLookup> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) {
    console.error("[lookupAccountByEmail]", error);
    return { exists: false, role: null };
  }
  const normalized = email.trim().toLowerCase();
  const user = data.users.find((u) => u.email?.toLowerCase() === normalized);
  if (!user) return { exists: false, role: null };

  return { exists: true, role: user.app_metadata?.role === "member" ? "member" : "admin" };
}

function getRequestMeta(): { ip: string | null; userAgent: string | null } {
  const headerList = headers();
  return {
    ip: headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: headerList.get("user-agent"),
  };
}

/**
 * Ghi 1 lần thử đăng nhập (thành công hoặc thất bại) vào admin_login_events.
 * Luôn dùng service-role client vì lúc đăng nhập thất bại (hoặc email không
 * khớp tài khoản nào) chưa có session hợp lệ để qua được RLS.
 */
export async function logLoginAttempt(
  email: string,
  success: boolean,
  userId?: string
): Promise<void> {
  const { ip, userAgent } = getRequestMeta();
  const admin = createAdminClient();
  const { error } = await admin.from("admin_login_events").insert({
    user_id: userId ?? null,
    email,
    success,
    ip_address: ip,
    user_agent: userAgent,
  });

  if (error) console.error("[logLoginAttempt]", error);
}

/**
 * Chặn đăng nhập khi 1 email vừa sai quá RATE_LIMIT_MAX_ATTEMPTS lần trong
 * RATE_LIMIT_WINDOW_MINUTES gần nhất. Tự hết hạn theo cửa sổ thời gian (không
 * cần bảng lock riêng), khác với khoá tay vĩnh viễn ở lib/admin/accounts.ts.
 */
export async function checkLoginRateLimit(
  email: string
): Promise<{ blocked: boolean; retryAfterSeconds: number }> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();

  const { count, error } = await admin
    .from("admin_login_events")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .eq("success", false)
    .gte("created_at", since);

  if (error) {
    console.error("[checkLoginRateLimit]", error);
    return { blocked: false, retryAfterSeconds: 0 };
  }

  const blocked = (count ?? 0) >= RATE_LIMIT_MAX_ATTEMPTS;
  return { blocked, retryAfterSeconds: blocked ? RATE_LIMIT_WINDOW_MINUTES * 60 : 0 };
}

/** So (ip, user_agent) hiện tại với các lần đăng nhập thành công trước đó của user này. */
export async function detectNewDevice(
  userId: string,
  ip: string | null,
  userAgent: string | null
): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("admin_login_events")
    .select("ip_address, user_agent")
    .eq("user_id", userId)
    .eq("success", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[detectNewDevice]", error);
    return false;
  }
  if (!data || data.length === 0) return false; // lần đăng nhập thành công đầu tiên, không tính là "thiết bị mới"

  return !data.some((row) => row.ip_address === ip && row.user_agent === userAgent);
}

export interface SecurityEventDetails {
  actorUserId?: string | null;
  actorEmail?: string | null;
  targetUserId?: string | null;
  targetEmail?: string | null;
  metadata?: Record<string, unknown>;
  /** Dòng mô tả ngắn gọn hiển thị trong tin Telegram, nếu event nằm trong TELEGRAM_ALERT_EVENTS. */
  telegramNote?: string;
}

/**
 * Ghi 1 sự kiện bảo mật vào security_audit_log (service role) + báo Telegram
 * nếu event nằm trong nhóm tín hiệu cao. Lỗi ở đây chỉ log console, không
 * throw — audit log thất bại không được làm hỏng luồng chính.
 */
export async function logSecurityEvent(
  eventType: string,
  details: SecurityEventDetails = {}
): Promise<void> {
  const { ip, userAgent } = getRequestMeta();
  const admin = createAdminClient();

  const { error } = await admin.from("security_audit_log").insert({
    event_type: eventType,
    actor_user_id: details.actorUserId ?? null,
    actor_email: details.actorEmail ?? null,
    target_user_id: details.targetUserId ?? null,
    target_email: details.targetEmail ?? null,
    ip_address: ip,
    user_agent: userAgent,
    metadata: details.metadata ?? null,
  });

  if (error) console.error("[logSecurityEvent]", eventType, error);

  if (TELEGRAM_ALERT_EVENTS.has(eventType)) {
    void sendTelegramMessage(
      `🛡️ <b>Cảnh báo bảo mật: ${eventType}</b>\n` +
        (details.actorEmail ? `Người thực hiện: ${details.actorEmail}\n` : "") +
        (details.targetEmail ? `Tài khoản liên quan: ${details.targetEmail}\n` : "") +
        (details.telegramNote ? `${details.telegramNote}\n` : "") +
        `Thời gian: ${formatVNDateTime(new Date())}\n` +
        `IP: ${ip ?? "không rõ"}`,
      process.env.TELEGRAM_SECURITY_CHAT_ID || process.env.TELEGRAM_CHAT_ID
    );
  }
}

export interface SecurityAuditLogEntry {
  id: string;
  event_type: string;
  actor_email: string | null;
  target_email: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** 50 sự kiện bảo mật gần nhất — trang /admin/security-log (chỉ admin, theo RLS trên security_audit_log). */
export async function getSecurityAuditLog(): Promise<SecurityAuditLogEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("security_audit_log")
    .select("id, event_type, actor_email, target_email, ip_address, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data ?? [];
}

/**
 * Ghi log + báo Telegram cho 1 lần đăng nhập thành công — dùng chung cho cả
 * luồng email/password (app/admin/login/actions.ts) và OAuth
 * (app/auth/callback/route.ts) để 2 cách đăng nhập được audit như nhau.
 */
export async function recordAdminLogin(
  userId: string,
  email: string | null,
  phone: string | null
): Promise<void> {
  const { ip, userAgent } = getRequestMeta();
  await logLoginAttempt(email ?? "", true, userId);

  const isNewDevice = await detectNewDevice(userId, ip, userAgent);
  if (isNewDevice) {
    await logSecurityEvent("new_device", {
      actorUserId: userId,
      actorEmail: email,
      telegramNote: `Thiết bị: ${parseUserAgent(userAgent)}`,
    });
  }

  const device = parseUserAgent(userAgent);

  // Format nhiều thẻ <b> + dòng kẻ + <code> (thử trước đó) vẫn bị Telegram
  // hiện escape thô "\uD83D\uDDxx" ở icon đầu tin dù đổi icon hay đổi cách
  // đặt icon trong/ngoài thẻ <b> — không chắc nguyên nhân chính xác (khả
  // năng liên quan số lượng entity HTML trong 1 tin). Quay về đúng cấu trúc
  // đơn giản đã dùng ổn định trước đây: chỉ 1 thẻ <b> duy nhất quanh tiêu đề,
  // các dòng còn lại là text thường.
  await sendTelegramMessage(
    `🔔 <b>Thông Báo Đăng Nhập Admin Dashboard</b>\n` +
      `Tài khoản: ${email ?? "?"}\n` +
      (phone ? `Số điện thoại: ${phone}\n` : "") +
      `Thời gian: ${formatVNDateTime(new Date())}\n` +
      `IP: ${ip ?? "không rõ"}\n` +
      `Thiết bị: ${device}`,
    process.env.TELEGRAM_SECURITY_CHAT_ID || process.env.TELEGRAM_CHAT_ID
  );
}

export async function getLoginEvents(): Promise<LoginEvent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("admin_login_events")
    .select("id, ip_address, user_agent, created_at")
    .eq("success", true)
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

  // iPhone/iPad phải kiểm tra TRƯỚC macOS: UA của iOS luôn có cụm "like Mac OS
  // X" nên nếu để nhánh macOS đứng trước sẽ khớp nhầm mọi thiết bị iOS.
  let os = "Hệ điều hành khác";
  if (/windows/i.test(userAgent)) os = "Windows";
  else if (/iphone|ipad/i.test(userAgent)) os = "iOS";
  else if (/mac os/i.test(userAgent)) os = "macOS";
  else if (/android/i.test(userAgent)) os = "Android";
  else if (/linux/i.test(userAgent)) os = "Linux";

  return `${browser} · ${os}`;
}
