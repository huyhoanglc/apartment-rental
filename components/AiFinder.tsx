"use client";

import { useState } from "react";

const DEMO_REPLY =
  "Đây là bản demo giao diện — trợ lý AI tìm nhà thật sẽ được kết nối ở giai đoạn sau. " +
  "Trong lúc chờ, bạn có thể dùng bộ lọc ở mục \"Tin thuê mới cập nhật\" hoặc nhắn Zalo để được tư vấn trực tiếp.";

export default function AiFinder() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    {
      role: "assistant",
      text: "Chào bạn! Cho mình biết khu vực, ngân sách và loại phòng bạn đang tìm nhé.",
    },
  ]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", text }, { role: "assistant", text: DEMO_REPLY }]);
    setInput("");
  }

  return (
    <section id="ai-finder" className="scroll-mt-20 bg-primary-950 py-16 text-white">
      <div className="container-page grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-200">
            Sắp ra mắt
          </p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Trợ lý AI tìm nhà</h2>
          <p className="mt-3 max-w-md text-primary-100">
            Mô tả nhu cầu bằng ngôn ngữ tự nhiên, trợ lý sẽ gợi ý những tin thuê phù hợp nhất.
            Hiện tại đây là giao diện demo để bạn hình dung trải nghiệm.
          </p>
        </div>

        <div className="rounded-xl2 bg-white p-4 text-slate-900 shadow-card">
          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] rounded-xl px-4 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-primary-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="mt-4 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Vd: mình cần studio dưới 7 triệu ở Quận 7..."
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Gửi
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
