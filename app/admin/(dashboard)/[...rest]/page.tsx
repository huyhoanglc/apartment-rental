import { notFound } from "next/navigation";

/** Bắt mọi đường dẫn /admin/** không khớp trang nào khác — cùng lý do với
 * app/[locale]/[...rest]/page.tsx (xem comment ở đó). */
export default function AdminCatchAll() {
  notFound();
}
