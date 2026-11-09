import Link from "next/link";
import Image from "next/image";
interface EeventCardProps {
  title: string;
  imageUrl: string;
  description: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

const EeventCard = ({
  title,
  imageUrl,
  description,
  slug,
  location,
  date,
  time,
}: EeventCardProps) => {
  return (
    <Link href={`/events/${slug}`} className="event-card group">
      <Image
        src={imageUrl}
        alt={title}
        width={400}
        height={200}
        className="poster transition-transform duration-300 group-hover:scale-[1.02]"
      />

      <div className="location">
        <Image src="/icons/pin.svg" alt="Location" width={14} height={14} />
        <p>{location}</p>
      </div>
      <h3 className="title">{title}</h3>
      <p className="description">{description}</p>
      <div className="datetime">
        <div>
          <Image src="/icons/calendar.svg" alt="Date" width={14} height={14} />
          <p>{date}</p>
        </div>
        <div>
          <Image src="/icons/clock.svg" alt="Date" width={14} height={14} />
          <p>{time}</p>
        </div>
      </div>
    </Link>
  );
};

export default EeventCard;
