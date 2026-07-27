// Static hyperlocal store & quick-item catalog — these are existing neighborhood
// businesses (not user-generated content), so they live here rather than as
// backend models. Orders placed against them are real, backend-backed data.

export interface Store {
  id: string;
  name: string;
  category: string;
  distance: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  deliveryFeePaise: number;
  minOrderPaise: number;
  isOpen: boolean;
  isNeighborhood: boolean;
  offers?: string;
  featured?: boolean;
}

export interface QuickItem {
  id: string;
  name: string;
  store: string;
  storeId: string;
  pricePaise: number;
  originalPricePaise?: number;
  image: string;
  deliveryTime: string;
}

export const STORES: Store[] = [
  {
    id: '1',
    name: 'Fresh Mart',
    category: 'grocery',
    distance: '0.3 km',
    rating: 4.8,
    reviews: 256,
    deliveryTime: '15-20 min',
    deliveryFeePaise: 0,
    minOrderPaise: 9900,
    isOpen: true,
    isNeighborhood: true,
    offers: '20% off on first order',
    featured: true,
  },
  {
    id: '2',
    name: 'Sharma Dairy',
    category: 'dairy',
    distance: '0.2 km',
    rating: 4.9,
    reviews: 189,
    deliveryTime: '10-15 min',
    deliveryFeePaise: 0,
    minOrderPaise: 5000,
    isOpen: true,
    isNeighborhood: true,
  },
  {
    id: '3',
    name: 'Green Leaf Vegetables',
    category: 'vegetables',
    distance: '0.4 km',
    rating: 4.7,
    reviews: 134,
    deliveryTime: '20-25 min',
    deliveryFeePaise: 1000,
    minOrderPaise: 15000,
    isOpen: true,
    isNeighborhood: true,
    offers: 'Free delivery above ₹300',
  },
  {
    id: '4',
    name: 'MedPlus Pharmacy',
    category: 'pharmacy',
    distance: '0.5 km',
    rating: 4.6,
    reviews: 312,
    deliveryTime: '25-30 min',
    deliveryFeePaise: 2500,
    minOrderPaise: 0,
    isOpen: true,
    isNeighborhood: false,
  },
  {
    id: '5',
    name: 'Home Kitchen by Anita',
    category: 'food',
    distance: '0.1 km',
    rating: 4.9,
    reviews: 87,
    deliveryTime: '20-30 min',
    deliveryFeePaise: 0,
    minOrderPaise: 10000,
    isOpen: true,
    isNeighborhood: true,
    featured: true,
  },
  {
    id: '6',
    name: 'The Cake Studio',
    category: 'bakery',
    distance: '0.6 km',
    rating: 4.8,
    reviews: 156,
    deliveryTime: '30-40 min',
    deliveryFeePaise: 3000,
    minOrderPaise: 20000,
    isOpen: false,
    isNeighborhood: false,
  },
  {
    id: '7',
    name: 'Bansal Kirana Store',
    category: 'kirana',
    distance: '0.25 km',
    rating: 4.5,
    reviews: 421,
    deliveryTime: '10-15 min',
    deliveryFeePaise: 0,
    minOrderPaise: 8000,
    isOpen: true,
    isNeighborhood: true,
    offers: 'Buy 2 get 1 on atta & rice',
  },
  {
    id: '8',
    name: 'Coastal Fish & Meat Mart',
    category: 'meat',
    distance: '0.7 km',
    rating: 4.6,
    reviews: 98,
    deliveryTime: '30-35 min',
    deliveryFeePaise: 2000,
    minOrderPaise: 20000,
    isOpen: true,
    isNeighborhood: false,
  },
  {
    id: '9',
    name: 'Om Stationery & Books',
    category: 'stationery',
    distance: '0.5 km',
    rating: 4.4,
    reviews: 63,
    deliveryTime: '20-25 min',
    deliveryFeePaise: 1500,
    minOrderPaise: 5000,
    isOpen: true,
    isNeighborhood: false,
  },
  {
    id: '10',
    name: "Iyer's Snacks & Bakery",
    category: 'bakery',
    distance: '0.45 km',
    rating: 4.7,
    reviews: 203,
    deliveryTime: '20-30 min',
    deliveryFeePaise: 1000,
    minOrderPaise: 10000,
    isOpen: true,
    isNeighborhood: true,
    offers: 'Fresh batch every morning',
  },
  {
    id: '11',
    name: 'Apollo Health Pharmacy',
    category: 'pharmacy',
    distance: '0.8 km',
    rating: 4.7,
    reviews: 274,
    deliveryTime: '20-25 min',
    deliveryFeePaise: 2000,
    minOrderPaise: 0,
    isOpen: true,
    isNeighborhood: false,
    featured: true,
  },
];

export const QUICK_ITEMS: QuickItem[] = [
  { id: '1', name: 'Amul Milk 500ml', store: 'Sharma Dairy', storeId: '2', pricePaise: 2800, image: '🥛', deliveryTime: '10 min' },
  { id: '2', name: 'Fresh Bread', store: 'Fresh Mart', storeId: '1', pricePaise: 3500, image: '🍞', deliveryTime: '15 min' },
  { id: '3', name: 'Farm Eggs (6)', store: 'Fresh Mart', storeId: '1', pricePaise: 4800, originalPricePaise: 5500, image: '🥚', deliveryTime: '15 min' },
  { id: '4', name: 'Curd 400g', store: 'Sharma Dairy', storeId: '2', pricePaise: 3200, image: '🥣', deliveryTime: '10 min' },
  { id: '5', name: 'Basmati Rice 1kg', store: 'Bansal Kirana Store', storeId: '7', pricePaise: 11000, image: '🍚', deliveryTime: '15 min' },
  { id: '6', name: 'Pomfret Fish (500g)', store: 'Coastal Fish & Meat Mart', storeId: '8', pricePaise: 22000, originalPricePaise: 25000, image: '🐟', deliveryTime: '30 min' },
  { id: '7', name: 'Butter Croissant', store: "Iyer's Snacks & Bakery", storeId: '10', pricePaise: 4500, image: '🥐', deliveryTime: '25 min' },
  { id: '8', name: 'Notebook (200 pages)', store: 'Om Stationery & Books', storeId: '9', pricePaise: 4000, image: '📓', deliveryTime: '20 min' },
];
