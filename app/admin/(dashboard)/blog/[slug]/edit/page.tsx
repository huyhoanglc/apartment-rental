import { notFound } from "next/navigation";
import BlogPostForm from "@/components/admin/BlogPostForm";
import { getBlogPostBySlugAdmin } from "@/lib/admin/blog";
import { saveBlogPost } from "../../actions";

export default async function EditBlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlugAdmin(params.slug);
  if (!post) notFound();

  const action = saveBlogPost.bind(null, post.slug);

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground">Sửa bài viết — {post.title}</h1>
      <div className="mt-4">
        <BlogPostForm action={action} initialPost={post} />
      </div>
    </div>
  );
}
