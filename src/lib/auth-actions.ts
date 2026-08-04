"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { AuthError, CredentialsSignin } from "next-auth";
import { Prisma } from "@/generated/prisma/client";
import { signIn } from "@/auth";
import { db } from "@/lib/db";
import { createVerificationToken, consumeVerificationToken } from "@/lib/verification-tokens";
import {
  sendMagicLinkEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendGoogleOnlyAccountEmail,
} from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const GENERIC_LINK_SENT = "Якщо такий email зареєстрований, ми надіслали лист із подальшими інструкціями";

export type AuthFormState =
  | { error: string; unverifiedEmail?: string }
  | { info: string }
  | undefined;

function redirectTargetFrom(formData: FormData): string {
  const value = formData.get("redirectTo");
  return typeof value === "string" && value ? value : "/academy";
}

function normalizedEmail(formData: FormData): string {
  return String(formData.get("email") ?? "").trim().toLowerCase();
}

export async function credentialsSignIn(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizedEmail(formData);
  try {
    await signIn("credentials", {
      email,
      password: formData.get("password"),
      redirectTo: redirectTargetFrom(formData),
    });
  } catch (error) {
    if (error instanceof CredentialsSignin && error.code === "email_not_verified") {
      return { error: "Підтвердіть email перед входом", unverifiedEmail: email };
    }
    if (error instanceof AuthError) {
      return { error: "Невірний email або пароль" };
    }
    throw error;
  }
}

export async function registerUser(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizedEmail(formData);
  const password = String(formData.get("password") ?? "");
  const redirectTo = redirectTargetFrom(formData);

  if (!EMAIL_RE.test(email)) {
    return { error: "Введіть коректний email" };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Пароль має містити щонайменше ${MIN_PASSWORD_LENGTH} символів` };
  }

  const hashed = await bcrypt.hash(password, 12);

  try {
    await db.user.create({ data: { email, password: hashed } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Користувач з таким email вже зареєстрований" };
    }
    throw error;
  }

  const token = await createVerificationToken(email, "email-verify", 60);
  await sendVerificationEmail(email, token, redirectTo);

  return { info: "Перевірте пошту й перейдіть за посиланням, щоб підтвердити акаунт" };
}

export async function resendVerificationEmail(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizedEmail(formData);
  const redirectTo = redirectTargetFrom(formData);

  const user = await db.user.findUnique({ where: { email } });
  if (user?.password && !user.emailVerified) {
    const token = await createVerificationToken(email, "email-verify", 60);
    await sendVerificationEmail(email, token, redirectTo);
  }

  return { info: "Якщо акаунт існує і ще не підтверджений, ми надіслали новий лист" };
}

export async function requestMagicLink(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizedEmail(formData);
  const redirectTo = redirectTargetFrom(formData);

  if (!EMAIL_RE.test(email)) {
    return { error: "Введіть коректний email" };
  }

  const token = await createVerificationToken(email, "magic-link", 15);
  await sendMagicLinkEmail(email, token, redirectTo);

  return { info: "Перевірте пошту — ми надіслали посилання для входу" };
}

export async function requestPasswordReset(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizedEmail(formData);
  if (!EMAIL_RE.test(email)) {
    return { error: "Введіть коректний email" };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (user?.password) {
    const token = await createVerificationToken(email, "password-reset", 30);
    await sendPasswordResetEmail(email, token);
  } else if (user) {
    await sendGoogleOnlyAccountEmail(email);
  }

  return { info: GENERIC_LINK_SENT };
}

export async function resetPassword(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizedEmail(formData);
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Пароль має містити щонайменше ${MIN_PASSWORD_LENGTH} символів` };
  }

  const valid = await consumeVerificationToken(email, "password-reset", token);
  if (!valid) {
    return { error: "Посилання недійсне або застаріле. Спробуйте ще раз" };
  }

  const hashed = await bcrypt.hash(password, 12);
  await db.user.update({
    where: { email },
    data: { password: hashed, emailVerified: new Date() },
  });

  redirect("/sign-in?reset=1");
}
