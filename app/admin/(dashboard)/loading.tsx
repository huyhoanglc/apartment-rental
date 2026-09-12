/**
 * Next.js tự hiện file này khi điều hướng sang 1 trang admin khác đang chờ dữ
 * liệu từ server. Cố ý vẽ giống khung 1 trang danh sách thật (thanh tiêu đề +
 * nút "Thêm mới" + vài dòng bảng) thay vì 1 spinner to chiếm hết màn hình —
 * nhìn như chỉ phần danh sách đang tải, còn tiêu đề/nút vẫn "có mặt" ngay,
 * chuyên nghiệp hơn việc xoá trắng cả khối nội dung.
 */
function Bar({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export default function AdminDashboardLoading() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <Bar className="h-6 w-32" />
          <Bar className="mt-2 h-4 w-52" />
        </div>
        <Bar className="h-10 w-36 rounded-lg" />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl2 border border-border bg-card shadow-card">
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4">
              <Bar className="h-10 w-14 shrink-0" />
              <Bar className="h-4 flex-1" />
              <Bar className="h-4 w-24" />
              <Bar className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
