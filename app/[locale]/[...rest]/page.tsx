import { notFound } from "next/navigation";

/**
 * Bắt mọi đường dẫn không khớp route nào khác dưới [locale] (vd gõ sai URL
 * bất kỳ, không phải sai mã /tin/[code] hay /blog/[slug] — 2 chỗ đó đã tự
 * gọi notFound() từ bên trong route riêng của chúng rồi). Không có route bắt
 * hết kiểu này thì Next.js không xác định được layout nào để dùng cho đường
 * dẫn lạ, rơi về 404 mặc định trắng của Next thay vì app/[locale]/not-found.tsx.
 */
export default function CatchAll() {
  notFound();
}
