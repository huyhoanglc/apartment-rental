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

// Dùng để đặt tên folder Drive khi mirror ảnh phòng (lib/googleDrive.ts) — chỉ
// cần tên, không cần cả bản ghi dự án.
export async function getProjectNameById(id: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("name")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data?.name ?? null;
}
