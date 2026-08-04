import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authConfig } from "@/auth.config";
import { consumeVerificationToken } from "@/lib/verification-tokens";

class EmailNotVerifiedSignin extends CredentialsSignin {
  code = "email_not_verified";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    ...authConfig.providers,
    Credentials({
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user?.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        if (!user.emailVerified) throw new EmailNotVerifiedSignin();

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
    Credentials({
      id: "magic-link",
      credentials: {
        email: { label: "Email", type: "email" },
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const token = credentials?.token;
        if (typeof email !== "string" || typeof token !== "string") return null;

        const valid = await consumeVerificationToken(email, "magic-link", token);
        if (!valid) return null;

        let user = await db.user.findUnique({ where: { email } });
        if (!user) {
          user = await db.user.create({ data: { email, emailVerified: new Date() } });
        } else if (!user.emailVerified) {
          user = await db.user.update({ where: { email }, data: { emailVerified: new Date() } });
        }

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      if (account?.provider === "credentials" || account?.provider === "magic-link") return true;
      try {
        await db.user.upsert({
          where: { email: user.email },
          update: { name: user.name ?? null, image: user.image ?? null },
          create: {
            email: user.email,
            name: user.name ?? null,
            image: user.image ?? null,
            emailVerified: new Date(),
          },
        });
      } catch (e) {
        console.error("[auth] signIn DB error:", e);
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await db.user.findUnique({ where: { email: user.email } });
        if (dbUser) {
          token.userId = dbUser.id;
        }
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.userId as string;
      return session;
    },
  },
});
