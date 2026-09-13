/**
 * Gửi thông báo qua Telegram Bot. Chỉ gọi từ Server Action/Route Handler —
 * TELEGRAM_BOT_TOKEN không có prefix NEXT_PUBLIC_ nên không lộ ra client,
 * nhưng vẫn phải cẩn thận không import file này vào component "use client".
 *
 * `chatId` mặc định lấy TELEGRAM_CHAT_ID (chat/group chính, đang dùng cho lead
 * mới) — truyền tay chat id khác (vd TELEGRAM_SECURITY_CHAT_ID) để tách kênh
 * cảnh báo bảo mật ra group riêng, khỏi lẫn với thông báo lead tần suất cao.
 * Không set TELEGRAM_SECURITY_CHAT_ID thì cảnh báo bảo mật vẫn rơi về chung
 * TELEGRAM_CHAT_ID như trước, không cần đổi gì để tiếp tục hoạt động.
 *
 * Lỗi gửi Telegram chỉ log ra console, không throw — một thông báo phụ thất
 * bại không được làm hỏng luồng chính (đăng nhập, gửi lead...).
 */
export async function sendTelegramMessage(
  text: string,
  chatId: string | undefined = process.env.TELEGRAM_CHAT_ID
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token || !chatId) return;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ chat_id: chatId, text: text.normalize("NFC"), parse_mode: "HTML" }),
    });

    if (!res.ok) {
      console.error("[telegram] gửi thông báo thất bại:", res.status, await res.text());
    }
  } catch (error) {
    console.error("[telegram] gửi thông báo thất bại:", error);
  }
}
