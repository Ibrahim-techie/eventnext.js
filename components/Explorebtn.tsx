import Image from "next/image";
import Link from "next/link";

export const Explorebtn = () => {
  return (
    <Link
      href="/events"
      className="mt-7 mx-auto"
      id="explore-btn"
    >
      Explore Events
      <Image
        src="/icons/arrow-down.svg"
        alt="Arrow down"
        width={20}
        height={20}
      />
    </Link>
  );
};
