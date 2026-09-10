import { createClient } from "@/lib/supabase/server";
import type { LeadRecord } from "@/lib/types";

export async function getLeads(): Promise<LeadRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateLeadContacted(id: string, contacted: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("leads").update({ contacted }).eq("id", id);
  if (error) throw error;
}
