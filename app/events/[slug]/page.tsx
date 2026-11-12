import { notFound } from "next/navigation";

import EventDetails, {
  type EventDetailsProps,
} from "@/components/EventDetails";
import { cacheLife } from "next/cache";
import { cacheTag } from "next/cache";

export const instant = false;

type EventPageProps = {
  params: Promise<{ slug: string }>;
};

const isValidSlug = (slug: string): boolean =>
  slug.length <= 100 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

type EventApiResponse = {
  event: EventDetailsProps;
};

async function getEvent(slug: string): Promise<EventDetailsProps | null> {

    "use cache";

  cacheLife("hours");
  cacheTag(`event-${slug}`);

  if (!isValidSlug(slug)) {
    return null;
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_URL is not configured.");
  }

  try {
    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/api/events/${encodeURIComponent(slug)}`,
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }

      throw new Error(`Failed to fetch event. Status: ${response.status}`);
    }

    const { event }: EventApiResponse = await response.json();

    return event;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error occurred while fetching event data:", error);
    }

    return null;
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.trim().toLowerCase();

  const event = await getEvent(slug);
  if (!event) notFound();

  return <EventDetails {...event} />;
}
