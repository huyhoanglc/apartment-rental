import Link from "next/link";
import { DISTRICTS } from "@/lib/types";

export default function DistrictLinks() {
  return (
    <section id="districts" className="scroll-mt-20 bg-white py-16">
      <div className="container-page">
        <h2 className="text-2xl font-bold text-slate-900">Tìm theo khu vực</h2>
        <p className="mt-1 text-sm text-slate-500">
          Chọn quận bạn muốn ở để xem ngay các tin thuê đang có.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {DISTRICTS.map((district) => (
            <Link
              key={district}
              href={`/?district=${encodeURIComponent(district)}#listings`}
              className="flex items-center justify-center rounded-xl2 border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
            >
              {district}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
