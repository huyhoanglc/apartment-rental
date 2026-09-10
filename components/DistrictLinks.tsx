import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { DISTRICTS } from "@/lib/types";

export default async function DistrictLinks() {
  const t = await getTranslations("DistrictLinks");

  return (
    <section id="districts" className="scroll-mt-20 bg-card py-16">
      <div className="container-page">
        <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {DISTRICTS.map((district) => (
            <Link
              key={district}
              href={{ pathname: "/", query: { district }, hash: "listings" }}
              className="flex items-center justify-center rounded-xl2 border border-border bg-background px-4 py-4 text-sm font-medium text-foreground transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-primary-900/40 dark:hover:text-primary-300"
            >
              {district}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
