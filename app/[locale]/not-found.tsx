"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");
  const router = useRouter();

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">404</p>
      <h1 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">{t("title")}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{t("description")}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
        >
          {t("back")}
        </button>
        <Link
          href="/"
          className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          {t("home")}
        </Link>
      </div>
    </div>
  );
}
