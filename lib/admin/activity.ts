import { createClient } from "@/lib/supabase/server";
import type { ActivityLogEntry } from "@/lib/types";

/** 50 thao tác tạo/sửa/xoá gần nhất trên Phòng/Dự án/Blog, mới nhất trước. */
export async function getRecentActivity(): Promise<ActivityLogEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("activity_log")
    .select("id, table_name, record_id, record_label, action, changed_by, changed_by_email, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data ?? [];
}
