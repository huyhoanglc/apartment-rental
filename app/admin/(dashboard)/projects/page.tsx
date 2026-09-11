import ProjectsManager from "@/components/admin/ProjectsManager";
import { getProjects } from "@/lib/projects";

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return <ProjectsManager projects={projects} />;
}
