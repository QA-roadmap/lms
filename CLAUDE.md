@AGENTS.md

# AI Course Platform

Next.js 16 (App Router, Turbopack) + React 19 + Prisma 7 + NextAuth v5 (beta) + Neon Postgres,
deployed to Vercel. A multi-course platform — Sanity CMS is the single source of truth for the
catalog and lesson content.

## Stack
- **DB**: Neon Postgres via `@prisma/adapter-pg` (`src/lib/db.ts`). Prisma 7 client is generated
  to a custom path: `src/generated/prisma` (not the default `node_modules/.prisma`).
- **Auth**: NextAuth v5 beta, **JWT strategy with manual DB upsert** — `PrismaAdapter` is
  incompatible with Prisma 7, do not reintroduce it. See `src/auth.ts` / `src/auth.config.ts`.
- **Payments**: Monobank merchant API — Ukrainian payment gateway, not Stripe (Stripe deps exist
  but are unused legacy). Each course has a single one-time `priceUSD` in Sanity (buy once, own
  the course forever). Checkout at `/api/checkout` converts USD → UAH via `USD_TO_UAH_RATE`,
  creates a Monobank invoice, and upserts a `pending` `Purchase` row with `invoiceId`. Webhook
  at `/api/monobank/webhook` verifies ECDSA signature and flips `status` to `active` on success;
  logic in `src/lib/monobank.ts`.
- **Blog**: MDX files in `content/blog/` rendered via `next-mdx-remote`/`gray-matter`, plus a
  Hashnode API mirror (`src/lib/hashnode.ts`, `src/lib/blog.ts`).
- **Styling**: Tailwind v4.

## Content — Sanity CMS is the only source of truth
Both the marketing/catalog pages (`/`, `/courses`, `/courses/[slug]`) and the academy/lesson
pages (`/academy`, `/academy/[courseSlug]/...`) read **live content from Sanity** via
`src/lib/sanity.ts` (`getCourses`, `getCourseBySlug`, `getModules`, `getLesson`,
`getModuleByLessonSlug`). There is no parallel static-data catalog — the old
`src/data/courses.ts` / `src/data/curriculum.ts` fixtures were retired once the full 13-course
catalog was migrated into Sanity (see Studio schema in the sibling `studio-qa/` project).

`src/lib/courses.ts` holds small helpers/derived values only (e.g. `courseLessonCount`,
`FEATURED_COURSE_SLUG`) — not content.

## Per-course access model
Access is purchase-based and scoped per course, not global:
- `Purchase` (`userId + courseSlug`, unique) tracks `status: "pending" | "active" | "canceled"` and `invoiceId` (Monobank invoice). A user has
  access to a course iff an active `Purchase` row exists for that pair — see `src/lib/access.ts`
  (`getActiveCourseSlugs`).
- `UserProgress` is keyed by `userId + courseSlug + lessonSlug`.
- There are no global `User.lifetimeAccess` / `subscriptionStatus` flags anymore — access is
  always resolved per course via `Purchase`.

## Layout quirks
- `src/app/(academy)/academy` and `src/app/(auth)/sign-in` are empty leftover route-group
  directories from a refactor — the live routes are `src/app/academy` and `src/app/sign-in`.

## Commands
- `npm run dev` — Turbopack dev server
- `npm run build` — runs `prisma generate` then `next build` (the custom Prisma output path
  means `prisma generate` must run before any build/typecheck after a schema change)
- `npx tsc --noEmit` — typecheck
- `npm run lint`
