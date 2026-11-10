import {
  Schema,
  model,
  models,
  type HydratedDocument,
  type Model,
} from "mongoose";

export interface IEvent {
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

export type EventDocument = HydratedDocument<IEvent>;

const nonEmptyList = (label: string) => ({
  validator: (v: string[]) =>
    Array.isArray(v) && v.length > 0 && v.every((item) => item.trim() !== ""),
  message: `At least one ${label} is required`,
});

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    // The unique index is declared once, below.
    slug: { type: String, lowercase: true, trim: true },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
      maxlength: [500, "Overview cannot exceed 500 characters"],
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    venue: { type: String, required: [true, "Venue is required"], trim: true },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: { type: String, required: [true, "Date is required"], trim: true },
    time: { type: String, required: [true, "Time is required"], trim: true },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      lowercase: true,
      trim: true,
      enum: {
        values: ["online", "offline", "hybrid"],
        message: "Mode must be either online, offline, or hybrid",
      },
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: nonEmptyList("agenda item"),
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: nonEmptyList("tag"),
    },
  },
  { timestamps: true },
);

// Runs before validation (doc.validate() and save()), so bad dates/times
// surface as ValidationErrors instead of crashing the request.
EventSchema.pre("validate", function () {
  if (this.title && (this.isModified("title") || this.isNew)) {
    const slug = generateSlug(this.title);
    if (slug) this.slug = slug;
    else this.invalidate("title", "Title must contain letters or numbers");
  }

  if (this.date && this.isModified("date")) {
    const date = normalizeDate(this.date);
    if (date) this.date = date;
    else
      this.invalidate(
        "date",
        'Invalid date. Use YYYY-MM-DD, "Month D, YYYY" (e.g. November 15, 2025) or a range like "June 11-12, 2027"',
      );
  }

  if (this.time && this.isModified("time")) {
    const time = normalizeTimeRange(this.time);
    if (time) this.time = time;
    else
      this.invalidate(
        "time",
        'Invalid time. Use HH:MM, "H:MM AM", "H AM", or a range like "10:00 AM - 12:00 PM"',
      );
  }
});

function generateSlug(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

// A single date or a range. Ranges are stored as "YYYY-MM-DD/YYYY-MM-DD".
// Accepts "June 11-12, 2027", "June 30 - July 2, 2027",
// "June 11, 2027 - June 12, 2027", "2027-06-11 to 2027-06-12".
function normalizeDate(value: string): string | null {
  const input = value.trim();

  const compact = input.match(
    /^([A-Za-z]+\.?)\s+(\d{1,2})\s*[-–]\s*(\d{1,2}),?\s+(\d{4})$/,
  );
  const expanded = input.match(
    /^([A-Za-z]+\.?\s+\d{1,2})\s*[-–]\s*([A-Za-z]+\.?\s+\d{1,2}),?\s+(\d{4})$/,
  );
  const parts = compact
    ? [`${compact[1]} ${compact[2]}, ${compact[4]}`, `${compact[1]} ${compact[3]}, ${compact[4]}`]
    : expanded
      ? [`${expanded[1]}, ${expanded[3]}`, `${expanded[2]}, ${expanded[3]}`]
      : input.split(/\s*\/\s*|\s+[-–]\s+|\s+to\s+/i);

  if (parts.length > 2) return null;
  const dates = parts.map(normalizeSingleDate);
  if (dates.some((d) => d === null)) return null;
  if (dates.length === 2 && dates[1]! < dates[0]!) return null; // end before start

  return dates.length === 2 && dates[0] === dates[1] ? dates[0] : dates.join("/");
}

// Parses the date as a calendar date (no timezone), so "November 15, 2025"
// stays 2025-11-15 whatever the server's timezone is. Returns null if invalid.
function normalizeSingleDate(value: string): string | null {
  const input = value.trim();
  let year: number;
  let month: number;
  let day: number;

  const iso = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const named = input.match(/^([A-Za-z]+)\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/);

  if (iso) {
    year = Number(iso[1]);
    month = Number(iso[2]) - 1;
    day = Number(iso[3]);
  } else if (named) {
    const name = named[1].toLowerCase();
    month = MONTHS.findIndex((m) => name.length >= 3 && m.startsWith(name));
    day = Number(named[2]);
    year = Number(named[3]);
  } else {
    return null;
  }

  const date = new Date(Date.UTC(year, month, day));
  if (
    month < 0 ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

// "14:30", "2:30 PM", "2 PM" -> "HH:MM" (24-hour). Returns null if invalid.
function normalizeTime(value: string): string | null {
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([AP]\.?M\.?)?$/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  const period = match[3]?.replace(/\./g, "").toUpperCase();

  // Without AM/PM, minutes are required ("14" alone is ambiguous).
  if (!period && match[2] === undefined) return null;
  if (minutes > 59) return null;

  if (period) {
    if (hours < 1 || hours > 12) return null;
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
  } else if (hours > 23) {
    return null;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// A single time or a "start - end" range.
function normalizeTimeRange(value: string): string | null {
  const parts = value.split(/\s*[-–]\s*|\s+to\s+/i);
  if (parts.length > 2) return null;

  const times = parts.map(normalizeTime);
  if (times.some((t) => t === null)) return null;

  return times.join(" - ");
}

EventSchema.index({ slug: 1 }, { unique: true });
EventSchema.index({ date: 1, mode: 1 });

const Event =
  (models.Event as Model<IEvent> | undefined) ??
  model<IEvent>("Event", EventSchema);

export default Event;
