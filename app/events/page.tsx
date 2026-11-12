"use cache";

import EeventCard from "@/components/EeventCard";
import type { IEvent } from "@/database/event.model";
import { cacheLife, cacheTag } from "next/cache";

type EventsResponse = {
  events?: IEvent[];
  message?: string;
};

type EventsResult = {
  events: IEvent[];
  error: string | null;
};

async function getEvents(): Promise<EventsResult> {
  "use cache";

  cacheLife("hours");
  cacheTag("events");

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"}/api/events`,
    );

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as
        | EventsResponse
        | null;
      throw new Error(
        result?.message ??
          `Event request failed with status ${response.status}.`,
      );
    }

    const result = (await response.json()) as EventsResponse;
    return { events: result.events ?? [], error: null };
  } catch (error) {
    console.error("Error fetching events:", error);
    return {
      events: [],
      error:
        error instanceof Error
          ? error.message
          : "Unable to load events. Please try again later.",
    };
  }
}

export default async function EventsPage() {
  const { events, error } = await getEvents();

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
