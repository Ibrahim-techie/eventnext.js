import { notFound } from "next/navigation";

import EventDetails, {
  type EventDetailsProps,
} from "@/components/EventDetails";
import { getEventBySlug } from "@/lib/events";

export const instant = false;

type EventPageProps = {
  params: Promise<{ slug: string }>;
};

const isValidSlug = (slug: string): boolean =>
  slug.length <= 100 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

async function getEvent(slug: string): Promise<EventDetailsProps | null> {
  if (!isValidSlug(slug)) {
    return null;
  }

  try {
    return await getEventBySlug(slug);
  } catch (error) {
    console.error("Error loading event:", error);
    throw error;
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.trim().toLowerCase();

  const event = await getEvent(slug);
  if (!event) notFound();

  return <EventDetails {...event} />;
}
