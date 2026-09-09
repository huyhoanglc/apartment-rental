import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary-900 text-white">
      <div className="absolute inset-0 opacity-20">
        <Image
          src="https://picsum.photos/seed/hero-hcmc/1600/700"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="container-page relative py-16 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-200">
          Tìm phòng trọ · Studio · Căn hộ tại TP.HCM
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          Thuê nhà nhanh, minh bạch — ảnh thật, giá thật, còn phòng là nhắn Zalo được ngay
        </h1>
        <p className="mt-4 max-w-xl text-base text-primary-100">
          Hàng trăm tin đăng được cập nhật trạng thái theo thời gian thực từ khắp các quận
          TP.HCM. Lọc theo khu vực, ngân sách và loại hình chỉ trong vài giây.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#listings"
            className="inline-flex items-center justify-center rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-primary-950 transition hover:bg-accent-400"
          >
            Xem tin thuê ngay
          </a>
          <a
            href="#ai-finder"
            className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            Nhờ trợ lý tìm giúp
          </a>
        </div>
      </div>
    </section>
  );
}
