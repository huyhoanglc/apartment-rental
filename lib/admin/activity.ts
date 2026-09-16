import { createClient } from "@/lib/supabase/server";
import type { ActivityLogEntry } from "@/lib/types";

export interface RecentActivityPage {
  entries: ActivityLogEntry[];
  total: number;
}

/** Thao tác tạo/sửa/xoá trên Phòng/Dự án/Blog, phân trang, lọc theo bảng nếu truyền tableName, mới nhất trước. */
export async function getRecentActivity(
  page: number = 1,
  pageSize: number = 20,
  tableName?: ActivityLogEntry["table_name"]
): Promise<RecentActivityPage> {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("activity_log")
    .select("id, table_name, record_id, record_label, action, changed_by, changed_by_email, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (tableName) query = query.eq("table_name", tableName);

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { entries: data ?? [], total: count ?? 0 };
}
