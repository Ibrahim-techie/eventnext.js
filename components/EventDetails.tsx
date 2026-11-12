import Image from "next/image";
import EeventCard from "./EeventCard";
import EventBookingForm from "./EventBookingForm";
import { getSimilarEventsByTags } from "@/lib/actions/event.actions";

export interface EventDetailsProps {
  _id?: string;
  title: string;
  description: string;
  overview: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  image: string;
}

type SimilarEvent = {
  title: string;
  image: string;
  description: string;
  slug: string;
  location: string;
  date: string;
  time: string;
};

const EventDetails = async ({
  title,
  description,
  overview,
  venue,
  location,
  date,
  time,
  mode,
  audience,
  agenda,
  organizer,
  tags,
  image,
  _id,
}: EventDetailsProps) => {
  const similarEventsResult = _id
    ? await getSimilarEventsByTags(_id)
    : { success: false, data: [] };
  const similarEvents = similarEventsResult.data as SimilarEvent[];

  return (
    <article id="event">
      <div className="header">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <div className="details">
        <div className="content">
          <Image
            className="banner"
            src={image}
            alt={`${title} event banner`}
            width={1200}
            height={675}
            priority
          />

          <section className="flex-col-gap-2" aria-labelledby="overview-heading">
            <h2 id="overview-heading">Overview</h2>
            <div className="copy">
              {overview.split(/\n+/).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section className="event-facts" aria-labelledby="details-heading">
            <h2 id="details-heading">Event Details</h2>
            <div className="facts-grid">
              <div><Image src="/icons/calendar.svg" alt="" width={16} height={16} /><p>{date}</p></div>
              <div><Image src="/icons/clock.svg" alt="" width={16} height={16} /><p>{time}</p></div>
              <div><Image src="/icons/pin.svg" alt="" width={16} height={16} /><p>{venue}, {location}</p></div>
              <div><Image src="/icons/mode.svg" alt="" width={16} height={16} /><p><strong>Mode:</strong> {mode}</p></div>
              <div><Image src="/icons/audience.svg" alt="" width={16} height={16} /><p><strong>Audience:</strong> {audience}</p></div>
            </div>
          </section>

          <section className="agenda" aria-labelledby="agenda-heading">
            <h2 id="agenda-heading">Agenda</h2>
            <ul>
              {agenda.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="organizer" aria-labelledby="organizer-heading">
            <h2 id="organizer-heading">About the Organizer</h2>
            <p><strong>{organizer}</strong> brings developers and technology leaders together to learn, collaborate, and build the future of tech.</p>
            <p>Connect with the community through talks, workshops, and meaningful conversations.</p>
            <div className="tag-list">
              {tags.map((tag) => <span className="pill" key={tag}>{tag}</span>)}
            </div>
          </section>
        </div>

        <aside className="booking" aria-label="Book this event">
          <EventBookingForm eventId={_id} />
        </aside>
      </div>

      <section className="similar-events" aria-labelledby="similar-events-heading">
        <h2 id="similar-events-heading">Similar events</h2>
        <ul className="events">
          {similarEvents.map((event) => (
            <li key={event.slug}>
              <EeventCard
                title={event.title}
                imageUrl={event.image}
                description={event.description}
                slug={event.slug}
                location={event.location}
                date={event.date}
                time={event.time}
              />
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
};

export default EventDetails;
