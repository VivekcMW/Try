/**
 * Ably Realtime client for the mobile app.
 * Uses token-request auth — the root API key never leaves the server.
 *
 * Usage:
 *   const channel = await getAblyChannel('chat:threadId');
 *   const sub = channel.subscribe('message', handler);
 *   // cleanup: channel.unsubscribe(sub); getAblyClient().close();
 */
import Ably from 'ably';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

let _client: Ably.Realtime | null = null;

export function getAblyClient(userId: string): Ably.Realtime {
  if (_client) return _client;
  _client = new Ably.Realtime({
    authUrl: `${BASE}/api/mobile/chat/ably-token?userId=${userId}`,
    authMethod: 'GET',
    clientId: userId,
    // Fallback: if Ably key is not configured the server returns 204 and we
    // catch the auth error below — the screen gracefully falls back to polling.
  });
  _client.connection.on('failed', () => {
    _client = null; // allow re-creation
  });
  return _client;
}

export function disposeAblyClient(): void {
  if (_client) {
    _client.close();
    _client = null;
  }
}
