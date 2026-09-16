import ProjectsManager from "@/components/admin/ProjectsManager";
import { getProjectsPage } from "@/lib/projects";

const PAGE_SIZE = 20;

export default async function AdminProjectsPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const { projects, total } = await getProjectsPage(page, PAGE_SIZE);

  return <ProjectsManager projects={projects} total={total} page={page} pageSize={PAGE_SIZE} />;
}
