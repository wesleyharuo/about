import type { Metadata } from "next";
import { SkillNetwork } from "@/components/skill-network/SkillNetwork";
import { CertRoadmap } from "@/components/certifications/CertRoadmap";

export const metadata: Metadata = { title: "Skills" };

export default function SkillsPage() {
  return (
    <div className="pt-16">
      <SkillNetwork />
      <CertRoadmap />
    </div>
  );
}
