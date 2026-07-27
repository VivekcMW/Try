/**
 * Ably server-side singleton.
 * The root API key (ABLY_API_KEY) is server-side only.
 * Mobile clients request a short-lived token via /api/mobile/chat/ably-token.
 */
import Ably from "ably";

let _client: Ably.Rest | null = null;

export function getAblyServer(): Ably.Rest {
  if (!_client) {
    const key = process.env.ABLY_API_KEY;
    if (!key) {
      // In E2E / dev without key, return a stub that no-ops publish
      return {
        channels: {
          get: () => ({
            publish: async () => {},
          }),
        },
      } as unknown as Ably.Rest;
    }
    _client = new Ably.Rest({ key });
  }
  return _client;
}

/** Publish a message to a chat channel. Safe to call even if Ably is not configured. */
export async function publishChatMessage(
  threadId: string,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    const client = getAblyServer();
    const channel = client.channels.get(`chat:${threadId}`);
    await channel.publish("message", payload);
  } catch {
    // Non-fatal — message is already in DB; real-time delivery is best-effort
  }
}

/**
 * Publish an SOS alert to the pinCode channel so all subscribed devices receive
 * the incident in real-time without polling.
 */
export async function publishSosAlert(
  pinCode: string,
  incident: Record<string, unknown>
): Promise<void> {
  try {
    const client  = getAblyServer();
    const channel = client.channels.get(`sos:${pinCode}`);
    await channel.publish("incident", incident);
  } catch {
    // Non-fatal — safety screen will still work via pull-to-refresh
  }
}

/** Issue a client token with capability limited to chat + SOS channels for this user. */
export async function createAblyToken(userId: string): Promise<Ably.TokenRequest | null> {
  const key = process.env.ABLY_API_KEY;
  if (!key) return null;
  const client = new Ably.Rest({ key });
  const token = await client.auth.createTokenRequest({
    clientId: userId,
    capability: {
      "chat:*": ["subscribe", "publish", "presence"],
      "sos:*":  ["subscribe"],
    },
    ttl: 3_600_000, // 1 hour
  });
  return token;
}
