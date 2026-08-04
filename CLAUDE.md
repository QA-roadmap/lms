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
  Providers: Google OAuth, plus two `Credentials` providers — `"credentials"` (email+password,
  bcrypt) and `"magic-link"` (email+one-time token, no adapter — the provider's own `authorize`
  validates and consumes the token via `src/lib/verification-tokens.ts`, which hashes tokens
  into the pre-existing `VerificationToken` table keyed by `identifier` (email) + `purpose`
  (`"magic-link" | "email-verify" | "password-reset"`)). Password sign-in is gated on
  `User.emailVerified` — an unverified attempt throws a `CredentialsSignin` subclass with
  `code: "email_not_verified"` (see `EmailNotVerifiedSignin` in `src/auth.ts`), which
  `src/lib/auth-actions.ts` catches to surface a "resend verification email" action. All
  transactional email (magic link, email verification, password reset) sends via Resend
  (`src/lib/email.ts`, needs `RESEND_API_KEY` + `EMAIL_FROM` on a verified sending domain).
- **Payments**: Monobank merchant API — Ukrainian payment gateway, not Stripe (Stripe deps exist
  but are unused legacy). Each course has a single one-time `priceUSD` in Sanity (buy once, own
  the course forever). Checkout at `/api/checkout` converts USD → UAH via `USD_TO_UAH_RATE`,
  creates a Monobank invoice, and upserts a `pending` `Purchase` row with `invoiceId`. Webhook
  at `/api/monobank/webhook` verifies ECDSA signature and flips `status` to `active` on success;
  logic in `src/lib/monobank.ts`. The checkout route validates env vars explicitly and wraps
  everything in try/catch — errors surface as `{ error: string }` JSON (not silent 500s).
  **Token**: must be a merchant/acquiring token from `web.monobank.ua` → Еквайринг section.
  Personal tokens from `api.monobank.ua` return FORBIDDEN on all merchant endpoints.
- **Blog**: `post` documents in Sanity (same project/dataset as the course catalog), rendered
  as Portable Text via `getAllPosts`/`getPostBySlug` (`src/lib/sanity.ts`) and the shared
  `PortableTextContent` component. `src/lib/blog.ts` holds presentation helpers only
  (`formatDate`, `estimateReadingTime`).
- **Styling**: Tailwind v4.

## Content — Sanity CMS is the only source of truth
Both the marketing/catalog pages (`/`, `/courses`, `/courses/[slug]`) and the academy/lesson
pages (`/academy`, `/academy/[courseSlug]/...`) read **live content from Sanity** via
`src/lib/sanity.ts` (`getCourses`, `getCourseBySlug`, `getModules`, `getLesson`,
`getModuleByLessonSlug`, `getAllPosts`, `getPostBySlug`). There is no parallel static-data
catalog — the old `src/data/courses.ts` / `src/data/curriculum.ts` fixtures were retired once
the full 13-course catalog was migrated into Sanity (see Studio schema in the sibling
`studio-qa/` project). The blog (`/blog`, `/blog/[slug]`) was migrated the same way: the 14
posts that previously lived as MDX files in `content/blog/` are now `post` documents in
Sanity, with Markdown tables converted to `@sanity/table` blocks (plain-text cells — bold/
links inside table cells were flattened during the one-time migration,
`scripts/migrate-blog-to-sanity.mjs`).

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
- `courses/[slug]/page.tsx` checks purchase status server-side: if the user already owns the
  course, the `<Pricing>` block is replaced with a "Ти вже маєш доступ" banner linking to
  `/academy/[slug]`. Auth + purchase check run in parallel via `Promise.all`.

## SEO
- `src/lib/seo.ts` is the central SEO module: `SITE_URL` (from `NEXT_PUBLIC_APP_URL` if it starts
  with `http`, else falls back to `https://qaroadmap.dev`), `SITE_NAME = "QA Roadmap"`, and
  JSON-LD builders `faqSchema`, `courseSchema` (Course + Offer, `offers` omitted unless
  `typeof course.priceUSD === "number"` — Sanity returns `null` for unset numbers), and
  `articleSchema`.
- `src/app/layout.tsx` sets `metadataBase: new URL(SITE_URL)` and a title template
  (`%s — ${SITE_NAME}`); per-page `generateMetadata`/`metadata` exports add
  `alternates.canonical`, `openGraph`, and `twitter`. Note: a child segment's `openGraph`/
  `twitter` object **replaces** the parent's wholesale (no deep merge) — and an `images` key
  present-but-`undefined` suppresses the auto-injected `opengraph-image` route, so build it with
  `...(images && { images })`.
- `app/sitemap.ts` / `app/robots.ts` are dynamic — sitemap combines static routes +
  `getCourses()` + `getAllPosts()` + `getAllSkillSlugs()`; robots disallows `/academy`, `/api/`,
  `/sign-in` (also `noindex` via `src/app/academy/layout.tsx` and `sign-in/page.tsx` metadata).
- `src/lib/og.tsx` provides the shared `OgCard` component + `loadOgFont` (fetches a
  Cyrillic-glyph-subsetted Inter from the Google Fonts CSS API — Satori/`next/og` needs
  ttf/otf/woff, no woff2). Used by `opengraph-image.tsx` under `/`, `/courses/[slug]`, and
  `/blog/[slug]`. When passing text to `loadOgFont`, include the *uppercased* form of any text
  rendered uppercase in JS (`OgCard` uppercases `eyebrow` itself), or those glyphs render in a
  fallback font.

## Analytics & ads (GTM)
- Google Tag Manager is the single integration point: `<GoogleTagManager gtmId={...} />` from
  `@next/third-parties/google` is rendered in `src/app/layout.tsx` only when
  `NEXT_PUBLIC_GTM_ID` is set. GA4 and the Meta/Facebook Pixel are configured as **tags inside
  the GTM container** (web UI) — no separate measurement/pixel IDs live in this app.
- Pageviews for client-side navigation: use GTM's built-in **History Change** trigger (works
  with Next.js App Router pushState navigation) for the GA4 `page_view` event and the Pixel
  `PageView` event.
- Purchases: `src/components/academy/PurchaseTracker.tsx` (rendered in
  `academy/[courseSlug]/page.tsx`, wrapped in `<Suspense>` for `useSearchParams`) fires a
  `sendGTMEvent({ event: "purchase", ecommerce: {...} })` once when the Monobank checkout
  redirect lands with `?payment=success`, dedup'd via `sessionStorage`, then strips the query
  param. Wire the GA4 `purchase` event tag and the Pixel `Purchase` event tag to a custom
  trigger on this `purchase` event.

## Layout quirks
- `src/app/(academy)/academy` and `src/app/(auth)/sign-in` are empty leftover route-group
  directories from a refactor — the live routes are `src/app/academy` and `src/app/sign-in`.

## Commands
- `npm run dev` — Turbopack dev server
- `npm run build` — runs `prisma generate` then `next build` (the custom Prisma output path
  means `prisma generate` must run before any build/typecheck after a schema change)
- `npx tsc --noEmit` — typecheck
- `npm run lint`
