"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ListingCard from "@/components/ListingCard";
import { DISTRICTS, LISTING_TYPE_LABELS, type Listing, type ListingType } from "@/lib/types";

interface ListingSectionProps {
  initialListings: Listing[];
  initialDistrict?: string;
}

const TYPE_OPTIONS: ListingType[] = [
  "phong_tro",
  "studio",
  "can_ho_mini",
  "can_ho_dich_vu",
  "nha_nguyen_can",
];

const PRICE_OPTIONS: { label: string; min?: number; max?: number }[] = [
  { label: "Dưới 3 triệu", max: 3 },
  { label: "3 - 6 triệu", min: 3, max: 6 },
  { label: "6 - 10 triệu", min: 6, max: 10 },
  { label: "Trên 10 triệu", min: 10 },
];

export default function ListingSection({ initialListings, initialDistrict = "" }: ListingSectionProps) {
  const [district, setDistrict] = useState(initialDistrict);
  const [type, setType] = useState<ListingType | "">("");
  const [priceIdx, setPriceIdx] = useState<number | "">("");
  const [listings, setListings] = useState<Listing[]>(initialListings);
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
          <h2 className="text-2xl font-bold text-slate-900">Tin thuê mới cập nhật</h2>
          <p className="mt-1 text-sm text-slate-500">
            Lọc theo khu vực, ngân sách và loại hình để tìm nhanh chỗ ở phù hợp.
          </p>
        </div>
        <p className="text-sm text-slate-400">{listings.length} tin phù hợp</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 rounded-xl2 bg-white p-4 shadow-card">
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none"
        >
          <option value="">Tất cả khu vực</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value as ListingType | "")}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none"
        >
          <option value="">Tất cả loại hình</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {LISTING_TYPE_LABELS[t]}
            </option>
          ))}
        </select>

        <select
          value={priceIdx}
          onChange={(e) => setPriceIdx(e.target.value === "" ? "" : Number(e.target.value))}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none"
        >
          <option value="">Mọi ngân sách</option>
          {PRICE_OPTIONS.map((opt, idx) => (
            <option key={opt.label} value={idx}>
              {opt.label}
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
            className="rounded-lg px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50"
          >
            Xoá lọc
          </button>
        )}
      </div>

      {loading ? (
        <p className="mt-10 text-center text-sm text-slate-400">Đang tải...</p>
      ) : listings.length === 0 ? (
        <p className="mt-10 text-center text-sm text-slate-400">
          Không có tin nào phù hợp với bộ lọc hiện tại.
        </p>
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
