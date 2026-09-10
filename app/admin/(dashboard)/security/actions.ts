"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signOutOtherDevices(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut({ scope: "others" });
  revalidatePath("/admin/security");
}
