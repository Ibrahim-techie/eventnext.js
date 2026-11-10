import { NextResponse } from "next/server";

import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";

type EventRouteContext = {
  params: Promise<{ slug?: string }>;
};

const isValidSlug = (slug: string): boolean =>
  slug.length <= 100 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

export async function GET(
  _request: Request,
  { params }: EventRouteContext,
) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug?.trim().toLowerCase();

  if (!slug) {
    return NextResponse.json(
      { message: "Event slug is required." },
      { status: 400 },
    );
  }

  if (!isValidSlug(slug)) {
    return NextResponse.json(
      {
        message:
          "Invalid event slug. Use only lowercase letters, numbers, and single hyphens.",
      },
      { status: 400 },
    );
  }

  try {
    await connectDB();

    const event = await Event.findOne({ slug }).lean();

    if (!event) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Event fetched successfully.", event },
      { status: 200 },
    );
  } catch (error) {

    if(process.env.NODE_ENV === "development") {
      console.error("Event fetching failed:", error);
    }

    return NextResponse.json(
      { message: "Unable to fetch the event." },
      { status: 500 },
    );
  }
}
