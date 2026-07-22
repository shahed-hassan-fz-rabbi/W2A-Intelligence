import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 text-center">
        <p className="text-5xl font-bold text-brand-600">404</p>
        <h1 className="mt-3 text-lg font-semibold text-ink">Page not found</h1>
        <p className="mt-1.5 text-sm text-muted">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}