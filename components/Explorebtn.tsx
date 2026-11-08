"use client";
import Image from "next/image";

export const Explorebtn = () => {
  return (
    <button
      className="mt-7 mx-auto"
      type="button"
      id="explore-btn"
      onClick={() => console.log("Explore button clicked")}
    >
      <a href="#events">
        Explore Events
        <Image
          src="/icons/arrow-down.svg"
          alt="Arrow down"
          width={20}
          height={20}
        />
      </a>
    </button>
  );
};
