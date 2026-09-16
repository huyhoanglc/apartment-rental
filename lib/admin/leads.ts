import { createClient } from "@/lib/supabase/server";
import type { LeadRecord } from "@/lib/types";

export interface LeadsPage {
  leads: LeadRecord[];
  total: number;
}

export async function getLeads(page: number = 1, pageSize: number = 20): Promise<LeadsPage> {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("leads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { leads: data ?? [], total: count ?? 0 };
}

export async function updateLeadContacted(id: string, contacted: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("leads").update({ contacted }).eq("id", id);
  if (error) throw error;
}
