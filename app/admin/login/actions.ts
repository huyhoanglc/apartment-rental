"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { recordAdminLogin } from "@/lib/admin/security";

export async function login(formData: FormData) {
  if (!isSupabaseConfigured) {
    redirect("/admin/login?error=config");
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect("/admin/login?error=1");
  }

  await recordAdminLogin(data.user.id, data.user.email ?? null);

  redirect("/admin");
}
