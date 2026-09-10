import Link from "next/link";
import DeleteBlogPostButton from "@/components/admin/DeleteBlogPostButton";
import PublishedToggle from "@/components/admin/PublishedToggle";
import { getAllBlogPostsAdmin } from "@/lib/admin/blog";

export default async function AdminBlogPage() {
  const posts = await getAllBlogPostsAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Blog ({posts.length})</h1>
        <Link
          href="/admin/blog/new"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          + Viết bài mới
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl2 bg-card shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-4 py-3">Tiêu đề</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.slug} className="border-b border-border last:border-0">
                <td className="max-w-xs truncate px-4 py-3 font-medium text-foreground">
                  {post.title}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{post.slug}</td>
                <td className="px-4 py-3">
                  <PublishedToggle slug={post.slug} published={post.published} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/blog/${post.slug}/edit`}
                      className="text-sm font-medium text-primary-700 hover:underline dark:text-primary-300"
                    >
                      Sửa
                    </Link>
                    <DeleteBlogPostButton slug={post.slug} />
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Chưa có bài viết nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
