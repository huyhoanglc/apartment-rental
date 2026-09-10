"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function AiFinder() {
  const t = useTranslations("AiFinder");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    { role: "assistant", text: t("greeting") },
  ]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", text }, { role: "assistant", text: t("demoReply") }]);
    setInput("");
  }

  return (
    <section id="ai-finder" className="scroll-mt-20 bg-primary-950 py-16 text-white">
      <div className="container-page grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-200">
            {t("badge")}
          </p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{t("title")}</h2>
          <p className="mt-3 max-w-md text-primary-100">{t("subtitle")}</p>
        </div>

        <div className="rounded-xl2 bg-card p-4 text-foreground shadow-card">
          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] rounded-xl px-4 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-primary-600 text-white"
                    : "bg-muted text-foreground"
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
              placeholder={t("placeholder")}
              className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              {t("send")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
