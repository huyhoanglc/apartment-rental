import { demoProjects } from "@/data/projects";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Project } from "@/lib/types";

export async function getProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [...demoProjects].sort((a, b) => a.name.localeCompare(b.name));
  }

  const { data, error } = await supabase.from("projects").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!isSupabaseConfigured || !supabase) {
    return demoProjects.find((p) => p.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}
