import Link from "next/link";
import ListingForm from "@/components/admin/ListingForm";
import { getProjects } from "@/lib/projects";
import { saveListing } from "../actions";

export default async function NewListingPage() {
  const projects = await getProjects();
  const action = saveListing.bind(null, null);

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground">Thêm phòng mới</h1>

      {projects.length === 0 ? (
        <div className="mt-4 rounded-xl2 border border-border bg-card p-6 text-sm text-muted-foreground">
          Chưa có dự án nào. Cần tạo ít nhất 1 dự án trước khi thêm phòng.
          <Link
            href="/admin/projects/new"
            className="mt-3 inline-block rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            + Tạo dự án
          </Link>
        </div>
      ) : (
        <div className="mt-4">
          <ListingForm action={action} projects={projects} />
        </div>
      )}
    </div>
  );
}
