import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import LeadForm from "@/components/LeadForm";
import ZaloButton from "@/components/ZaloButton";
import { getListingByCode } from "@/lib/listings";
import { LISTING_STATUS_LABELS, LISTING_TYPE_LABELS } from "@/lib/types";

interface PageProps {
  params: { code: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const listing = await getListingByCode(params.code);
  if (!listing) return { title: "Không tìm thấy tin thuê" };
  return {
    title: `${listing.title} — ${listing.code} | Tổ Thuê TP.HCM`,
    description: listing.description ?? undefined,
  };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const listing = await getListingByCode(params.code);
  if (!listing) notFound();

  const gallery = listing.image_urls.length > 0 ? listing.image_urls : [listing.image_url];

  return (
    <div className="container-page py-10">
      <nav className="text-sm text-slate-400">
        <a href="/" className="hover:text-primary-700">
          Trang chủ
        </a>{" "}
        / <span className="text-slate-600">{listing.code}</span>
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
                  alt={`${listing.title} - ảnh ${idx + 2}`}
                  fill
                  sizes="(min-width: 1024px) 320px, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Mã căn: {listing.code}
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
              {LISTING_STATUS_LABELS[listing.status]}
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold text-slate-900">{listing.title}</h1>
          <p className="mt-1 text-slate-500">
            {listing.ward ? `${listing.ward}, ` : ""}
            {listing.district}
          </p>

          <div className="mt-4 flex flex-wrap gap-6 rounded-xl2 bg-white p-5 shadow-card">
            <div>
              <p className="text-xs text-slate-400">Giá thuê</p>
              <p className="mt-1 font-semibold text-primary-700">{listing.price_million} triệu/tháng</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Diện tích</p>
              <p className="mt-1 font-semibold text-slate-800">{listing.area} m²</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Loại hình</p>
              <p className="mt-1 font-semibold text-slate-800">{LISTING_TYPE_LABELS[listing.type]}</p>
            </div>
          </div>

          {listing.description && (
            <div className="mt-6">
              <h2 className="font-semibold text-slate-900">Mô tả</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {listing.description}
              </p>
            </div>
          )}

          <div className="mt-6">
            <h2 className="font-semibold text-slate-900">Tiện ích</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {listing.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl2 bg-white p-5 shadow-card">
            <p className="text-sm text-slate-500">Liên hệ ngay để giữ chỗ</p>
            <p className="mt-1 text-2xl font-bold text-primary-700">
              {listing.price_million} triệu<span className="text-sm font-normal text-slate-400">/tháng</span>
            </p>
            <ZaloButton code={listing.code} title={listing.title} className="mt-4 w-full" />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Hoặc để lại nhu cầu, tư vấn sẽ gọi lại</p>
            <LeadForm defaultNote={`Quan tâm mã căn ${listing.code}`} />
          </div>
        </aside>
      </div>
    </div>
  );
}
