import ListingsManager from "@/components/admin/ListingsManager";
import { getListings } from "@/lib/listings";
import { getProjects } from "@/lib/projects";

export default async function AdminListingsPage() {
  const [listings, projects] = await Promise.all([getListings(), getProjects()]);

  return <ListingsManager listings={listings} projects={projects} />;
}
