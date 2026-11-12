export default function EventsLoading() {
  return (
    <section className="events-page" aria-busy="true" aria-label="Loading events">
      <div className="events-page-header animate-pulse">
        <div className="h-4 w-40 rounded bg-dark-200" />
        <div className="h-16 w-72 rounded bg-dark-200" />
        <div className="h-12 w-full max-w-xl rounded bg-dark-200" />
      </div>
      <div className="events-page-list">
        <div className="h-8 w-48 animate-pulse rounded bg-dark-200" />
        <ul className="events">
          {Array.from({ length: 6 }, (_, index) => (
            <li
              className="h-80 animate-pulse rounded-lg bg-dark-100"
              key={index}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
