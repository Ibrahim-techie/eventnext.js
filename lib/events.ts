import { cacheLife, cacheTag } from "next/cache";

import Event from "@/database/event.model";
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
