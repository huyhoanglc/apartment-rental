import { notFound } from "next/navigation";
import ListingForm from "@/components/admin/ListingForm";
import { getListingByCode } from "@/lib/listings";
import { getProjects } from "@/lib/projects";
import { saveListing } from "../../actions";

export default async function EditListingPage({ params }: { params: { code: string } }) {
  const [listing, projects] = await Promise.all([getListingByCode(params.code), getProjects()]);
  if (!listing) notFound();

  const action = saveListing.bind(null, listing.code);

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground">Sửa phòng — {listing.code}</h1>
      <div className="mt-4">
        <ListingForm action={action} projects={projects} initialListing={listing} />
      </div>
    </div>
  );
}
