import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Event } from "@/database";
import connectToDatabase from "@/lib/mongodb";

// Every value sent for a key, so repeated keys (agenda=a, agenda=b) are kept.
type Fields = Map<string, FormDataEntryValue[]>;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

class BadRequestError extends Error {}

const isString = (value: FormDataEntryValue): value is string =>
  typeof value === "string";

const readFields = async (request: NextRequest): Promise<Fields> => {
  const fields: Fields = new Map();
  const add = (rawKey: string, value: FormDataEntryValue) => {
    // Tolerate stray spaces and a trailing [] in key names (e.g. "agenda[]").
    const key = rawKey.trim().replace(/\[\]$/, "");
    fields.set(key, [...(fields.get(key) ?? []), value]);
  };

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new BadRequestError("Request body must be a JSON object");
    }
    for (const [key, value] of Object.entries(body)) {
      for (const item of Array.isArray(value) ? value : [value]) {
        if (typeof item === "string") add(key, item);
      }
    }
  } else {
    const formData = await request.formData();
    for (const [key, value] of formData.entries()) add(key, value);
  }

  return fields;
};

const getText = (fields: Fields, name: string): string =>
  fields.get(name)?.find(isString)?.trim() ?? "";

const getList = (fields: Fields, name: string): string[] => {
  const values = (fields.get(name) ?? []).filter(isString);

  return values
    .flatMap((value) => {
      try {
        const parsed: unknown = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is string => typeof item === "string");
        }
      } catch {
        // Not JSON: treat it as plain text below.
      }
      // A single value may be a comma or newline separated list;
      // repeated keys already give one item per value.
      return values.length === 1 ? value.split(/[,\n]/) : [value];
    })
    .map((item) => item.trim())
    .filter(Boolean);
};

// Postman's "File" type sends the image as a File, not as text.
const getImageFile = (fields: Fields): File | undefined =>
  fields
    .get("image")
    ?.find((item): item is File => !isString(item) && item.size > 0);

const saveImage = async (file: File): Promise<string> => {
  const fileName = `${randomUUID()}${IMAGE_EXTENSIONS[file.type]}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(
    path.join(UPLOAD_DIR, fileName),
    Buffer.from(await file.arrayBuffer()),
  );
  return fileName;
};

export async function POST(request: NextRequest) {
  try {
    let fields: Fields;
    try {
      fields = await readFields(request);
    } catch (error) {
      return NextResponse.json(
        {
          message:
            error instanceof BadRequestError
              ? error.message
              : "Could not read the request body. Send it as form-data or JSON, and do not set the Content-Type header by hand.",
        },
        { status: 400 },
      );
    }

    const title = getText(fields, "title");
    const description = getText(fields, "description");
    const overview = getText(fields, "overview");
    const imageFile = getImageFile(fields);
    const imageUrl = getText(fields, "image") || getText(fields, "imageUrl");
    const venue = getText(fields, "venue");
    const location = getText(fields, "location");
    const date = getText(fields, "date");
    const time = getText(fields, "time");
    const mode = getText(fields, "mode");
    const audience = getText(fields, "audience");
    const organizer = getText(fields, "organizer");
    const agenda = getList(fields, "agenda");
    // Tags are optional in the Event model (default: []).
    const tags = getList(fields, "tags");

    const missingFields = Object.entries({
      title,
      description,
      overview,
      image: imageFile ?? imageUrl,
      venue,
      location,
      date,
      time,
      mode,
      audience,
      organizer,
      agenda,
    })
      .filter(([, value]) =>
        Array.isArray(value) ? value.length === 0 : !value,
      )
      .map(([field]) => field);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          message: "Missing required fields",
          missingFields,
          receivedFields: [...fields.keys()],
        },
        { status: 400 },
      );
    }

    if (imageFile && !IMAGE_EXTENSIONS[imageFile.type]) {
      return NextResponse.json(
        { message: "Image must be a JPEG, PNG, WebP, GIF or AVIF file" },
        { status: 400 },
      );
    }

    if (imageFile && imageFile.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { message: "Image must be 5 MB or smaller" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const uploadedImage = imageFile ? await saveImage(imageFile) : undefined;

    let newEvent;
    try {
      newEvent = await Event.create({
        title,
        description,
        overview,
        image: uploadedImage ? `/uploads/${uploadedImage}` : imageUrl,
        venue,
        location,
        date,
        time,
        mode,
        audience,
        agenda,
        organizer,
        tags,
      });
    } catch (error) {
      // Don't leave an orphaned upload behind when the event is not saved.
      if (uploadedImage) {
        await unlink(path.join(UPLOAD_DIR, uploadedImage)).catch(() => {});
      }
      throw error;
    }

    return NextResponse.json(
      { message: "Event created successfully", event: newEvent },
      { status: 201 },
    );
  } catch (error) {
    console.error("Event creation failed:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        {
          message: "Event validation failed",
          errors: Object.fromEntries(
            Object.entries(error.errors).map(([field, detail]) => [
              field,
              detail.message,
            ]),
          ),
        },
        { status: 400 },
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { message: "An event with this title already exists" },
        { status: 409 },
      );
    }

    if (
      error instanceof Error &&
      (error.name === "MongooseServerSelectionError" ||
        error.message.includes("querySrv") ||
        error.message.includes("MongoServerSelectionError") ||
        error.message.toLowerCase().includes("authentication failed") ||
        error.message.toLowerCase().includes("bad auth"))
    ) {
      return NextResponse.json(
        {
          message: error.message.toLowerCase().includes("auth")
            ? "Database authentication failed"
            : "Database unavailable",
          ...(process.env.NODE_ENV === "development" && {
            detail: error.message,
          }),
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        message:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Event creation failed"
            : "Event creation failed",
      },
      { status: 500 },
    );
  }
}
