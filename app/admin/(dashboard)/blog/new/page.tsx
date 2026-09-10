import BlogPostForm from "@/components/admin/BlogPostForm";
import { saveBlogPost } from "../actions";

export default function NewBlogPostPage() {
  const action = saveBlogPost.bind(null, null);

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground">Viết bài mới</h1>
      <div className="mt-4">
        <BlogPostForm action={action} />
      </div>
    </div>
  );
}
