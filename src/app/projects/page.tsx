import type { Metadata } from "next";
import { ProjectExplorer } from "@/components/projects/ProjectExplorer";

export const metadata: Metadata = { title: "Projects", description: "All public repositories, searchable and filterable." };

export default function ProjectsPage() {
  return <ProjectExplorer />;
}
