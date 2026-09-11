import BlogManager from "@/components/admin/BlogManager";
import { getAllBlogPostsAdmin } from "@/lib/admin/blog";

export default async function AdminBlogPage() {
  const posts = await getAllBlogPostsAdmin();

  return <BlogManager posts={posts} />;
}
