import type { Metadata } from "next";
import { DashboardGallery } from "@/components/viz/DashboardGallery";

export const metadata: Metadata = {
  title: "Dashboards",
  description: "Live Tableau Public workbooks, the Statistics Canada Power BI series and interactive command-center apps.",
};

export default function DashboardPage() {
  return <DashboardGallery />;
}
