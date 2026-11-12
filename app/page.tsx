"use cache";
import EeventCard from "@/components/EeventCard";
import { Explorebtn } from "@/components/Explorebtn";
import { IEvent } from "@/database/event.model";
import { cacheLife, cacheTag } from "next/cache";
const page = async () => {
  "use cache";

  cacheLife("hours");
  cacheTag("events");

      let events: IEvent[] = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/events`);

    if (res.ok) {
      const result = await res.json();
      events = result.events;
    }
  } catch (err) {
    console.error("Error fetching events:", err);
  }

  return (
    <section id="home">
      <h1 className="text-3xl font-bold underline text-center ">
        The Hub For Every Dev
        <br />
        Event You Can&apos;t Miss{" "}
      </h1>
      <p className="text-center mt-5">
        Hackathons, Conferences, and More,All in One Place
      </p>
      <Explorebtn />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>

        <ul className="events">
          {events.length == 0 ? (
            <p className="text-center">No Events Found</p>
          ) : (
            events.map((event: IEvent) => (
              <li key={event.title}>
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
            ))
          )}
        </ul>
      </div>
    </section>
  );
};

export default page;
