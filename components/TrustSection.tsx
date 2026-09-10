import { getTranslations } from "next-intl/server";

export default async function TrustSection() {
  const t = await getTranslations("TrustSection");

  const points = [
    { title: t("point1Title"), desc: t("point1Desc") },
    { title: t("point2Title"), desc: t("point2Desc") },
    { title: t("point3Title"), desc: t("point3Desc") },
    { title: t("point4Title"), desc: t("point4Desc") },
  ];

  return (
    <section id="trust" className="scroll-mt-20 py-16">
      <div className="container-page">
        <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((point) => (
            <div key={point.title} className="rounded-xl2 bg-card p-5 shadow-card">
              <h3 className="font-semibold text-foreground">{point.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{point.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
