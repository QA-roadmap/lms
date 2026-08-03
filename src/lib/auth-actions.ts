"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { Prisma } from "@/generated/prisma/client";
import { signIn } from "@/auth";
import { db } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export type AuthFormState = { error: string } | undefined;

function redirectTargetFrom(formData: FormData): string {
  const value = formData.get("redirectTo");
  return typeof value === "string" && value ? value : "/academy";
}

export async function credentialsSignIn(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: redirectTargetFrom(formData),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return error.type === "CredentialsSignin"
        ? { error: "Невірний email або пароль" }
        : { error: "Не вдалося увійти. Спробуйте ще раз" };
    }
    throw error;
  }
}

export async function registerUser(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
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

  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Реєстрація успішна, але вхід не вдався. Спробуйте увійти вручну" };
    }
    throw error;
  }
}
