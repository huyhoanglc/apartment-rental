import ProjectForm from "@/components/admin/ProjectForm";
import { saveProject } from "../actions";

export default function NewProjectPage() {
  const action = saveProject.bind(null, null);

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground">Thêm dự án mới</h1>
      <div className="mt-4">
        <ProjectForm action={action} />
      </div>
    </div>
  );
}
