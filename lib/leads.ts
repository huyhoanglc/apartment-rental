import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Lead } from "@/lib/types";

export async function createLead(lead: Lead): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    console.warn("[leads] Supabase chưa cấu hình, bỏ qua lưu lead:", lead);
    return;
  }

  const { error } = await supabase.from("leads").insert({
    phone: lead.phone,
    zalo: lead.zalo ?? null,
    district: lead.district ?? null,
    budget_million: lead.budget_million ?? null,
    note: lead.note ?? null,
  });

  if (error) throw error;
}
