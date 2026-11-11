"use server";

import mongoose from "mongoose";
import { cacheLife } from "next/cache";
import ConnectDB from "../mongodb";
import { Event } from "@/database";

type SimilarEvent = {
  title: string;
  image: string;
  description: string;
  slug: string;
  location: string;
  date: string;
  time: string;
};

// The MongoDB driver reads Date.now() internally on every query. With Cache
// Components, that is an "unstable value" if it runs while the page is being
// prerendered, so the query lives in a cache scope: its result becomes part of
// the prerendered page and is refreshed on the same ~1 minute cadence as the
// event itself. Failures throw instead of returning, so they are never cached.
async function findSimilarEvents(
  eventId: string,
  limit: number
): Promise<SimilarEvent[]> {
  "use cache";
  cacheLife("minutes");

  await ConnectDB();

  const event = await Event.findById(eventId).select("_id tags").lean();
  if (!event) {
    throw new Error("Event not found");
  }

  return Event.aggregate<SimilarEvent>([
    {
      $match: {
        _id: { $ne: event._id },
        tags: { $in: event.tags },
      },
    },
    {
      $addFields: {
        matchedTags: {
          $size: {
            $setIntersection: ["$tags", event.tags],
          },
        },
      },
    },
    {
      $sort: {
        matchedTags: -1,
        createdAt: -1,
      },
    },
    {
      $limit: limit,
    },
    {
      // Cached values must be serializable, so return only plain fields
      // (no ObjectId or Date instances).
      $project: {
        _id: 0,
        title: 1,
        image: 1,
        description: 1,
        slug: 1,
        location: 1,
        date: 1,
        time: 1,
      },
    },
  ]);
}

export const getSimilarEventsByTags = async (
  eventId: string,
  limit: number = 3
) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new Error("Invalid event ID");
    }

    const similarEvents = await findSimilarEvents(eventId, limit);

    return {
      success: true,
      data: similarEvents,
    };
  } catch (error) {
    console.error("Error fetching similar events:", error);

    return {
      success: false,
      data: [],
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    };
  }
};
