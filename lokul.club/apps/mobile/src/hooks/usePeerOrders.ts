/**
 * usePeerOrders — fetches orders for the logged-in user acting as seller.
 *
 * Falls back gracefully when no userId is set (dev / offline).
 * Refresh by calling `reload()`.
 */
import { useCallback, useEffect, useState } from 'react';
import { useWalletStore } from '@/store/walletStore';

export type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface PeerOrder {
  id: string;
  status: OrderStatus;
  amountPaise: number;
  note?: string | null;
  createdAt: string;
  buyer: { id: string; name: string; avatarUrl: string | null; phone?: string | null };
  listing?: { id: string; category: string; title: string } | null;
}

interface UsePeerOrdersResult {
  orders: PeerOrder[];
  loading: boolean;
  reload: () => void;
}

export function usePeerOrders(): UsePeerOrdersResult {
  const userId = useWalletStore((s) => s.userId);
  const [orders, setOrders] = useState<PeerOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const base = process.env.EXPO_PUBLIC_API_BASE ?? '';
      const res = await fetch(`${base}/api/mobile/orders?userId=${userId}&role=seller&limit=50`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.items ?? []);
      }
    } catch {
      // network unavailable — keep previous data
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  return { orders, loading, reload: load };
}
