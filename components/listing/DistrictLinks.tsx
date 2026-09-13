import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { DISTRICTS } from "@/data/constants";
import { getDistrictStats } from "@/lib/listings";

export default async function DistrictLinks() {
  const t = await getTranslations("DistrictLinks");
  const stats = await getDistrictStats();

  return (
    <section id="districts" className="scroll-mt-20 bg-card py-16">
      <div className="container-page">
        <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {DISTRICTS.map((district) => {
            const districtStats = stats[district] ?? { projectCount: 0, listingCount: 0 };
            return (
              <Link
                key={district}
                href={{ pathname: "/", query: { district }, hash: "listings" }}
                className="flex flex-col items-center justify-center gap-1 rounded-xl2 border border-border bg-background px-4 py-4 text-center transition hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/40"
              >
                <span className="text-sm font-medium text-foreground hover:text-primary-700 dark:hover:text-primary-300">
                  {district}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("districtStats", {
                    projects: districtStats.projectCount,
                    listings: districtStats.listingCount,
                  })}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
