import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LeadForm from "@/components/LeadForm";
import ZaloButton from "@/components/ZaloButton";
import { getListingByCode } from "@/lib/listings";

interface PageProps {
  params: { locale: string; code: string };
}

export async function generateMetadata({ params: { locale, code } }: PageProps): Promise<Metadata> {
  const listing = await getListingByCode(code);
  if (!listing) {
    const t = await getTranslations({ locale, namespace: "ListingDetail" });
    return { title: t("notFoundTitle") };
  }
  return {
    title: `${listing.title} — ${listing.code} | Tổ Thuê TP.HCM`,
    description: listing.description ?? undefined,
  };
}

export default async function ListingDetailPage({ params: { locale, code } }: PageProps) {
  setRequestLocale(locale);

  const listing = await getListingByCode(code);
  if (!listing) notFound();

  const t = await getTranslations("ListingDetail");
  const tTypes = await getTranslations("ListingTypes");
  const tStatus = await getTranslations("ListingStatus");

  const gallery = listing.image_urls.length > 0 ? listing.image_urls : [listing.image_url];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description: listing.description || undefined,
    url: `${siteUrl}/tin/${listing.code}`,
    image: listing.image_url,
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.district,
      addressRegion: "Hồ Chí Minh",
      addressCountry: "VN",
    },
    offers: {
      "@type": "Offer",
      price: listing.price_million * 1_000_000,
      priceCurrency: "VND",
      availability:
        listing.status === "het_phong"
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
    },
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
        / <span className="text-foreground">{listing.code}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-xl2">
            <div className="relative col-span-2 aspect-[16/10] sm:col-span-1">
              <Image
                src={gallery[0]}
                alt={listing.title}
                fill
                sizes="(min-width: 1024px) 640px, 100vw"
                className="object-cover"
                priority
              />
            </div>
            {gallery.slice(1).map((url, idx) => (
              <div key={url} className="relative aspect-[16/10]">
                <Image
                  src={url}
                  alt={`${listing.title} - ${idx + 2}`}
                  fill
                  sizes="(min-width: 1024px) 320px, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {t("code", { code: listing.code })}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                listing.status === "con_phong"
                  ? "bg-status-available/10 text-status-available"
                  : listing.status === "hot"
                    ? "bg-status-hot/10 text-status-hot"
                    : "bg-status-full/10 text-status-full"
              }`}
            >
              {tStatus(listing.status)}
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold text-foreground">{listing.title}</h1>
          <p className="mt-1 text-muted-foreground">
            {listing.ward ? `${listing.ward}, ` : ""}
            {listing.district}
          </p>

          <div className="mt-4 flex flex-wrap gap-6 rounded-xl2 bg-card p-5 shadow-card">
            <div>
              <p className="text-xs text-muted-foreground">{t("priceLabel")}</p>
              <p className="mt-1 font-semibold text-primary-700 dark:text-primary-300">
                {t("priceValue", { price: listing.price_million })}
                {t("perMonth")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("areaLabel")}</p>
              <p className="mt-1 font-semibold text-foreground">{listing.area} m²</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("typeLabel")}</p>
              <p className="mt-1 font-semibold text-foreground">{tTypes(listing.type)}</p>
            </div>
          </div>

          {listing.description && (
            <div className="mt-6">
              <h2 className="font-semibold text-foreground">{t("descriptionTitle")}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {listing.description}
              </p>
            </div>
          )}

          <div className="mt-6">
            <h2 className="font-semibold text-foreground">{t("amenitiesTitle")}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {listing.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl2 bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">{t("contactBox")}</p>
            <p className="mt-1 text-2xl font-bold text-primary-700 dark:text-primary-300">
              {t("priceValue", { price: listing.price_million })}
              <span className="text-sm font-normal text-muted-foreground">{t("perMonth")}</span>
            </p>
            <ZaloButton code={listing.code} title={listing.title} className="mt-4 w-full" />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">{t("leadPrompt")}</p>
            <LeadForm defaultNoteCode={listing.code} />
          </div>
        </aside>
      </div>
    </div>
  );
}
