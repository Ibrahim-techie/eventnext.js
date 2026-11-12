import type Mailgen from "mailgen";

export interface BookingEmailProps {
  email: string;
  eventName: string;
  eventDate: string;
}

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXT_PUBLIC_URL ??
  "http://localhost:3000";

export function createBookingConfirmationEmail({
  email,
  eventName,
  eventDate,
}: BookingEmailProps): Mailgen.Content {
  return {
    body: {
      title: "Your booking is confirmed",
      intro: [
        `Hi ${email},`,
        "Thank you for booking your spot. We are looking forward to seeing you there.",
      ],
      dictionary: {
        "Event name": eventName,
        "Event date": eventDate,
        "Booking email": email,
        Status: "Confirmed",
      },
      action: {
        instructions: "Explore more upcoming events:",
        button: {
          color: "#59deca",
          text: "View events",
          link: `${appUrl.replace(/\/$/, "")}/events`,
        },
      },
      outro: [
        "Keep this email for your records. We will share any additional event details with you when they are available.",
        "This is an automated email from a personal demo project. All event and booking details are fictional and for demonstration purposes only. No actual event registration or reservation has been made.",
      ],
      signature: "Best regards",
    },
  };
}
