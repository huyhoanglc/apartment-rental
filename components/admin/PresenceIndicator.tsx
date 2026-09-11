"use client";

import { useEffect, useState } from "react";
import Avatar from "@/components/admin/Avatar";
import { createClient } from "@/lib/supabase/client";

/**
 * Hiển thị admin nào đang mở trang /admin/** tại thời điểm hiện tại, dùng
 * Supabase Realtime Presence (channel "admin-presence") — không lưu trạng
 * thái online vào bảng DB nào, tự dọn khi đóng tab/mất kết nối (hành vi mặc
 * định của Realtime, không cần code thêm).
 *
 * Gộp danh sách theo email (không phải theo key kết nối): 1 người có thể tạo
 * ra nhiều kết nối Realtime cùng lúc (nhiều tab, hoặc kết nối cũ bị leak lúc
 * dev do Fast Refresh chưa kịp đóng) — email mới là danh tính thật cần hiện,
 * nên luôn chỉ 1 avatar cho mỗi người dù họ mở bao nhiêu tab.
 *
 * Chỉ hiện NGƯỜI KHÁC đang online (loại chính mình khỏi danh sách) — trạng
 * thái online của chính mình đã gộp chung vào avatar tài khoản (chấm xanh
 * trên nút dropdown), tránh 2 avatar trùng lặp cho cùng 1 người.
 *
 * Giới hạn: chỉ phản ánh "đang mở tab ở khu vực admin", không biết đang thao
 * tác cụ thể gì (vd đang sửa tin nào) — muốn mức chi tiết đó (kiểu Google Docs
 * cùng sửa 1 tài liệu) cần thiết kế riêng, phức tạp hơn nhiều, ngoài phạm vi
 * này. Gói Supabase free giới hạn số connection Realtime đồng thời — không
 * đáng lo với vài admin nội bộ, nhưng cần biết nếu sau này mở rộng nhiều hơn.
 */
interface PresenceIndicatorProps {
  userId: string;
  email: string;
  avatarUrl: string | null;
}

interface PresenceMeta {
  email: string;
  avatar_url: string | null;
  online_at: string;
}

interface OnlineAdmin {
  email: string;
  avatarUrl: string | null;
}

export default function PresenceIndicator({ userId, email, avatarUrl }: PresenceIndicatorProps) {
  const [onlineAdmins, setOnlineAdmins] = useState<OnlineAdmin[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("admin-presence", {
      config: { presence: { key: userId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceMeta>();
        const byEmail = new Map<string, string | null>();
        for (const metas of Object.values(state)) {
          if (metas[0]?.email) byEmail.set(metas[0].email, metas[0].avatar_url ?? null);
        }
        setOnlineAdmins(Array.from(byEmail, ([adminEmail, adminAvatarUrl]) => ({ email: adminEmail, avatarUrl: adminAvatarUrl })));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ email, avatar_url: avatarUrl, online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, email, avatarUrl]);

  const others = onlineAdmins.filter((admin) => admin.email !== email);
  if (others.length === 0) return null;

  return (
    <div className="flex items-center -space-x-2">
      {others.map((admin) => (
        <div key={admin.email} title={admin.email}>
          <Avatar name={admin.email} avatarUrl={admin.avatarUrl} className="h-8 w-8 text-xs" online />
        </div>
      ))}
    </div>
  );
}
