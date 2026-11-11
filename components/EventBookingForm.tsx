"use client";

import { SubmitEvent, useState } from "react";

type EventBookingFormProps = {
  eventId?: string;
  eventSlug: string;
};

const EventBookingForm = ({ eventId, eventSlug }: EventBookingFormProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, eventId, eventSlug }),
      });

      const result = (await response.json()) as { message?: string };
      setStatus(
        response.ok
          ? result.message ?? "Your spot has been booked."
          : result.message ?? "Unable to book your spot.",
      );

      if (response.ok) setEmail("");
    } catch {
      setStatus("Unable to reach the booking service. Please try again.");
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
      {status && <p className="booking-status" role="status">{status}</p>}
    </div>
  );
};

export default EventBookingForm;
