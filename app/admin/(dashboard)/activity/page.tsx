import { getRecentActivity } from "@/lib/admin/activity";
import { ACTIVITY_ACTION_LABELS, ACTIVITY_TABLE_LABELS } from "@/lib/types";

const ACTION_BADGE: Record<string, string> = {
  insert: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  update: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  delete: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
};

export default async function ActivityLogPage() {
  const entries = await getRecentActivity();

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground">Lịch sử chỉnh sửa</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        50 thao tác gần nhất trên Phòng, Dự án và Blog — ai tạo/sửa/xoá và khi nào. Quyền chỉnh
        sửa vẫn dùng chung cho cả admin và cá nhân, trang này chỉ để tra cứu.
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl2 border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Người thực hiện</th>
              <th className="px-4 py-3">Hành động</th>
              <th className="px-4 py-3">Mục</th>
              <th className="px-4 py-3">Nội dung</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-border last:border-0">
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {new Date(entry.created_at).toLocaleString("vi-VN")}
                </td>
                <td className="px-4 py-3 text-foreground">{entry.changed_by_email ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      ACTION_BADGE[entry.action] ?? ""
                    }`}
                  >
                    {ACTIVITY_ACTION_LABELS[entry.action]}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{ACTIVITY_TABLE_LABELS[entry.table_name]}</td>
                <td className="px-4 py-3 text-foreground">{entry.record_label ?? "—"}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Chưa có thao tác nào được ghi nhận.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
