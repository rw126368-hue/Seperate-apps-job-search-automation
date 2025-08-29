import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { google } from "npm:googleapis";

const DRIVE_CLIENT_ID = Deno.env.get("DRIVE_CLIENT_ID")!;
const DRIVE_CLIENT_SECRET = Deno.env.get("DRIVE_CLIENT_SECRET")!;
const DRIVE_REDIRECT_URI = Deno.env.get("DRIVE_REDIRECT_URI")!;

const oauth2Client = new google.auth.OAuth2(
  DRIVE_CLIENT_ID,
  DRIVE_CLIENT_SECRET,
  DRIVE_REDIRECT_URI
);

serve(async (req) => {
  const url = new URL(req.url);
  if (url.pathname === "/drive-auth-start") {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: "https://www.googleapis.com/auth/drive.file",
    });
    return new Response(JSON.stringify({ authUrl }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (url.pathname === "/drive-auth-callback") {
    const code = url.searchParams.get("code");
    if (!code) {
      return new Response("Missing authorization code", { status: 400 });
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);
      // TODO: Store these tokens securely, associated with the user
      console.log("Received tokens:", tokens);

      // Redirect user back to the application
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/`, // Or a specific success page
        },
      });
    } catch (error) {
      console.error("Error exchanging token:", error);
      return new Response("Authentication failed", { status: 500 });
    }
  }

  // Add other endpoints for file upload, etc.

  return new Response("Not Found", { status: 404 });
});