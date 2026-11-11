import Link from "next/link";

export default function EventNotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <p className="pill">404</p>
      <h1>Event not found</h1>
      <p className="max-w-xl text-light-100">
        We could not find the event you are looking for. It may have been
        removed or the link may be incorrect.
      </p>
      <Link
        href="/"
        className="rounded-full border border-dark-200 bg-dark-100 px-8 py-3.5 text-light-100 transition-colors hover:bg-dark-200 focus-visible:outline-2 focus-visible:outline-primary"
      >
        Browse events
      </Link>
    </section>
  );
}
