import profileJson from "@/data/profile.json";
import experienceJson from "@/data/experience.json";
import projectsJson from "@/data/projects.json";
import certificationsJson from "@/data/certifications.json";
import publicationsJson from "@/data/publications.json";
import skillsJson from "@/data/skills.json";
import visualizationsJson from "@/data/visualizations.json";
import type {
  Certification,
  Experience,
  Profile,
  Project,
  Publication,
  SkillsData,
  Visualization,
} from "./types";

// The "API" of a static site: typed accessors over build-time JSON.
// Swap any of these for fetch() calls later without touching components.
export const profile = profileJson as Profile;
export const experience = experienceJson as Experience[];
export const projects = projectsJson as Project[];
export const certifications = certificationsJson as Certification[];
export const publications = publicationsJson as Publication[];
export const skills = skillsJson as SkillsData;
export const visualizations = visualizationsJson as Visualization[];
