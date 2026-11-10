import Image from "next/image";

export interface EventDetailsProps {
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

const EventDetails = ({
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
}: EventDetailsProps) => {
  return (
    <article id="event">
      <div className="header">
        <div className="flex-row-gap-2 flex-wrap">
          {tags.map((tag) => (
            <span className="pill" key={tag}>
              {tag}
            </span>
          ))}
        </div>
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
            <p>{overview}</p>
          </section>

          <section className="agenda" aria-labelledby="agenda-heading">
            <h2 id="agenda-heading">Agenda</h2>
            <ul>
              {agenda.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="booking" aria-label="Event information">
          <div className="signup-card">
            <h2>Event details</h2>

            <div className="flex-col-gap-2">
              <div className="flex-row-gap-2">
                <Image src="/icons/pin.svg" alt="" width={16} height={16} />
                <p>{venue}</p>
              </div>
              <p>{location}</p>
            </div>

            <div className="flex-col-gap-2">
              <div className="flex-row-gap-2">
                <Image
                  src="/icons/calendar.svg"
                  alt=""
                  width={16}
                  height={16}
                />
                <p>{date}</p>
              </div>
              <div className="flex-row-gap-2">
                <Image src="/icons/clock.svg" alt="" width={16} height={16} />
                <p>{time}</p>
              </div>
            </div>

            <div className="flex-col-gap-2">
              <p>
                <strong>Mode:</strong> {mode}
              </p>
              <p>
                <strong>Audience:</strong> {audience}
              </p>
              <p>
                <strong>Organizer:</strong> {organizer}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
};

export default EventDetails;
