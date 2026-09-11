"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createStaff, deleteStaff, updateStaff, updateStaffActive } from "@/lib/admin/staff";
import { isCurrentUserAdmin } from "@/lib/admin/roles";
import type { StaffInput } from "@/lib/types";

export interface SaveStaffState {
  error?: string;
}

export async function saveStaff(
  existingId: string | null,
  _prevState: SaveStaffState,
  formData: FormData
): Promise<SaveStaffState> {
  if (!(await isCurrentUserAdmin())) {
    return { error: "Bạn không có quyền thực hiện thao tác này." };
  }

  const full_name = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const active = formData.get("active") === "on";

  if (!full_name) {
    return { error: "Vui lòng nhập họ tên." };
  }

  const fields: StaffInput = {
    full_name,
    phone: phone || null,
    email: email || null,
    role: role || null,
    active,
  };

  try {
    if (existingId === null) {
      await createStaff(fields);
    } else {
      await updateStaff(existingId, fields);
    }
  } catch (err) {
    console.error("[saveStaff]", err);
    return { error: "Lưu nhân viên thất bại, vui lòng thử lại." };
  }

  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}

export async function deleteStaffAction(id: string): Promise<void> {
  if (!(await isCurrentUserAdmin())) return;
  await deleteStaff(id);
  revalidatePath("/admin/staff");
}

export async function toggleStaffActiveAction(id: string, active: boolean): Promise<void> {
  if (!(await isCurrentUserAdmin())) return;
  await updateStaffActive(id, active);
  revalidatePath("/admin/staff");
}
