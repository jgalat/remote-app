import { env } from "cloudflare:workers";

export async function grantProEntitlement(appId: string): Promise<void> {
  const res = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${appId}/entitlements/pro/promotional`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.REVENUECAT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ duration: "lifetime" }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`RevenueCat error: ${res.status} ${body}`);
  }
}
