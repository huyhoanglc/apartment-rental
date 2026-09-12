import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/leads";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.phone !== "string" || body.phone.trim().length < 8) {
    return NextResponse.json(
      { error: "Vui lòng nhập số điện thoại/Zalo hợp lệ" },
      { status: 400 }
    );
  }

  try {
    const lead = {
      phone: body.phone.trim(),
      zalo: typeof body.zalo === "string" ? body.zalo.trim() : undefined,
      district: typeof body.district === "string" ? body.district.trim() : undefined,
      budget_million:
        typeof body.budget_million === "number" ? body.budget_million : undefined,
      note: typeof body.note === "string" ? body.note.trim() : undefined,
    };
    await createLead(lead);

    // Tuỳ chọn: báo Telegram khi có lead mới, không chặn response nếu lỗi.
    // Chỉ 1 thẻ <b> duy nhất quanh tiêu đề — nhiều thẻ <b>/dòng kẻ/<code>
    // từng khiến Telegram hiện lỗi escape thô ở icon đầu tin (xem
    // lib/admin/security.ts).
    void sendTelegramMessage(
      `📩 <b>Có yêu cầu thuê mới</b>\n` +
        `SĐT/Zalo: ${lead.phone}\n` +
        (lead.district ? `Khu vực: ${lead.district}\n` : "") +
        (lead.budget_million != null ? `Ngân sách: ${lead.budget_million} triệu\n` : "") +
        (lead.note ? `Ghi chú: ${lead.note}` : "")
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[POST /api/leads]", error);
    return NextResponse.json({ error: "Không gửi được yêu cầu, thử lại sau" }, { status: 500 });
  }
}
