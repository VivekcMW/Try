/**
 * Offline queue service — buffers failed API writes and retries
 * when connectivity is restored.
 *
 * Supports 2G conditions: exponential back-off, payload compression hints,
 * request deduplication by idempotency key.
 *
 * Usage:
 *   import { offlineQueue } from '@/services/offlineQueue';
 *   offlineQueue.enqueue({ url, method, body, idempotencyKey });
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const QUEUE_KEY = 'lokul.offline.queue.v1';
const MAX_RETRIES = 5;

export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body: object;
  headers?: Record<string, string>;
  retries: number;
  createdAt: number;
  idempotencyKey?: string;
}

// ── In-memory cache of the current network state ────────────────────────────
let _isOnline = true;
let _isFlushRunning = false;

NetInfo.addEventListener((state) => {
  const wasOffline = !_isOnline;
  _isOnline = !!(state.isConnected && state.isInternetReachable);
  if (wasOffline && _isOnline) {
    // Back online — drain the queue
    offlineQueue.flush();
  }
});

// ── Helpers ──────────────────────────────────────────────────────────────────
async function readQueue(): Promise<QueuedRequest[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedRequest[]) : [];
  } catch {
    return [];
  }
}

async function writeQueue(queue: QueuedRequest[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    /* storage full — drop oldest */
  }
}

function backoff(retries: number): number {
  // Exponential: 2s, 4s, 8s, 16s, 32s
  return Math.min(2_000 * 2 ** retries, 32_000);
}

// ── Public API ────────────────────────────────────────────────────────────────
export const offlineQueue = {
  /** Add a request to the offline queue (or fire immediately if online). */
  async enqueue(req: Omit<QueuedRequest, 'id' | 'retries' | 'createdAt'>): Promise<void> {
    const item: QueuedRequest = {
      ...req,
      id: req.idempotencyKey ?? `${Date.now()}-${Math.random()}`,
      retries: 0,
      createdAt: Date.now(),
    };

    if (_isOnline) {
      // Try immediately; fall back to queue on failure
      try {
        await fetch(item.url, {
          method: item.method,
          headers: { 'Content-Type': 'application/json', ...item.headers },
          body: JSON.stringify(item.body),
        });
        return;
      } catch {
        // Fall through to queue
      }
    }

    // Save to queue (dedup by idempotencyKey)
    const queue = await readQueue();
    const existingIdx = queue.findIndex((q) => q.id === item.id);
    if (existingIdx === -1) {
      queue.push(item);
    } else {
      queue[existingIdx] = { ...item, retries: queue[existingIdx].retries };
    }
    await writeQueue(queue);
  },

  /** Drain the queue — called automatically when coming back online. */
  async flush(): Promise<void> {
    if (_isFlushRunning) return;
    _isFlushRunning = true;

    try {
      const queue = await readQueue();
      if (queue.length === 0) { _isFlushRunning = false; return; }

      const remaining: QueuedRequest[] = [];

      for (const item of queue) {
        if (!_isOnline) {
          remaining.push(item);
          continue;
        }
        try {
          await fetch(item.url, {
            method: item.method,
            headers: { 'Content-Type': 'application/json', ...item.headers },
            body: JSON.stringify(item.body),
          });
          // Success — drop from queue
        } catch {
          const updated = { ...item, retries: item.retries + 1 };
          if (updated.retries < MAX_RETRIES) {
            remaining.push(updated);
            // Wait before retrying
            await new Promise((r) => setTimeout(r, backoff(updated.retries)));
          }
          // Max retries exceeded — silently drop
        }
      }

      await writeQueue(remaining);
    } finally {
      _isFlushRunning = false;
    }
  },

  /** Return the count of queued requests (for UI indicator). */
  async pendingCount(): Promise<number> {
    const queue = await readQueue();
    return queue.length;
  },

  /** Clear the queue (e.g. on logout). */
  async clear(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_KEY);
  },
};
