import StaffForm from "@/components/admin/StaffForm";
import { saveStaff } from "../actions";

export default function NewStaffPage() {
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
