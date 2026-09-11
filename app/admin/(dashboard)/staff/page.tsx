import Link from "next/link";
import DeleteStaffButton from "@/components/admin/DeleteStaffButton";
import StaffActiveToggle from "@/components/admin/StaffActiveToggle";
import { getAllStaff } from "@/lib/admin/staff";
import { requireAdminPage } from "@/lib/admin/roles";

export default async function AdminStaffPage() {
  await requireAdminPage();
  const staff = await getAllStaff();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Nhân viên</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{staff.length} nhân viên trong danh bạ</p>
        </div>
        <Link
          href="/admin/staff/new"
          className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Thêm nhân viên
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl2 border border-border bg-card shadow-card">
        {staff.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <p className="font-medium text-foreground">Chưa có nhân viên nào</p>
            <p className="text-sm text-muted-foreground">
              Bấm &quot;Thêm nhân viên&quot; để tạo danh bạ đầu tiên.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Họ tên</th>
                <th className="px-4 py-3">SĐT</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Chức vụ</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {staff.map((person) => (
                <tr
                  key={person.id}
                  className="border-b border-border transition last:border-0 hover:bg-muted/40"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{person.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{person.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{person.email ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{person.role ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StaffActiveToggle id={person.id} active={person.active} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/staff/${person.id}/edit`}
                        className="text-sm font-medium text-primary-700 hover:underline dark:text-primary-300"
                      >
                        Sửa
                      </Link>
                      <DeleteStaffButton id={person.id} name={person.full_name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
