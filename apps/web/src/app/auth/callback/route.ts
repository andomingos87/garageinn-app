import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";

/**
 * Auth callback route handler.
 * Handles multiple auth flows:
 * - OAuth: exchanges code for session
 * - Magic Link: exchanges code for session
 * - Password Recovery (PKCE): verifies token_hash and establishes session
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();

  // Handle PKCE flow with token_hash (used by password recovery with custom email template)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("Token verification error:", error.message);
    return NextResponse.redirect(`${origin}/login?error=token_invalid`);
  }

  // Handle standard PKCE flow with code (OAuth, Magic Link)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("Code exchange error:", error.message);
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}

