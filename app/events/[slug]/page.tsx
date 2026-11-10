import { notFound } from "next/navigation";

import EventDetails, {
  type EventDetailsProps,
} from "@/components/EventDetails";

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
  if (!isValidSlug(slug)) return null;

  const baseUrl = process.env.NEXT_PUBLIC_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_URL is not configured.");
  }

  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}/api/events/${encodeURIComponent(slug)}`,
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Event API request failed with status ${response.status}.`);
  }

  const result = (await response.json()) as EventApiResponse;
  return result.event;
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.trim().toLowerCase();

  const event = await getEvent(slug);
  if (!event) notFound();

  return <EventDetails {...event} />;
}
