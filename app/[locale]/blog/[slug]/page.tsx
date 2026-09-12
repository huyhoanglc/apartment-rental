import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getBlogPostBySlug } from "@/lib/blog";
import { formatVNDate } from "@/lib/formatDate";

interface PageProps {
  params: { locale: string; slug: string };
}

export async function generateMetadata({ params: { slug } }: PageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Không tìm thấy bài viết" };

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || undefined,
  };
}

export default async function BlogPostPage({ params: { locale, slug } }: PageProps) {
  setRequestLocale(locale);
  const t = await getTranslations("Blog");

  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // JSON-LD Article schema — không dùng dangerouslySetInnerHTML cho nội dung
  // bài viết (chỉ dùng cho khối script này, dữ liệu do chính app tạo ra, an
  // toàn XSS). Nội dung markdown bên dưới render qua react-markdown mặc định
  // (không bật rehype-raw) nên không lọt HTML thô từ content, tránh XSS.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description || post.excerpt || undefined,
    image: post.cover_image_url || undefined,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: "Tổ Thuê TP.HCM" },
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
  };

  return (
    <div className="container-page py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary-700 dark:hover:text-primary-300">
          {t("breadcrumbHome")}
        </Link>{" "}
        /{" "}
        <Link href="/blog" className="hover:text-primary-700 dark:hover:text-primary-300">
          {t("breadcrumbBlog")}
        </Link>{" "}
        / <span className="text-foreground">{post.title}</span>
      </nav>

      <article className="mx-auto mt-4 max-w-3xl">
        {post.cover_image_url && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl2">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              sizes="(min-width: 1024px) 768px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        <h1 className="mt-6 text-3xl font-bold text-foreground">{post.title}</h1>
        {post.published_at && (
          <p className="mt-2 text-sm text-muted-foreground">
            {formatVNDate(post.published_at)}
          </p>
        )}

        <div className="prose prose-slate mt-6 max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-a:text-primary-700 dark:prose-a:text-primary-300 prose-strong:text-foreground">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
