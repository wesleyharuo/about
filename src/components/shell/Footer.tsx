import { profile } from "@/lib/data";
import { asset } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="border-t border-line/70 py-10">
      <div className="container flex flex-col items-start justify-between gap-4 text-sm text-fg-faint md:flex-row md:items-center">
        <p>
          © {new Date().getFullYear()} {profile.name} · {profile.location} ·{" "}
          <a href={asset("/classic/")} className="underline decoration-line underline-offset-4 hover:text-fg">Previous portfolio</a>
        </p>
      </div>
    </footer>
  );
}
