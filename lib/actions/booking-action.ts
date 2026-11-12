"use server";

import mongoose from "mongoose";
import * as z from "zod";

import connectDB from "@/lib/mongodb";
import Booking from "@/database/booking.model";

const bookingSchema = z.object({
  email: z.email("Please enter a valid email address."),
  eventId: z.string().refine(
    (id) => mongoose.Types.ObjectId.isValid(id),
    {
      message: "Invalid event ID.",
    }
  ),
});

export const createBooking = async (
  email: string,
  eventId: string
) => {
  const result = bookingSchema.safeParse({
    email,
    eventId,
  });

  if (!result.success) {
    throw new Error(
      result.error.issues[0]?.message ??
        "Invalid booking data."
    );
  }

  const {
    email: validatedEmail,
    eventId: validatedEventId,
  } = result.data;

  try {
    await connectDB();

    await Booking.create({
      email: validatedEmail,
      eventId: validatedEventId,
    });

    return {
      success: true,
      message: "Your spot has been booked.",
    };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new Error(
        "This email has already booked this event."
      );
    }

    console.error("Error creating booking:", error);

    throw new Error(
      "Failed to create booking. Please try again later."
    );
  }
};