"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import ListingCard from "@/components/ListingCard";
import { DISTRICTS, type ListingType, type ListingWithProject } from "@/lib/types";

interface ListingSectionProps {
  initialListings: ListingWithProject[];
  initialDistrict?: string;
}

const TYPE_OPTIONS: ListingType[] = [
  "phong_tro",
  "studio",
  "can_ho_mini",
  "can_ho_dich_vu",
  "nha_nguyen_can",
];

const PRICE_OPTIONS: { key: string; min?: number; max?: number }[] = [
  { key: "priceUnder3", max: 3 },
  { key: "price3to6", min: 3, max: 6 },
  { key: "price6to10", min: 6, max: 10 },
  { key: "priceOver10", min: 10 },
];

export default function ListingSection({ initialListings, initialDistrict = "" }: ListingSectionProps) {
  const t = useTranslations("ListingSection");
  const tTypes = useTranslations("ListingTypes");
  const [district, setDistrict] = useState(initialDistrict);
  const [type, setType] = useState<ListingType | "">("");
  const [priceIdx, setPriceIdx] = useState<number | "">("");
  const [listings, setListings] = useState<ListingWithProject[]>(initialListings);
  const [loading, setLoading] = useState(false);
  const isFirstRun = useRef(true);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (district) params.set("district", district);
    if (type) params.set("type", type);
    if (priceIdx !== "") {
      const opt = PRICE_OPTIONS[priceIdx];
      if (opt.min != null) params.set("minPrice", String(opt.min));
      if (opt.max != null) params.set("maxPrice", String(opt.max));
    }
    try {
      const res = await fetch(`/api/listings?${params.toString()}`);
      const data = await res.json();
      setListings(data.listings ?? []);
    } finally {
      setLoading(false);
    }
  }, [district, type, priceIdx]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    fetchListings();
  }, [fetchListings]);

  return (
    <section id="listings" className="container-page scroll-mt-20 py-16">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <p className="text-sm text-muted-foreground">{t("matchCount", { count: listings.length })}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 rounded-xl2 bg-card p-4 shadow-card">
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
        >
          <option value="">{t("allDistricts")}</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value as ListingType | "")}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
        >
          <option value="">{t("allTypes")}</option>
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {tTypes(opt)}
            </option>
          ))}
        </select>

        <select
          value={priceIdx}
          onChange={(e) => setPriceIdx(e.target.value === "" ? "" : Number(e.target.value))}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
        >
          <option value="">{t("allBudgets")}</option>
          {PRICE_OPTIONS.map((opt, idx) => (
            <option key={opt.key} value={idx}>
              {t(opt.key)}
            </option>
          ))}
        </select>

        {(district || type || priceIdx !== "") && (
          <button
            type="button"
            onClick={() => {
              setDistrict("");
              setType("");
              setPriceIdx("");
            }}
            className="rounded-lg px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-900/40"
          >
            {t("clearFilters")}
          </button>
        )}
      </div>

      {loading ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">{t("loading")}</p>
      ) : listings.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.code} listing={listing} />
          ))}
        </div>
      )}
    </section>
  );
}
