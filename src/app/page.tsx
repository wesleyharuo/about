import { Hero } from "@/components/hero/Hero";
import { ExecutiveDashboard } from "@/components/dashboard/ExecutiveDashboard";
import { CareerTimeline } from "@/components/timeline/CareerTimeline";
import { SkillNetwork } from "@/components/skill-network/SkillNetwork";
import { ImpactStories } from "@/components/impact/ImpactStories";
import { AnalyticsLab } from "@/components/analytics-lab/AnalyticsLab";
import { CertRoadmap } from "@/components/certifications/CertRoadmap";
import { PersonalAnalytics } from "@/components/personal-analytics/PersonalAnalytics";
import { Terminal } from "@/components/command-center/Terminal";
import { Manifesto } from "@/components/manifesto/Manifesto";
import { ContactHub } from "@/components/contact/ContactHub";

// The narrative order is the UX flow: hook → proof → depth → play → belief → action.
export default function Home() {
  return (
    <>
      <Hero />
      <ExecutiveDashboard />
      <CareerTimeline />
      <SkillNetwork />
      <ImpactStories />
      <AnalyticsLab />
      <CertRoadmap />
      <PersonalAnalytics />
      <Terminal />
      <Manifesto />
      <ContactHub />
    </>
  );
}
