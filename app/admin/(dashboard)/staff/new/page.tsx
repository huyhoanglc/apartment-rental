import StaffForm from "@/components/admin/StaffForm";
import { requireAdminPage } from "@/lib/admin/roles";
import { saveStaff } from "../actions";

export default async function NewStaffPage() {
  await requireAdminPage();
  const action = saveStaff.bind(null, null);

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground">Thêm nhân viên</h1>
      <div className="mt-4">
        <StaffForm action={action} />
      </div>
    </div>
  );
}
