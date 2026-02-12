import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    return NextResponse.redirect(
      new URL(`/onboarding/step-2?error=missing_code`, request.url)
    );
  }

  // Check which credentials are missing for better debugging
  const hasClientId = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const hasClientSecret = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;

  if (!hasClientId || !hasClientSecret) {
    return NextResponse.redirect(
      new URL(`/onboarding/step-2?error=missing_credentials&details=${encodeURIComponent(`Client ID: ${hasClientId ? 'OK' : 'MISSING'}, Client Secret: ${hasClientSecret ? 'OK' : 'MISSING'}`)}`, request.url)
    );
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || "",
        code: code,
        grant_type: "authorization_code",
        redirect_uri: `${request.nextUrl.origin}/api/auth/google/callback`,
        scope: "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
   
      return NextResponse.redirect(
        new URL(`/onboarding/step-2?error=token_exchange_failed&details=${encodeURIComponent(JSON.stringify(tokenData))}`, request.url)
      );
    }

    const { access_token } = tokenData;

    // Get user info (email) using access token
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const userInfo = await userInfoResponse.json();

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(
        new URL(`/onboarding/step-2?error=user_info_failed`, request.url)
      );
    }

    // Redirect back with code, state, and email
    const redirectUrl = new URL("/onboarding/step-2", request.url);
    redirectUrl.searchParams.set("code", code);
    if (state) redirectUrl.searchParams.set("state", state);
    redirectUrl.searchParams.set("email", userInfo.email || "");

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL(`/onboarding/step-2?error=callback_error`, request.url)
    );
  }
}

