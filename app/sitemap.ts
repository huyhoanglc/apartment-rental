import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getAllPublishedSlugsForSitemap } from "@/lib/blog";
import { getListings } from "@/lib/listings";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function localizedPath(locale: string, path: string): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${SITE_URL}${prefix}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, listings] = await Promise.all([
    getAllPublishedSlugsForSitemap(),
    // Sitemap build không được phép làm sập cả `next build` — vd DB chưa chạy
    // bản schema.sql mới nhất (bảng/cột mới chưa tồn tại).
    getListings().catch((err) => {
      console.error("[sitemap] getListings thất bại:", err instanceof Error ? err.message : err);
      return [];
    }),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    entries.push({ url: localizedPath(locale, "/"), changeFrequency: "daily", priority: 1 });
    entries.push({ url: localizedPath(locale, "/blog"), changeFrequency: "daily", priority: 0.7 });

    for (const post of posts) {
      entries.push({
        url: localizedPath(locale, `/blog/${post.slug}`),
        lastModified: post.updated_at,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }

    for (const listing of listings) {
      entries.push({
        url: localizedPath(locale, `/tin/${listing.code}`),
        lastModified: listing.updated_at,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  }

  return entries;
}
