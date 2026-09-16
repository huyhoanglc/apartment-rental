import BlogManager from "@/components/admin/BlogManager";
import { getAllBlogPostsAdmin } from "@/lib/admin/blog";

const PAGE_SIZE = 20;

export default async function AdminBlogPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const { posts, total } = await getAllBlogPostsAdmin(page, PAGE_SIZE);

  return <BlogManager posts={posts} total={total} page={page} pageSize={PAGE_SIZE} />;
}
