import { NextRequest, NextResponse } from "next/server";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  const token = request.nextUrl.searchParams.get("token");
  const redirectTo = request.nextUrl.searchParams.get("redirectTo") || "/academy";

  if (!email || !token) {
    return NextResponse.redirect(new URL("/sign-in?error=magic-link-invalid", request.url));
  }

  try {
    await signIn("magic-link", { email, token, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.redirect(new URL("/sign-in?error=magic-link-invalid", request.url));
    }
    throw error;
  }

  // Unreachable: a successful signIn() throws internally to perform the redirect.
  return NextResponse.redirect(new URL(redirectTo, request.url));
}
