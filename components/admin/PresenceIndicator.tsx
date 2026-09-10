"use client";

import { useEffect, useState } from "react";
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
 * Giới hạn: chỉ phản ánh "đang mở tab ở khu vực admin", không biết đang thao
 * tác cụ thể gì (vd đang sửa tin nào) — muốn mức chi tiết đó (kiểu Google Docs
 * cùng sửa 1 tài liệu) cần thiết kế riêng, phức tạp hơn nhiều, ngoài phạm vi
 * này. Gói Supabase free giới hạn số connection Realtime đồng thời — không
 * đáng lo với vài admin nội bộ, nhưng cần biết nếu sau này mở rộng nhiều hơn.
 */
interface PresenceIndicatorProps {
  userId: string;
  email: string;
}

interface PresenceMeta {
  email: string;
  online_at: string;
}

export default function PresenceIndicator({ userId, email }: PresenceIndicatorProps) {
  const [onlineEmails, setOnlineEmails] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("admin-presence", {
      config: { presence: { key: userId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceMeta>();
        const emails = new Set<string>();
        for (const metas of Object.values(state)) {
          if (metas[0]?.email) emails.add(metas[0].email);
        }
        setOnlineEmails(Array.from(emails));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ email, online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, email]);

  if (onlineEmails.length === 0) return null;

  return (
    <div className="flex items-center -space-x-2">
      {onlineEmails.map((adminEmail) => (
        <span
          key={adminEmail}
          title={adminEmail === email ? `${adminEmail} (Bạn)` : adminEmail}
          className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-semibold text-white ring-2 ring-card"
        >
          {adminEmail[0]?.toUpperCase()}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-status-available ring-2 ring-card" />
        </span>
      ))}
    </div>
  );
}
