"use server";

import mongoose from "mongoose";
import * as z from "zod";
import { createBookingConfirmationEmail } from "@/templates/booking-confirmation";
import mailGenerator from "@/lib/mailgen";
import { sendMail } from "@/lib/mail";
import connectDB from "@/lib/mongodb";
import Booking from "@/database/booking.model";
import Event from "@/database/event.model";

const bookingSchema = z.object({
  email: z.email("Please enter a valid email address."),
  eventId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid event ID.",
  }),
});

export const createBooking = async (email: string, eventId: string) => {
  const result = bookingSchema.safeParse({
    email,
    eventId,
  });

  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Invalid booking data.");
  }

  const { email: validatedEmail, eventId: validatedEventId } = result.data;

  try {
    await connectDB();

    const event = await Event.findById(validatedEventId)
      .select("title date")
      .lean();

    if (!event) {
      throw new Error("Event not found.");
    }

    const booking = await Booking.create({
      email: validatedEmail,
      eventId: validatedEventId,
    });

    let recipientRejected = false;

    try {
      const email = createBookingConfirmationEmail({
        email: validatedEmail,
        eventName: event.title,
        eventDate: event.date,
      });

      const mailResult = await sendMail({
        to: validatedEmail,
        subject: `Booking confirmed: ${event.title}`,
        html: mailGenerator.generate(email),
      });

      if (mailResult.rejected.length > 0) {
        recipientRejected = mailResult.rejected.some(
          (recipient) =>
            recipient.toLowerCase() === validatedEmail.toLowerCase(),
        );

        console.error("Booking confirmation email was rejected.", {
          email: validatedEmail,
          eventId: validatedEventId,
          rejected: mailResult.rejected,
        });

        throw new Error("Booking confirmation email was rejected.");
      }
    } catch (error) {
      console.error("Failed to send booking confirmation email:", error);

      try {
        const rollback = await Booking.deleteOne({ _id: booking._id });
        if (rollback.deletedCount !== 1) {
          throw new Error("Booking was not found during email-failure rollback.");
        }
      } catch (rollbackError) {
        console.error(
          "Failed to roll back booking after email failure:",
          rollbackError,
        );
        throw new Error("Failed to create booking. Please try again later.");
      }

      return {
        success: false,
        message: recipientRejected
          ? "Please provide a valid email address to book your spot."
          : "Your booking could not be completed because the confirmation email could not be delivered. Please try again later.",
      };
    }

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
      return {
        success: false,
        message: "This email has already booked this event.",
      };
    }

    console.error("Error creating booking:", error);

    throw new Error("Failed to create booking. Please try again later.");
  }
};
