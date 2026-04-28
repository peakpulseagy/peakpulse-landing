import { google } from "googleapis";
import { NextResponse } from "next/server";

// node scripts/getGoogleAuthUrl.ts
// npm install -D tsx
// npx tsx scripts/getGoogleAuthUrl.ts

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);

  console.log("🔥 SAVE THIS REFRESH TOKEN:");
  console.log(tokens.refresh_token);

  return NextResponse.json({
    message: "Refresh token logged in terminal",
  });
}
