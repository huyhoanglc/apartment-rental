import { createClient } from "@/lib/supabase/server";
import type { ProjectInput } from "@/lib/types";

export async function createProject(input: ProjectInput): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("projects").insert(input);
  if (error) throw error;
}

export async function updateProject(slug: string, input: Partial<ProjectInput>): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("projects").update(input).eq("slug", slug);
  if (error) throw error;
}

export async function deleteProject(slug: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("projects").delete().eq("slug", slug);
  if (error) throw error;
}
