import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordAdminLogin } from "@/lib/admin/security";

/**
 * Danh sách email được phép đăng nhập qua OAuth (Google...), phân tách bằng
 * dấu phẩy trong ADMIN_ALLOWED_EMAILS. Bắt buộc phải có — Supabase OAuth mặc
 * định TỰ TẠO tài khoản mới cho bất kỳ ai đăng nhập Google thành công (khác
 * với luồng email/password chỉ tạo được tài khoản thủ công qua Dashboard),
 * nên nếu không chặn ở đây thì ai có Gmail cũng vào được /admin với toàn
 * quyền (RLS chỉ phân biệt authenticated/anon, không phân biệt ai). Không
 * cấu hình biến này = chặn tất cả (fail closed), an toàn hơn là mặc định mở.
 *
 * Chỉ áp dụng cho ĐĂNG NHẬP MỚI — không áp dụng khi 1 tài khoản đã đăng nhập
 * (bằng email/password) tự liên kết thêm Google cho chính mình
 * (supabase.auth.linkIdentity, xem components/admin/LinkGoogleButton.tsx):
 * thao tác đó không cấp thêm quyền gì (tài khoản vốn đã hợp lệ), chỉ thêm 1
 * cách đăng nhập, nên không cần nằm trong allowlist.
 */
function isEmailAllowed(email: string | null): boolean {
  if (!email) return false;
  const allowList = (process.env.ADMIN_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowList.includes(email.toLowerCase());
}

/**
 * Callback cho OAuth (Google...) — Supabase redirect về đây kèm ?code=...
 * sau khi user đồng ý ở màn hình consent. Đường dẫn này nằm ngoài /admin và
 * ngoài matcher của middleware.ts nên không bị chặn đăng nhập/redirect ngôn
 * ngữ — tự xử lý xong rồi redirect vào /admin (đăng nhập mới) hoặc
 * /admin/security (liên kết Google cho tài khoản đang đăng nhập).
 *
 * Cố ý KHÔNG nhận đích đến qua query string (?next=...): redirectTo gửi cho
 * Supabase phải khớp NGUYÊN VĂN 1 entry trong allowlist "Redirect URLs" của
 * Supabase Dashboard — gắn thêm query string vào sẽ không khớp entry đã đăng
 * ký (vd "https://.../auth/callback") nữa và bị Supabase âm thầm rớt về Site
 * URL mặc định (từng gây lỗi đăng nhập Google trên domain thật bị đưa nhầm
 * về localhost). Đích đến được suy ra từ isLinking bên dưới, không cần query.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/login?error=1`);
  }

  const supabase = createClient();

  // Đã có session hợp lệ TRƯỚC khi exchange code => đây là thao tác liên kết
  // identity cho tài khoản đang đăng nhập, không phải đăng nhập mới. Lấy tín
  // hiệu từ cookie session có sẵn (server-side) — KHÔNG dùng query param do
  // client tự gửi, vì query param có thể bị sửa tay để giả làm "linking" và
  // né allowlist.
  const {
    data: { user: existingUser },
  } = await supabase.auth.getUser();
  const isLinking = Boolean(existingUser);

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/admin/login?error=1`);
  }

  if (!isLinking) {
    if (!isEmailAllowed(data.user.email ?? null)) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/admin/login?error=not_allowed`);
    }
    await recordAdminLogin(data.user.id, data.user.email ?? null, "google");
  }

  const next = isLinking ? "/admin/security" : "/admin";
  return NextResponse.redirect(`${origin}${next}`);
}
