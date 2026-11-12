"use cache";

import EeventCard from "@/components/EeventCard";
import type { IEvent } from "@/database/event.model";
import { cacheLife, cacheTag } from "next/cache";

type EventsResponse = {
  events?: IEvent[];
};

async function getEvents(): Promise<IEvent[]> {
  "use cache";

  cacheLife("hours");
  cacheTag("events");

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"}/api/events`,
    );

    if (!response.ok) {
      throw new Error(`Event request failed with status ${response.status}.`);
    }

    const result = (await response.json()) as EventsResponse;
    return result.events ?? [];
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export default async function EventsPage() {
  const events = await getEvents();

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
          <span>{events.length} events</span>
        </div>

        {events.length === 0 ? (
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
