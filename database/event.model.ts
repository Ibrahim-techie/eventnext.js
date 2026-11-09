import mongoose, { type HydratedDocument, type Model } from "mongoose";

export interface Event {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type EventDocument = HydratedDocument<Event>;

const nonEmptyString = {
  type: String,
  required: true,
  trim: true,
  validate: {
    validator: (value: string): boolean => value.trim().length > 0,
    message: "Value cannot be empty",
  },
};

const nonEmptyStringArray = {
  type: [String],
  required: true,
  validate: {
    validator: (value: string[]): boolean =>
      Array.isArray(value) &&
      value.length > 0 &&
      value.every((item) => item.trim().length > 0),
    message: "Array must contain at least one non-empty value",
  },
};

const toSlug = (title: string): string =>
  title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeTime = (value: string): string => {
  const trimmed = value.trim().toUpperCase();
  const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);

  if (!match) {
    throw new Error("Event time must use HH:mm or a valid 12-hour time.");
  }

  const hour = Number(match[1]);
  const minute = Number(match[2] ?? "00");
  const meridiem = match[3];

  if (minute > 59 || (meridiem && (hour < 1 || hour > 12)) || (!meridiem && hour > 23)) {
    throw new Error("Event time is invalid.");
  }

  const normalizedHour =
    meridiem === "AM"
      ? hour === 12
        ? 0
        : hour
      : meridiem === "PM"
        ? hour === 12
          ? 12
          : hour + 12
        : hour;

  return `${String(normalizedHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const eventSchema = new mongoose.Schema<Event>(
  {
    title: nonEmptyString,
    slug: { type: String, unique: true, trim: true },
    description: nonEmptyString,
    overview: nonEmptyString,
    image: nonEmptyString,
    venue: nonEmptyString,
    location: nonEmptyString,
    date: nonEmptyString,
    time: nonEmptyString,
    mode: nonEmptyString,
    audience: nonEmptyString,
    agenda: nonEmptyStringArray,
    organizer: nonEmptyString,
    tags: nonEmptyStringArray,
  },
  { timestamps: true },
);

eventSchema.index({ slug: 1 }, { unique: true });

eventSchema.pre("save", async function () {
  // Regenerate the URL slug only when its source title changes.
  if (this.isModified("title") || !this.slug) {
    const slug = toSlug(this.title);
    if (!slug) {
      throw new Error("Event title must contain letters or numbers.");
    }
    this.slug = slug;
  }

  // Store dates as ISO strings and times as 24-hour HH:mm values.
  const parsedDate = new Date(this.date);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Event date must be a valid date.");
  }
  this.date = parsedDate.toISOString();

  this.time = normalizeTime(this.time);
});

export const Event: Model<Event> =
  (mongoose.models.Event as Model<Event> | undefined) ??
  mongoose.model<Event>("Event", eventSchema);

export default Event;
