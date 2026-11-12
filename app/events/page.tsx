"use cache";

import EeventCard from "@/components/EeventCard";
import { getEvents, type EventCardData } from "@/lib/events";

export default async function EventsPage() {
  let events: EventCardData[] = [];
  let error: string | null = null;

  try {
    events = await getEvents();
  } catch (cause) {
    console.error("Error loading events:", cause);
    error =
      cause instanceof Error
        ? cause.message
        : "Unable to load events. Please try again later.";
  }

  return (
    <section className="events-page">
      <div className="events-page-header">
        <p className="events-page-eyebrow">Discover what&apos;s next</p>
        <h1>All Events</h1>
        <p className="events-page-description">
          Find your next opportunity to learn, connect, and build with the
          developer community.
        </p>
      </div>

      <div className="events-page-list">
        <div className="events-page-list-heading">
          <h2>Upcoming events</h2>
          {!error && <span>{events.length} events</span>}
        </div>

        {error ? (
          <div className="events-error" role="alert">
            <strong>Unable to load events.</strong>
            <span>{error}</span>
          </div>
        ) : events.length === 0 ? (
          <p className="events-empty">No events found.</p>
        ) : (
          <ul className="events">
            {events.map((event) => (
              <li key={event.slug}>
                <EeventCard
                  title={event.title}
                  imageUrl={event.image}
                  description={event.description}
                  slug={event.slug}
                  location={event.location}
                  date={event.date}
                  time={event.time}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
