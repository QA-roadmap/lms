import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Edge-safe config — no Prisma, no Node.js modules
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
