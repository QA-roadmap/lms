import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consumeVerificationToken } from "@/lib/verification-tokens";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  const token = request.nextUrl.searchParams.get("token");

  if (!email || !token) {
    return NextResponse.redirect(new URL("/sign-in?error=verify-invalid", request.url));
  }

  const valid = await consumeVerificationToken(email, "email-verify", token);
  if (!valid) {
    return NextResponse.redirect(new URL("/sign-in?error=verify-invalid", request.url));
  }

  await db.user.update({ where: { email }, data: { emailVerified: new Date() } });

  return NextResponse.redirect(new URL("/sign-in?verified=1", request.url));
}
