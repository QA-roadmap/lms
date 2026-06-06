import NextAuth from "next-auth";
import { db } from "@/lib/db";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
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
          token.lifetimeAccess = dbUser.lifetimeAccess;
          token.subscriptionStatus = dbUser.subscriptionStatus ?? null;
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
