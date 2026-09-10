"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import ZaloButton from "@/components/ZaloButton";
import type { Listing } from "@/lib/types";

const STATUS_STYLES: Record<Listing["status"], string> = {
  con_phong: "bg-status-available/10 text-status-available",
  hot: "bg-status-hot/10 text-status-hot",
  het_phong: "bg-status-full/10 text-status-full",
};

export default function ListingCard({ listing }: { listing: Listing }) {
  const t = useTranslations("ListingCard");
  const tTypes = useTranslations("ListingTypes");
  const tStatus = useTranslations("ListingStatus");

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl2 bg-card shadow-card transition hover:shadow-card-hover">
      <Link href={`/tin/${listing.code}`} className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={listing.image_url}
          alt={listing.title}
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[listing.status]} bg-card/90`}
        >
          {tStatus(listing.status)}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
          {listing.code}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/tin/${listing.code}`} className="line-clamp-2 font-semibold text-foreground hover:text-primary-700 dark:hover:text-primary-300">
          {listing.title}
        </Link>
        <p className="text-sm text-muted-foreground">
          {listing.ward ? `${listing.ward}, ` : ""}
          {listing.district}
        </p>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="font-semibold text-primary-700">
            {t("pricePerMonth", { price: listing.price_million })}
          </span>
          <span>·</span>
          <span>{t("area", { area: listing.area })}</span>
          <span>·</span>
          <span>{tTypes(listing.type)}</span>
        </div>

        <div className="mt-1 flex flex-wrap gap-1.5">
          {listing.amenities.slice(0, 3).map((amenity) => (
            <span
              key={amenity}
              className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
            >
              {amenity}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-3">
          <ZaloButton code={listing.code} title={listing.title} className="w-full" />
        </div>
      </div>
    </div>
  );
}
