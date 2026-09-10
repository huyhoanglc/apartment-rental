"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { DISTRICTS } from "@/lib/types";

type Status = "idle" | "loading" | "success" | "error";

export default function LeadForm({ defaultNoteCode }: { defaultNoteCode?: string }) {
  const t = useTranslations("LeadForm");
  const initialNote = defaultNoteCode ? t("defaultNoteForCode", { code: defaultNoteCode }) : "";

  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [budget, setBudget] = useState("");
  const [note, setNote] = useState(initialNote);
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          district: district || undefined,
          budget_million: budget ? Number(budget) : undefined,
          note: note || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setPhone("");
      setBudget("");
      setNote(initialNote);
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl2 bg-status-available/10 p-5 text-sm font-medium text-status-available">
        {t("success")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl2 bg-card p-5 shadow-card">
      <div>
        <label className="text-sm font-medium text-foreground">{t("phoneLabel")}</label>
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t("phonePlaceholder")}
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-foreground">{t("districtLabel")}</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
          >
            <option value="">{t("districtPlaceholder")}</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">{t("budgetLabel")}</label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="5"
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">{t("noteLabel")}</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder={t("notePlaceholder")}
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none"
        />
      </div>

      {status === "error" && <p className="text-sm text-rose-600">{t("error")}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
      >
        {status === "loading" ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
