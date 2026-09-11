"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DeleteBlogPostButton from "@/components/admin/DeleteBlogPostButton";
import PublishedToggle from "@/components/admin/PublishedToggle";
import FormModal from "@/components/admin/FormModal";
import BlogPostForm from "@/components/admin/BlogPostForm";
import { useToast } from "@/components/admin/Toast";
import { saveBlogPost } from "@/app/admin/(dashboard)/blog/actions";
import type { BlogPost } from "@/lib/types";

interface BlogManagerProps {
  posts: BlogPost[];
}

type ModalState = { mode: "create" } | { mode: "edit"; post: BlogPost } | null;

export default function BlogManager({ posts }: BlogManagerProps) {
  const [modal, setModal] = useState<ModalState>(null);
  const router = useRouter();
  const toast = useToast();

  function closeModal() {
    setModal(null);
  }

  function handleSuccess(message: string) {
    closeModal();
    toast.success(message);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Blog ({posts.length})</h1>
        <button
          type="button"
          onClick={() => setModal({ mode: "create" })}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          + Viết bài mới
        </button>
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
                    <button
                      type="button"
                      onClick={() => setModal({ mode: "edit", post })}
                      className="text-sm font-medium text-primary-700 hover:underline dark:text-primary-300"
                    >
                      Sửa
                    </button>
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

      {modal && (
        <FormModal
          title={modal.mode === "create" ? "Viết bài mới" : `Sửa bài viết — ${modal.post.title}`}
          onClose={closeModal}
        >
          <BlogPostForm
            key={modal.mode === "edit" ? modal.post.slug : "create"}
            action={saveBlogPost.bind(null, modal.mode === "edit" ? modal.post.slug : null)}
            initialPost={modal.mode === "edit" ? modal.post : undefined}
            onCancel={closeModal}
            onSuccess={() =>
              handleSuccess(modal.mode === "edit" ? "Đã cập nhật bài viết." : "Đã đăng bài viết mới.")
            }
          />
        </FormModal>
      )}
    </div>
  );
}
