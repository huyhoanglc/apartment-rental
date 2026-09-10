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
        <h1 className="text-xl font-bold text-foreground">Tin thuê ({listings.length})</h1>
        <Link
          href="/admin/listings/new"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          + Thêm tin mới
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl2 bg-card shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
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
              <tr key={listing.code} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="relative h-12 w-16 overflow-hidden rounded-md">
                    <Image src={listing.image_url} alt={listing.title} fill className="object-cover" />
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{listing.code}</td>
                <td className="max-w-xs truncate px-4 py-3 text-foreground">{listing.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{listing.district}</td>
                <td className="px-4 py-3 text-muted-foreground">{LISTING_TYPE_LABELS[listing.type]}</td>
                <td className="px-4 py-3 text-muted-foreground">{listing.price_million} triệu</td>
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
      </div>
    </div>
  );
}
