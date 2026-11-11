"use server";

import mongoose from "mongoose";
import ConnectDB from "../mongodb";
import { Event } from "@/database";

export const getSimilarEventsByTags = async (
  eventId: string,
  limit: number = 3
) => {
  try {
    await ConnectDB();

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new Error("Invalid event ID");
    }

    const event = await Event.findById(eventId).select("_id tags").lean();
    if (!event) {
      throw new Error("Event not found");
    }

    const similarEvents = await Event.aggregate([
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
        $project: {
          matchedTags: 0,
        },
      },
      {
        $limit: limit,
      },
    ]);

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