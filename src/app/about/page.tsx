import type { Metadata } from "next";
import { CareerTimeline } from "@/components/timeline/CareerTimeline";
import { Manifesto } from "@/components/manifesto/Manifesto";
import { ContactHub } from "@/components/contact/ContactHub";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="pt-16">
      <CareerTimeline />
      <Manifesto />
      <ContactHub />
    </div>
  );
}
