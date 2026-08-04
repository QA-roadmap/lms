import { randomBytes, createHash } from "crypto";
import { db } from "@/lib/db";

export type TokenPurpose = "magic-link" | "email-verify" | "password-reset";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Creates a single-use token for `identifier` (an email), invalidating any prior
 * un-consumed token of the same purpose. Returns the raw token — only its hash is stored. */
export async function createVerificationToken(
  identifier: string,
  purpose: TokenPurpose,
  ttlMinutes: number,
): Promise<string> {
  const raw = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + ttlMinutes * 60_000);

  await db.verificationToken.deleteMany({ where: { identifier, purpose } });
  await db.verificationToken.create({
    data: { identifier, purpose, token: hashToken(raw), expires },
  });

  return raw;
}

/** Verifies and consumes a token. Returns true iff it matched `identifier`/`purpose` and
 * had not expired — either way the stored token is deleted so it cannot be replayed. */
export async function consumeVerificationToken(
  identifier: string,
  purpose: TokenPurpose,
  rawToken: string,
): Promise<boolean> {
  const hashed = hashToken(rawToken);
  const record = await db.verificationToken.findUnique({ where: { token: hashed } });
  if (!record) return false;

  await db.verificationToken.delete({ where: { token: hashed } });

  return record.identifier === identifier && record.purpose === purpose && record.expires > new Date();
}
