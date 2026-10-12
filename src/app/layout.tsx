import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@/styles/globals.css";
import { Nav } from "@/components/shell/Nav";
import { Footer } from "@/components/shell/Footer";
import { AskWesley } from "@/components/ask/AskWesley";
import { profile } from "@/lib/data";

export const metadata: Metadata = {
  title: { default: "Inside Wesley's Data Brain", template: "%s · Wesley Kurosawa" },
  description: `${profile.name} — ${profile.title}. ${profile.mission}`,
  authors: [{ name: profile.name, url: profile.contact.linkedin }],
  keywords: ["Data Analyst", "Power BI", "SQL", "Python", "Tableau", "Financial Analytics", "Toronto", "Business Intelligence"],
  openGraph: {
    title: "Inside Wesley's Data Brain",
    description: profile.mission,
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#07090d", width: "device-width", initialScale: 1 };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  address: { "@type": "PostalAddress", addressRegion: "ON", addressCountry: "CA" },
  sameAs: [profile.contact.linkedin, profile.contact.github, profile.contact.orcid, profile.contact.tableau],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body
        className="min-h-screen font-sans"
        style={{ ["--font-sans" as string]: "var(--font-geist-sans)", ["--font-mono" as string]: "var(--font-geist-mono)", ["--font-display" as string]: "var(--font-geist-sans)" }}
      >
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-signal focus:px-3 focus:py-2 focus:text-ink">
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <AskWesley />
      </body>
    </html>
  );
}
