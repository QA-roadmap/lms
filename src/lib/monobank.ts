import crypto from "crypto";

const MONO_API = "https://api.monobank.ua";

// In-memory pubkey cache — refreshed on signature mismatch
let cachedPubKey: string | null = null;

async function fetchPubKey(): Promise<string> {
  const res = await fetch(`${MONO_API}/api/merchant/pubkey`, {
    headers: { "X-Token": process.env.MONOBANK_TOKEN! },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Monobank pubkey fetch failed: ${res.status}`);
  const { key } = (await res.json()) as { key: string };
  return key;
}

async function getPubKey(): Promise<string> {
  if (!cachedPubKey) cachedPubKey = await fetchPubKey();
  return cachedPubKey;
}

export async function verifyWebhookSignature(
  rawBody: Buffer,
  xSignB64: string
): Promise<boolean> {
  const tryVerify = async (): Promise<boolean> => {
    const pubKeyB64 = await getPubKey();
    const pem = Buffer.from(pubKeyB64, "base64").toString("utf-8");
    const signature = Buffer.from(xSignB64, "base64");
    const verifier = crypto.createVerify("SHA256");
    verifier.update(rawBody);
    return verifier.verify(pem, signature);
  };

  let valid = await tryVerify();
  if (!valid) {
    // Key may have rotated — refetch and retry once
    cachedPubKey = await fetchPubKey();
    valid = await tryVerify();
  }
  return valid;
}

export type MonobankInvoiceStatus =
  | "created"
  | "processing"
  | "hold"
  | "success"
  | "failure"
  | "reversed"
  | "expired";

export type CreateInvoiceResponse = {
  invoiceId: string;
  pageUrl: string;
};

export async function createInvoice(params: {
  amount: number; // kopecks
  reference: string;
  destination: string;
  redirectUrl: string;
  webHookUrl: string;
}): Promise<CreateInvoiceResponse> {
  const res = await fetch(`${MONO_API}/api/merchant/invoice/create`, {
    method: "POST",
    headers: {
      "X-Token": process.env.MONOBANK_TOKEN!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amount,
      merchantPaymInfo: {
        reference: params.reference,
        destination: params.destination,
      },
      redirectUrl: params.redirectUrl,
      webHookUrl: params.webHookUrl,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Monobank invoice creation failed: ${err}`);
  }

  return res.json() as Promise<CreateInvoiceResponse>;
}
