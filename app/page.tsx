import { Explorebtn } from "@/components/Explorebtn";

const page = () => {
  return (
    <section>
      <h1 className="text-3xl font-bold underline text-center">
        The Hub For Every Dev
        <br />
        Event You Can&apos;t Miss{" "}
      </h1>
      <p className="text-center mt-5">
        Hackathons, Conferences, and More,All in One Place
      </p>

      <Explorebtn />
    </section>
  );
};

export default page;
