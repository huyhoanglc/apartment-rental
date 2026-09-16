import { createClient } from "@/lib/supabase/server";
import type { BlogPost, BlogPostInput } from "@/lib/types";

export interface BlogPostsPage {
  posts: BlogPost[];
  total: number;
}

export async function getAllBlogPostsAdmin(page: number = 1, pageSize: number = 20): Promise<BlogPostsPage> {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("blog_posts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { posts: data ?? [], total: count ?? 0 };
}

export async function getBlogPostBySlugAdmin(slug: string): Promise<BlogPost | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createBlogPost(input: BlogPostInput): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("blog_posts").insert({
    ...input,
    published_at: input.published ? new Date().toISOString() : null,
  });
  if (error) throw error;
}

export async function updateBlogPost(
  slug: string,
  input: Partial<BlogPostInput> & { publishedChanged?: boolean }
): Promise<void> {
  const supabase = createClient();
  const { publishedChanged, ...fields } = input;

  const payload: Record<string, unknown> = { ...fields };
  if (publishedChanged) {
    payload.published_at = fields.published ? new Date().toISOString() : null;
  }

  const { error } = await supabase.from("blog_posts").update(payload).eq("slug", slug);
  if (error) throw error;
}

export async function deleteBlogPost(slug: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("slug", slug);
  if (error) throw error;
}

export async function updateBlogPostPublished(slug: string, published: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("blog_posts")
    .update({ published, published_at: published ? new Date().toISOString() : null })
    .eq("slug", slug);
  if (error) throw error;
}
