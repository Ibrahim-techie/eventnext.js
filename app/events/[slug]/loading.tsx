export default function EventLoading() {
  return (
    <article id="event" aria-busy="true" aria-label="Loading event">
      <div className="header animate-pulse">
        <div className="h-16 w-3/4 rounded bg-dark-200" />
        <div className="h-8 w-full rounded bg-dark-200" />
      </div>
      <div className="details">
        <div className="content animate-pulse">
          <div className="aspect-video w-full rounded-lg bg-dark-100" />
          <div className="h-40 w-full rounded bg-dark-100" />
        </div>
        <aside className="booking">
          <div className="h-64 w-full animate-pulse rounded-lg bg-dark-100" />
        </aside>
      </div>
    </article>
  );
}
