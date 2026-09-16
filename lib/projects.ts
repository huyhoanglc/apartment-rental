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

export interface ProjectsPage {
  projects: Project[];
  total: number;
}

/**
 * Bản có phân trang của getProjects(), dùng riêng cho trang quản lý
 * /admin/projects (bảng danh sách) — KHÔNG dùng ở nơi cần đủ danh sách dự án
 * (vd. dropdown chọn dự án khi thêm/sửa phòng ở ListingsManager) vì những chỗ
 * đó cần toàn bộ, không được cắt trang.
 */
export async function getProjectsPage(page: number = 1, pageSize: number = 20): Promise<ProjectsPage> {
  if (!isSupabaseConfigured || !supabase) {
    const sorted = [...demoProjects].sort((a, b) => a.name.localeCompare(b.name));
    const from = (page - 1) * pageSize;
    return { projects: sorted.slice(from, from + pageSize), total: sorted.length };
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("projects")
    .select("*", { count: "exact" })
    .order("name")
    .range(from, to);

  if (error) throw error;
  return { projects: data ?? [], total: count ?? 0 };
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
