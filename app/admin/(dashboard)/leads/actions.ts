"use server";

import { revalidatePath } from "next/cache";
import { updateLeadContacted } from "@/lib/admin/leads";

export async function toggleLeadContactedAction(id: string, contacted: boolean): Promise<void> {
  await updateLeadContacted(id, contacted);
  revalidatePath("/admin/leads");
}
