import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublishedBlogPosts } from "@/lib/blog";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Blog" });
  return { title: `${t("title")} | Tổ Thuê TP.HCM`, description: t("subtitle") };
}

export default async function BlogListPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { page?: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations("Blog");

  const page = Math.max(1, Number(searchParams.page) || 1);
  const { posts, total, pageSize } = await getPublishedBlogPosts(page);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
      <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>

      {posts.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex flex-col overflow-hidden rounded-xl2 bg-card shadow-card transition hover:shadow-card-hover"
            >
              {post.cover_image_url && (
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={post.cover_image_url}
                    alt={post.title}
                    fill
                    sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h2 className="line-clamp-2 font-semibold text-foreground">{post.title}</h2>
                {post.excerpt && (
                  <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                )}
                <span className="mt-auto pt-2 text-sm font-medium text-primary-700 dark:text-primary-300">
                  {t("readMore")} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4 text-sm">
          <Link
            href={{ pathname: "/blog", query: { page: page - 1 } }}
            aria-disabled={page <= 1}
            className={`rounded-lg border border-border px-4 py-2 font-medium text-foreground hover:bg-muted ${
              page <= 1 ? "pointer-events-none opacity-40" : ""
            }`}
          >
            {t("prev")}
          </Link>
          <span className="text-muted-foreground">{t("pageInfo", { page, totalPages })}</span>
          <Link
            href={{ pathname: "/blog", query: { page: page + 1 } }}
            aria-disabled={page >= totalPages}
            className={`rounded-lg border border-border px-4 py-2 font-medium text-foreground hover:bg-muted ${
              page >= totalPages ? "pointer-events-none opacity-40" : ""
            }`}
          >
            {t("next")}
          </Link>
        </div>
      )}
    </div>
  );
}
