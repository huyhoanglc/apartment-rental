const ZALO_CONTACT = process.env.NEXT_PUBLIC_ZALO_CONTACT || "0901234567";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-page grid gap-8 py-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-lg font-bold text-primary-700">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
              TT
            </span>
            Tổ Thuê TP.HCM
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Kênh tìm phòng trọ, studio, căn hộ cho thuê tại TP.HCM — tin đăng có ảnh thật, cập
            nhật trạng thái còn phòng/hết phòng theo thời gian thực.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Liên hệ</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li>Hotline/Zalo: {ZALO_CONTACT}</li>
            <li>Email: lienhe@tothuetphcm.vn</li>
            <li>Địa chỉ: TP. Hồ Chí Minh, Việt Nam</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Khu vực nổi bật</h3>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-500">
            <li>Quận 1</li>
            <li>Quận 7</li>
            <li>Bình Thạnh</li>
            <li>Phú Nhuận</li>
            <li>Gò Vấp</li>
            <li>Thủ Đức</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Tổ Thuê TP.HCM. Mọi thông tin tin đăng mang tính chất tham
        khảo.
      </div>
    </footer>
  );
}
