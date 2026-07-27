// Types shared by the PRD §05 peer-role dashboards.
export interface MenuItem {
  id: string;
  name: string;
  priceRupees: number;
  veg: boolean;
  available: boolean;
  notes?: string;
}

export interface CookOrder {
  id: string;
  buyerName: string;
  buyerFlat: string;
  items: { name: string; qty: number; priceRupees: number }[];
  status: 'new' | 'accepted' | 'cooking' | 'ready' | 'delivered' | 'cancelled';
  placedAt: number;
  pickupAt: number;
  paid: boolean;
  totalRupees: number;
}

// Rider
export interface ErrandRequest {
  id: string;
  fromFlat: string;
  customerName: string;
  customerPhone?: string | null;
  pickup: string;
  drop: string;
  distanceKm: number;
  feeRupees: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'done';
  notes?: string;
  postedAt: number;
}

// Coach
export interface CoachBatch {
  id: string;
  title: string;
  category: 'fitness' | 'yoga' | 'music' | 'academics' | 'dance' | 'other';
  days: string; // e.g. "Mon, Wed, Fri"
  time: string; // "6:00 AM"
  durationMin: number;
  feeRupees: number; // per month
  capacity: number;
  enrolled: number;
  waitlist: number;
  rating: number;
}

// Reseller
export interface ResellerListing {
  id: string;
  title: string;
  category: string;
  buyPriceRupees: number;
  resellPriceRupees: number;
  stock: number;
  sold: number;
  imageHint: string;
  active: boolean;
}
