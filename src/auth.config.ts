import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

// Edge-safe config — no Prisma, no Node.js modules
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: { signIn: "/sign-in" },
  callbacks: {
    authorized({ auth, request }) {
      const isAcademyRoute = request.nextUrl.pathname.startsWith("/academy");
      return isAcademyRoute ? !!auth : true;
    },
  },
};
