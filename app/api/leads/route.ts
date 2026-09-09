import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/leads";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.phone !== "string" || body.phone.trim().length < 8) {
    return NextResponse.json(
      { error: "Vui lòng nhập số điện thoại/Zalo hợp lệ" },
      { status: 400 }
    );
  }

  try {
    await createLead({
      phone: body.phone.trim(),
      zalo: typeof body.zalo === "string" ? body.zalo.trim() : undefined,
      district: typeof body.district === "string" ? body.district.trim() : undefined,
      budget_million:
        typeof body.budget_million === "number" ? body.budget_million : undefined,
      note: typeof body.note === "string" ? body.note.trim() : undefined,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[POST /api/leads]", error);
    return NextResponse.json({ error: "Không gửi được yêu cầu, thử lại sau" }, { status: 500 });
  }
}
