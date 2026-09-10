/**
 * Gửi thông báo qua Telegram Bot. Chỉ gọi từ Server Action/Route Handler —
 * TELEGRAM_BOT_TOKEN không có prefix NEXT_PUBLIC_ nên không lộ ra client,
 * nhưng vẫn phải cẩn thận không import file này vào component "use client".
 *
 * Lỗi gửi Telegram chỉ log ra console, không throw — một thông báo phụ thất
 * bại không được làm hỏng luồng chính (đăng nhập, gửi lead...).
 */
export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });

    if (!res.ok) {
      console.error("[telegram] gửi thông báo thất bại:", res.status, await res.text());
    }
  } catch (error) {
    console.error("[telegram] gửi thông báo thất bại:", error);
  }
}
