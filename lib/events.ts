import { cacheLife, cacheTag } from "next/cache";

import Event, { type IEvent } from "@/database/event.model";
import connectDB from "@/lib/mongodb";

export type EventCardData = {
  title: string;
  image: string;
  description: string;
  slug: string;
  location: string;
  date: string;
  time: string;
};

export type EventDetailsData = EventCardData &
  Pick<
    IEvent,
    | "overview"
    | "venue"
    | "mode"
    | "audience"
    | "agenda"
    | "organizer"
    | "tags"
  > & {
    _id: string;
  };

export async function getEvents(): Promise<EventCardData[]> {
  "use cache";

  cacheLife("hours");
  cacheTag("events");

  await connectDB();

  return Event.find()
    .select("title image description slug location date time -_id")
    .sort({ createdAt: -1 })
    .lean<EventCardData[]>();
}

export async function getEventBySlug(
  slug: string,
): Promise<EventDetailsData | null> {
  "use cache";

  cacheLife("hours");
  cacheTag(`event-${slug}`);

  await connectDB();

  const event = await Event.findOne({ slug })
    .select(
      "title image description slug location date time overview venue mode audience agenda organizer tags _id",
    )
    .lean();

  if (!event) {
    return null;
  }

  return {
    _id: event._id.toString(),
    title: event.title,
    image: event.image,
    description: event.description,
    slug: event.slug,
    location: event.location,
    date: event.date,
    time: event.time,
    overview: event.overview,
    venue: event.venue,
    mode: event.mode,
    audience: event.audience,
    agenda: event.agenda,
    organizer: event.organizer,
    tags: event.tags,
  };
}
