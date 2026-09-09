import AiFinder from "@/components/AiFinder";
import DistrictLinks from "@/components/DistrictLinks";
import Hero from "@/components/Hero";
import ListingSection from "@/components/ListingSection";
import TrustSection from "@/components/TrustSection";
import { getListings } from "@/lib/listings";

export default async function Home({
  searchParams,
}: {
  searchParams: { district?: string };
}) {
  const district = searchParams.district;
  const initialListings = await getListings(district ? { district } : {});

  return (
    <>
      <Hero />
      <ListingSection initialListings={initialListings} initialDistrict={district ?? ""} />
      <DistrictLinks />
      <AiFinder />
      <TrustSection />
    </>
  );
}
