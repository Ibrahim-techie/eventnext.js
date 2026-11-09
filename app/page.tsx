import EeventCard from "@/components/EeventCard";
import { Explorebtn } from "@/components/Explorebtn";
import { events } from "@/lib/constants";

const page = () => {
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
          {events.map((event) => (
            <li key={event.title}>
              <EeventCard
                title={event.title}
                imageUrl={event.imageUrl}
                description={event.description}
                slug={event.slug}
                location={event.location}
                date={event.date}
                time={event.time}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default page;
