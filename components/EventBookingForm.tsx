"use client";

import { SubmitEvent, useState } from "react";
import { createBooking } from "@/lib/actions/booking-action";

type EventBookingFormProps = {
  eventId?: string;
};

const EventBookingForm = ({ eventId }: EventBookingFormProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!eventId) {
      setStatus("This event is not available for booking.");
      return;
    }

    try {
      const result = await createBooking(email, eventId);
      setEmail("");
      setStatus(result.message);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Unable to book your spot. Please try again.",
      );
    }
  };

  return (
    <div className="signup-card">
      <h2>Book Your Spot</h2>
      <p className="booking-copy">
        Reserve your place at this event with your email address.
      </p>
      <form id="book-event" onSubmit={handleSubmit}>
        <label htmlFor="booking-email">Email Address</label>
        <input
          id="booking-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          required
        />

        <button type="submit">Submit</button>
      </form>
      {status && (
        <p className="booking-status" role="status">
          {status}
        </p>
      )}
    </div>
  );
};

export default EventBookingForm;
