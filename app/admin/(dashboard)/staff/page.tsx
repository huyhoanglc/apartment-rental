import StaffManager from "@/components/admin/StaffManager";
import { getAllStaff } from "@/lib/admin/staff";
import { requireAdminPage } from "@/lib/admin/roles";

export default async function AdminStaffPage() {
  await requireAdminPage();
  const staff = await getAllStaff();

  return <StaffManager staff={staff} />;
}
