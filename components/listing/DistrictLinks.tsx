import { getTranslations } from "next-intl/server";
import { DISTRICTS } from "@/data/constants";
import { getDistrictStats } from "@/lib/listings";
import DistrictSlider from "@/components/listing/DistrictSlider";

export default async function DistrictLinks() {
  const t = await getTranslations("DistrictLinks");
  const stats = await getDistrictStats();

  const items = DISTRICTS.map((district) => {
    const districtStats = stats[district] ?? { projectCount: 0, listingCount: 0 };
    return {
      district,
      statLabel: t("districtStats", {
        projects: districtStats.projectCount,
        listings: districtStats.listingCount,
      }),
    };
  });

  return (
    <section id="districts" className="scroll-mt-20 bg-card py-16">
      <div className="container-page">
        <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="container-page mt-6">
        <DistrictSlider items={items} />
      </div>
    </section>
  );
}
