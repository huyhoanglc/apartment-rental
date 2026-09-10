import { notFound } from "next/navigation";
import StaffForm from "@/components/admin/StaffForm";
import { getStaffById } from "@/lib/admin/staff";
import { saveStaff } from "../../actions";

export default async function EditStaffPage({ params }: { params: { id: string } }) {
  const person = await getStaffById(params.id);
  if (!person) notFound();

  const action = saveStaff.bind(null, person.id);

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground">Sửa nhân viên — {person.full_name}</h1>
      <div className="mt-4">
        <StaffForm action={action} initialStaff={person} />
      </div>
    </div>
  );
}
