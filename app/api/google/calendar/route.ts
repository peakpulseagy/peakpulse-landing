/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { date, startTime, endTime, businessName, email } =
      await req.json();

    if (!process.env.GOOGLE_REFRESH_TOKEN) {
      throw new Error("Missing GOOGLE_REFRESH_TOKEN");
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const calendar = google.calendar({
      version: "v3",
      auth: oauth2Client,
    });

  //   const normalizeTime = (time: string) =>
  // time.padStart(5, "0"); // "2:00" → "02:00"

  //   const startDateTime = new Date(
  //     `${date}T${normalizeTime(startTime)}:00`
  //   );

  //   const endDateTime = new Date(
  //     `${date}T${normalizeTime(endTime)}:00`
  //   );

  //   // 🔥 Overnight handling
  //   if (endDateTime <= startDateTime) {
  //     endDateTime.setDate(endDateTime.getDate() + 1);
    //   }
    
    const startDateTime = new Date(
      `${date}T${startTime}:00+08:00`
    );

    const endDateTime = new Date(
      `${date}T${endTime}:00+08:00`
    );


    const event = {
      summary: `Audit Booking - ${businessName}`,

      description: `
        Hello ${businessName},

        You have a scheduled audit booking.

        📅 Date: ${date}
        ⏰ Time: ${startTime} – ${endTime}

        Please click the Google Meet link to join the call.
              `.trim(),

      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "Asia/Manila",
      },

      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "Asia/Manila",
      },

      // ✅ CLIENT RECEIVES INVITE
      attendees: [
        { email },
        { email: "fdr.peakpulse@gmail.com" }
      ],

      // ✅ GOOGLE MEET LINK
      conferenceData: {
        createRequest: {
          requestId: `audit-${Date.now()}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },

      // ✅ GOOGLE REMINDERS (CLIENT + YOU)
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 1440 }, // 24 hours before
          { method: "email", minutes: 60 },   // 1 hour before
        ],
      },

      // ✅ YOUR TAGS (FOR AVAILABILITY + FILTERING)
      extendedProperties: {
        private: {
          bookingType: "AUDIT",
          bookingStatus: "CONFIRMED",
          clientEmail: email,
          source: "WEBSITE",
          expiresAt: `${date}T${endTime}:00`,
        },
      },
    };

    await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1,

      // 🔥 THIS IS WHAT SENDS EMAILS
      sendUpdates: "all",
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Google Calendar error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
  