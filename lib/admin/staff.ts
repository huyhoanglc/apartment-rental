import { createClient } from "@/lib/supabase/server";
import type { Staff, StaffInput } from "@/lib/types";

export async function getAllStaff(): Promise<Staff[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getStaffById(id: string): Promise<Staff | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("staff").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createStaff(input: StaffInput): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("staff").insert(input);
  if (error) throw error;
}

export async function updateStaff(id: string, input: Partial<StaffInput>): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("staff").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteStaff(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("staff").delete().eq("id", id);
  if (error) throw error;
}

export async function updateStaffActive(id: string, active: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("staff").update({ active }).eq("id", id);
  if (error) throw error;
}
