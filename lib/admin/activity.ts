import { createClient } from "@/lib/supabase/server";
import type { ActivityLogEntry } from "@/lib/types";

/** 50 thao tác tạo/sửa/xoá gần nhất, mới nhất trước — lọc theo bảng nếu truyền tableName. */
export async function getRecentActivity(tableName?: ActivityLogEntry["table_name"]): Promise<ActivityLogEntry[]> {
  const supabase = createClient();
  let query = supabase
    .from("activity_log")
    .select("id, table_name, record_id, record_label, action, changed_by, changed_by_email, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (tableName) query = query.eq("table_name", tableName);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
