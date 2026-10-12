import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container grid min-h-[80vh] place-items-center pt-16 text-center">
      <div>
        <p className="font-mono text-sm text-alert">ERROR 404 · row not found</p>
        <h1 className="mt-4 font-display text-5xl font-semibold">This record doesn&apos;t reconcile.</h1>
        <p className="mt-4 text-fg-muted">The page you asked for isn&apos;t in the dataset.</p>
        <Link href="/" className="btn-primary mt-8">Back to the data brain</Link>
      </div>
    </div>
  );
}
