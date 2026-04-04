import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Check for a pending invite code stored in cookie before Google OAuth redirect
  const cookieHeader = request.headers.get("cookie") ?? "";
  const inviteCookieMatch = cookieHeader.match(/andiamo_invite=([^;]+)/);
  const inviteCode = inviteCookieMatch?.[1];

  const destination = inviteCode ? `/join/${inviteCode}` : "/trips";
  const response = NextResponse.redirect(`${origin}${destination}`);

  if (inviteCode) {
    response.cookies.set("andiamo_invite", "", { maxAge: 0, path: "/" });
  }

  return response;
}
