import StaffManager from "@/components/admin/StaffManager";
import { getAllStaff } from "@/lib/admin/staff";
import { requirePageAccess } from "@/lib/admin/rolePermissions";

export default async function AdminStaffPage() {
  await requirePageAccess("/admin/staff");
  const staff = await getAllStaff();

  return <StaffManager staff={staff} />;
}
