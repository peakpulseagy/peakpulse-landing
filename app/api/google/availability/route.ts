import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getAuthClient } from "@/scripts/getGoogleAuthUrl";

export async function POST(req: Request) {
  const { year, month, day } = await req.json();

  const auth = await getAuthClient();
  const calendar = google.calendar({ version: "v3", auth });

  // Date range
  const start = new Date(year, month, day ?? 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: "startTime",

    // ✅ ONLY FETCH AUDIT BOOKINGS
    privateExtendedProperty: ["bookingType=AUDIT", "bookingStatus=CONFIRMED"],
  });

  const dayData = res.data 

  const events = res.data.items || [];

  const now = new Date();

  const bookings = events
    .filter(event => {
      if (!event.start?.dateTime || !event.end?.dateTime) return false;

      const status =
        event.extendedProperties?.private?.bookingStatus;

      if (status !== "CONFIRMED") return false;

      return new Date(event.end.dateTime) > now;
    })
    .map(event => ({
      start: event.start!.dateTime!,
      end: event.end!.dateTime!,
    }));


  return NextResponse.json({ bookings, dayData });
}
