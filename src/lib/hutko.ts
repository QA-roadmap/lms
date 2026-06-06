import crypto from "crypto";

const BASE_URL = "https://pay.hutko.org/api";

function genSignature(params: Record<string, unknown>, secret: string): string {
  const values = Object.keys(params)
    .sort()
    .map((k) => params[k])
    .filter((v) => v !== "" && v !== null && v !== undefined);
  const str = secret + "|" + values.join("|");
  return crypto.createHash("sha1").update(str).digest("hex");
}

export function validateCallback(
  body: Record<string, unknown>,
  secret: string
): boolean {
  const { signature, ...rest } = body;
  if (!signature) return false;
  return genSignature(rest, secret) === signature;
}

async function request<T>(
  path: string,
  params: Record<string, unknown>
): Promise<T> {
  const merchantId = Number(process.env.HUTKO_MERCHANT_ID!);
  const secret = process.env.HUTKO_SECRET_KEY!;

  const body = { ...params, merchant_id: merchantId };
  const signature = genSignature(body, secret);

  const res = await fetch(`${BASE_URL}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ request: { ...body, signature } }),
  });

  const json = (await res.json()) as { response: T };
  return json.response;
}

export type CheckoutResponse = {
  checkout_url: string;
  payment_id: string;
};

export async function createCheckout(params: {
  order_id: string;
  order_desc: string;
  amount: number;
  currency?: string;
  server_callback_url: string;
  response_url: string;
  merchant_data?: string;
  subscription?: "Y";
  subscription_callback_url?: string;
}): Promise<CheckoutResponse> {
  return request<CheckoutResponse>("checkout/url/", {
    ...params,
    currency: params.currency ?? "UAH",
  });
}

export async function getOrderStatus(orderId: string) {
  return request<{ order_status: string; amount: number }>(
    "status/order_id/",
    { order_id: orderId }
  );
}
