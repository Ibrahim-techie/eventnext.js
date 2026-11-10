import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Event } from "@/database";
import connectToDatabase from "@/lib/mongodb";


const getListValue = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  } catch {
    // Support comma-separated values in JSON requests.
  }

  return value.split(",").map((item) => item.trim()).filter(Boolean);
};

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let fields: Record<string, unknown>;

    if (contentType.includes("application/json")) {
      const body: unknown = await request.json();
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return NextResponse.json(
          { message: "Request body must be an object" },
          { status: 400 },
        );
      }
      fields = body as Record<string, unknown>;
    } else {
      const formData = await request.formData();
      fields = Object.fromEntries(formData.entries());
    }

    const getField = (name: string): string => {
      const value = fields[name];
      return typeof value === "string" ? value.trim() : "";
    };

    const title = getField("title");
    const description = getField("description");
    const overview = getField("overview");
    const image = getField("image") || getField("imageUrl");
    const venue = getField("venue");
    const location = getField("location");
    const date = getField("date");
    const time = getField("time");
    const mode = getField("mode");
    const audience = getField("audience");
    const organizer = getField("organizer");
    const agenda = getListValue(fields.agenda);
    const tags = getListValue(fields.tags);

    const missingFields = Object.entries({
      title,
      description,
      overview,
      image,
      venue,
      location,
      
      time,
      mode,
      audience,
      organizer,
      agenda,
      tags,
    })
      .filter(([, value]) =>
        Array.isArray(value) ? value.length === 0 : !value,
      )
      .map(([field]) => field);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: "Missing required fields", missingFields },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const newEvent = await Event.create({
      title,
      description,
      overview,
      image,
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
