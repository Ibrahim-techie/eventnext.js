import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Every error response uses the same shape: { message, ...details }.
const fail = (status: number, message: string, details?: object) =>
  NextResponse.json({ message, ...details }, { status });

function configureCloudinary(): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return false;

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  return true;
}

async function uploadImage(file: File): Promise<UploadApiResponse> {
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: "eventnextjs/images", resource_type: "image" },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Cloudinary returned no upload result."));
          resolve(result);
        },
      )
      .end(buffer);
  });
}

// Every value sent for each key. Keys are normalized so stray spaces,
// invisible characters, capitals or a trailing [] in Postman key names
// ("date ", "Tags", "agenda[]") still match.
type Fields = Map<string, FormDataEntryValue[]>;

const readFields = (formData: FormData): Fields => {
  const fields: Fields = new Map();
  for (const [rawKey, value] of formData.entries()) {
    const key = rawKey
      .replace(/[​-‍﻿]/g, "")
      .trim()
      .replace(/\[\]$/, "")
      .toLowerCase();
    fields.set(key, [...(fields.get(key) ?? []), value]);
  }
  return fields;
};

const getText = (fields: Fields, name: string): string => {
  const value = fields.get(name)?.find((v) => typeof v === "string");
  return typeof value === "string" ? value.trim() : "";
};

// Accepts a JSON array ('["a","b"]'), a comma/newline separated string
// ("a, b"), or the same key repeated (agenda=a, agenda=b / agenda[]=a).
const getList = (fields: Fields, name: string): string[] => {
  const values = (fields.get(name) ?? []).filter(
    (v): v is string => typeof v === "string",
  );

  return values
    .flatMap((value) => {
      try {
        const parsed: unknown = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch {
        // Not JSON: treat as plain text.
      }
      return values.length === 1 ? value.split(/[,\n]/) : [value];
    })
    .map((item) => item.trim())
    .filter(Boolean);
};

const validationDetails = (error: mongoose.Error.ValidationError) => ({
  errors: Object.fromEntries(
    Object.entries(error.errors).map(([field, detail]) => [field, detail.message]),
  ),
});

const isDuplicateKeyError = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && error.code === 11000;

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return fail(
      400,
      "Send the event as form-data (multipart/form-data). Don't set the Content-Type header by hand.",
    );
  }

  const fields = readFields(formData);

  const image =
    fields.get("image")?.find((v) => v instanceof File) ?? fields.get("image")?.[0];
  if (!(image instanceof File)) {
    return fail(400, "Image file is required. In Postman, set the 'image' field type to File.");
  }
  if (image.size === 0) return fail(400, "The image is empty.");
  if (image.size > MAX_IMAGE_BYTES) return fail(413, "The image must be 5 MB or smaller.");
  if (!image.type.startsWith("image/")) {
    return fail(400, "Invalid file type. Only image files are allowed.");
  }

  if (!configureCloudinary()) {
    return fail(500, "Cloudinary is not configured on the server.");
  }

  try {
    await connectDB();

    const event = new Event({
      title: getText(fields, "title"),
      description: getText(fields, "description"),
      overview: getText(fields, "overview"),
      venue: getText(fields, "venue"),
      location: getText(fields, "location"),
      date: getText(fields, "date"),
      time: getText(fields, "time"),
      mode: getText(fields, "mode"),
      audience: getText(fields, "audience"),
      organizer: getText(fields, "organizer"),
      agenda: getList(fields, "agenda"),
      tags: getList(fields, "tags"),
    });

    // Validate everything except the image before uploading it, so a bad
    // request never leaves an orphaned file in Cloudinary.
    await event.validate({ pathsToSkip: ["image"] });

    if (await Event.exists({ slug: event.slug })) {
      return fail(409, "An event with this title already exists.");
    }

    let uploaded: UploadApiResponse;
    try {
      uploaded = await uploadImage(image);
    } catch (error) {
      console.error("Cloudinary image upload failed:", error);
      return fail(502, "Cloudinary could not upload the image.");
    }

    event.image = uploaded.secure_url;

    try {
      await event.save();
    } catch (error) {
      await cloudinary.uploader
        .destroy(uploaded.public_id)
        .catch((e) => console.error("Could not delete orphaned image:", e));
      throw error;
    }

    return NextResponse.json(
      { message: "Event created successfully", event },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return fail(400, "Event validation failed", {
        ...validationDetails(error),
        // Exact key names received, to spot typos in the request.
        receivedFields: [...formData.keys()].map((k) => JSON.stringify(k)),
      });
    }
    if (isDuplicateKeyError(error)) {
      return fail(409, "An event with this title already exists.");
    }

    console.error("Event creation failed:", error);
    return fail(500, "Event creation failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function GET() {
  try {
    await connectDB();

    const events = await Event.find().sort({ createdAt: -1 });

    return NextResponse.json(
      { message: "Events fetched successfully", events },
      { status: 200 },
    );
  } catch (error) {
    console.error("Event fetching failed:", error);
    return fail(500, "Event fetching failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}


