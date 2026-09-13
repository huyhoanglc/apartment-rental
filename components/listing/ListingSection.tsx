"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import ListingCard from "@/components/listing/ListingCard";
import { DISTRICTS } from "@/data/constants";
import type { ListingType, ListingWithProject } from "@/lib/types";

interface ListingSectionProps {
  initialListings: ListingWithProject[];
  initialDistrict?: string;
}

const TYPE_OPTIONS: ListingType[] = ["phong_tro", "can_ho_dich_vu", "chung_cu", "nha_nguyen_can"];

/** Chạm mốc PRICE_MAX = không giới hạn trên (giống "Trên 10 triệu" của dropdown cũ). */
const PRICE_MIN = 0;
const PRICE_MAX = 30;
const PRICE_STEP = 0.5;
const DEFAULT_PRICE_RANGE: [number, number] = [PRICE_MIN, PRICE_MAX];

const THUMB_CLASS =
  "pointer-events-none absolute inset-x-0 top-1/2 h-0 w-full -translate-y-1/2 appearance-none bg-transparent " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 " +
  "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full " +
  "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-primary-600 [&::-webkit-slider-thumb]:shadow " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer " +
  "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white " +
  "[&::-moz-range-thumb]:bg-primary-600 [&::-moz-range-thumb]:shadow";

export default function ListingSection({ initialListings, initialDistrict = "" }: ListingSectionProps) {
  const t = useTranslations("ListingSection");
  const tTypes = useTranslations("ListingTypes");
  const [district, setDistrict] = useState(initialDistrict);
  const [type, setType] = useState<ListingType | "">("");
  const [priceRange, setPriceRange] = useState<[number, number]>(DEFAULT_PRICE_RANGE);
  const [committedPriceRange, setCommittedPriceRange] = useState<[number, number]>(DEFAULT_PRICE_RANGE);
  const [listings, setListings] = useState<ListingWithProject[]>(initialListings);
  const [loading, setLoading] = useState(false);
  const isFirstRun = useRef(true);

  // Kéo thanh trượt bắn onChange liên tục — chỉ "chốt" giá trị (kích hoạt fetch)
  // sau 400ms ngừng kéo, tránh gọi API dồn dập theo từng nấc kéo. Lần đầu mount
  // priceRange/committedPriceRange cùng trỏ tới DEFAULT_PRICE_RANGE (cùng
  // reference) nên setCommittedPriceRange ở đây là no-op, React tự bailout.
  useEffect(() => {
    const timer = setTimeout(() => setCommittedPriceRange(priceRange), 400);
    return () => clearTimeout(timer);
  }, [priceRange]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (district) params.set("district", district);
    if (type) params.set("type", type);
    if (committedPriceRange[0] > PRICE_MIN) params.set("minPrice", String(committedPriceRange[0]));
    if (committedPriceRange[1] < PRICE_MAX) params.set("maxPrice", String(committedPriceRange[1]));
    try {
      const res = await fetch(`/api/listings?${params.toString()}`);
      const data = await res.json();
      setListings(data.listings ?? []);
    } finally {
      setLoading(false);
    }
  }, [district, type, committedPriceRange]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    fetchListings();
  }, [fetchListings]);

  const hasPriceFilter = priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX;
  const priceLabel =
    priceRange[1] >= PRICE_MAX
      ? priceRange[0] > PRICE_MIN
        ? t("priceRangeOpenMax", { min: priceRange[0] })
        : t("priceAny")
      : t("priceRange", { min: priceRange[0], max: priceRange[1] });

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

        <div className="min-w-[220px] flex-1 rounded-lg border border-border bg-card px-3 py-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">{t("priceLabel")}</span>
            <span className="font-semibold text-primary-700 dark:text-primary-300">{priceLabel}</span>
          </div>
          <div className="relative mt-2.5 h-4">
            <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted" />
            <div
              className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary-600"
              style={{
                left: `${((priceRange[0] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
                right: `${100 - ((priceRange[1] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
              }}
            />
            <input
              type="range"
              aria-label={t("priceMinAriaLabel")}
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={priceRange[0]}
              onChange={(e) =>
                setPriceRange(([, max]) => [Math.min(Number(e.target.value), max - PRICE_STEP), max])
              }
              className={THUMB_CLASS}
            />
            <input
              type="range"
              aria-label={t("priceMaxAriaLabel")}
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange(([min]) => [min, Math.max(Number(e.target.value), min + PRICE_STEP)])
              }
              className={THUMB_CLASS}
            />
          </div>
        </div>

        {(district || type || hasPriceFilter) && (
          <button
            type="button"
            onClick={() => {
              setDistrict("");
              setType("");
              setPriceRange(DEFAULT_PRICE_RANGE);
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
