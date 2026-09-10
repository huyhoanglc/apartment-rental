import { demoBlogPosts } from "@/data/blogPosts";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { BlogPost } from "@/lib/types";

const PAGE_SIZE = 10;

export interface BlogListResult {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getPublishedBlogPosts(page = 1): Promise<BlogListResult> {
  const safePage = Math.max(1, page);

  if (!isSupabaseConfigured || !supabase) {
    const sorted = [...demoBlogPosts]
      .filter((p) => p.published)
      .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
    const start = (safePage - 1) * PAGE_SIZE;
    return {
      posts: sorted.slice(start, start + PAGE_SIZE),
      total: sorted.length,
      page: safePage,
      pageSize: PAGE_SIZE,
    };
  }

  const from = (safePage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("blog_posts")
    .select("*", { count: "exact" })
    .eq("published", true)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return { posts: data ?? [], total: count ?? 0, page: safePage, pageSize: PAGE_SIZE };
}

/** Dùng cho app/sitemap.ts — chỉ lấy slug + updated_at, không phân trang. */
export async function getAllPublishedSlugsForSitemap(): Promise<
  { slug: string; updated_at: string }[]
> {
  if (!isSupabaseConfigured || !supabase) {
    return demoBlogPosts
      .filter((p) => p.published)
      .map((p) => ({ slug: p.slug, updated_at: p.updated_at }));
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("published", true);

  if (error) {
    // Sitemap build không được phép làm sập cả `next build` — vd bảng
    // blog_posts chưa tồn tại vì project chưa chạy bản schema.sql mới nhất.
    console.error("[getAllPublishedSlugsForSitemap]", error.message);
    return [];
  }
  return data ?? [];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured || !supabase) {
    return demoBlogPosts.find((p) => p.slug === slug && p.published) ?? null;
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}
