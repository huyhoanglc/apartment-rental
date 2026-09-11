/** Next.js tự hiện file này khi điều hướng sang 1 trang admin khác đang chờ dữ liệu từ server. */
export default function AdminDashboardLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary-600" />
      <p className="text-sm">Đang tải...</p>
    </div>
  );
}
