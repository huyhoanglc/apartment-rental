import type { BlogPost } from "@/lib/types";

/** Dữ liệu mẫu/seed cho blog, dùng khi chưa cấu hình Supabase và cho npm run seed. */
export const demoBlogPosts: BlogPost[] = [
  {
    id: "demo-blog-1",
    slug: "kinh-nghiem-thue-tro-lan-dau-o-tphcm",
    title: "Kinh nghiệm thuê trọ lần đầu ở TP.HCM",
    excerpt: "Những điều cần kiểm tra trước khi đặt cọc, cách tránh gặp môi giới lừa đảo.",
    content:
      "## Kiểm tra hợp đồng kỹ trước khi đặt cọc\n\n" +
      "Đọc kỹ điều khoản về tiền cọc, thời hạn thông báo trước khi chuyển đi, và các khoản phí phát sinh (điện, nước, gửi xe).\n\n" +
      "## Xem phòng vào buổi tối\n\n" +
      "Nhiều khu trọ ban ngày có vẻ yên tĩnh nhưng ban đêm lại ồn hoặc thiếu an ninh. Nên xem phòng vào cả ban ngày và buổi tối.\n\n" +
      "## Hỏi rõ về hàng xóm và giờ giấc\n\n" +
      "Một số nhà trọ có quy định giờ giấc ra vào — hỏi kỹ trước khi ký hợp đồng nếu bạn làm việc ca đêm.",
    cover_image_url: "https://picsum.photos/seed/blog1/1200/630",
    meta_title: "Kinh nghiệm thuê trọ lần đầu ở TP.HCM",
    meta_description:
      "Hướng dẫn kiểm tra hợp đồng, xem phòng và tránh rủi ro khi thuê trọ lần đầu tại TP.HCM.",
    published: true,
    published_at: "2026-08-01T02:00:00.000Z",
    created_at: "2026-08-01T02:00:00.000Z",
    updated_at: "2026-08-01T02:00:00.000Z",
  },
  {
    id: "demo-blog-2",
    slug: "so-sanh-o-ghep-va-thue-nguyen-can",
    title: "So sánh ở ghép và thuê nguyên căn: nên chọn gì?",
    excerpt: "Ưu nhược điểm của từng lựa chọn theo ngân sách và nhu cầu riêng tư.",
    content:
      "## Ở ghép\n\nTiết kiệm chi phí, phù hợp sinh viên và người mới đi làm. Nhược điểm: ít riêng tư hơn.\n\n" +
      "## Thuê nguyên căn\n\nRiêng tư tuyệt đối, phù hợp gia đình nhỏ hoặc người cần không gian làm việc tại nhà. Chi phí cao hơn đáng kể.\n\n" +
      "## Gợi ý\n\nNếu ngân sách dưới 4 triệu/tháng, ở ghép thường hợp lý hơn. Trên 10 triệu, thuê nguyên căn đáng cân nhắc.",
    cover_image_url: "https://picsum.photos/seed/blog2/1200/630",
    meta_title: "So sánh ở ghép và thuê nguyên căn",
    meta_description: "Nên ở ghép hay thuê nguyên căn? So sánh chi phí, sự riêng tư và phù hợp với ai.",
    published: true,
    published_at: "2026-08-15T02:00:00.000Z",
    created_at: "2026-08-15T02:00:00.000Z",
    updated_at: "2026-08-15T02:00:00.000Z",
  },
];
