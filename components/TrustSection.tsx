const POINTS = [
  {
    title: "Ảnh thật, không dùng ảnh minh hoạ",
    desc: "Mỗi tin đăng đều có ảnh chụp thực tế phòng/căn hộ, cập nhật khi có thay đổi.",
  },
  {
    title: "Trạng thái theo thời gian thực",
    desc: "Còn phòng, đang hot hay đã hết phòng đều được cập nhật liên tục, tránh mất thời gian đi xem hụt.",
  },
  {
    title: "Không thu phí người thuê",
    desc: "Toàn bộ thông tin liên hệ và tư vấn qua Zalo đều miễn phí cho người tìm nhà.",
  },
  {
    title: "Hỗ trợ tận nơi",
    desc: "Đội ngũ tư vấn hỗ trợ đặt lịch xem phòng và giải đáp thắc mắc qua Zalo trong ngày.",
  },
];

export default function TrustSection() {
  return (
    <section id="trust" className="scroll-mt-20 py-16">
      <div className="container-page">
        <h2 className="text-2xl font-bold text-slate-900">Vì sao nên tìm thuê tại đây</h2>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map((point) => (
            <div key={point.title} className="rounded-xl2 bg-white p-5 shadow-card">
              <h3 className="font-semibold text-slate-900">{point.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{point.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
