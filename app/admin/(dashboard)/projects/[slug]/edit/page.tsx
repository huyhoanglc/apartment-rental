import { notFound } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";
import { getProjectBySlug } from "@/lib/projects";
import { saveProject } from "../../actions";

export default async function EditProjectPage({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();

  const action = saveProject.bind(null, project.slug);

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground">Sửa dự án — {project.name}</h1>
      <div className="mt-4">
        <ProjectForm action={action} initialProject={project} />
      </div>
    </div>
  );
}
