import Image from "next/image";
import Link from "next/link";
import DeleteListingButton from "@/components/admin/DeleteListingButton";
import StatusSelect from "@/components/admin/StatusSelect";
import { getListings } from "@/lib/listings";
import { LISTING_TYPE_LABELS } from "@/lib/types";

export default async function AdminListingsPage() {
  const listings = await getListings();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tin thuê</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{listings.length} tin đang quản lý</p>
        </div>
        <Link
          href="/admin/listings/new"
          className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Thêm tin mới
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl2 border border-border bg-card shadow-card">
        {listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12 11.204 3.045a1.125 1.125 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-foreground">Chưa có tin thuê nào</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Bấm &quot;Thêm tin mới&quot; để đăng tin đầu tiên.
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Ảnh</th>
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Tiêu đề</th>
                <th className="px-4 py-3">Quận</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Giá</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr
                  key={listing.code}
                  className="border-b border-border transition last:border-0 hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-16 overflow-hidden rounded-md ring-1 ring-border">
                      <Image src={listing.image_url} alt={listing.title} fill className="object-cover" />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{listing.code}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-foreground">{listing.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{listing.district}</td>
                  <td className="px-4 py-3 text-muted-foreground">{LISTING_TYPE_LABELS[listing.type]}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{listing.price_million} triệu</td>
                  <td className="px-4 py-3">
                    <StatusSelect code={listing.code} status={listing.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/listings/${listing.code}/edit`}
                        className="text-sm font-medium text-primary-700 hover:underline dark:text-primary-300"
                      >
                        Sửa
                      </Link>
                      <DeleteListingButton code={listing.code} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
