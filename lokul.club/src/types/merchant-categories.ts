/**
 * Merchant Category Type System
 * Single source of truth for all merchant categories across web and mobile
 */

// ────────────────────────────────────────────────────────────────────────────
// CORE TYPES
// ────────────────────────────────────────────────────────────────────────────

export type WorkflowProfile =
  | "retail"
  | "food"
  | "appointments"
  | "home_services"
  | "subscriptions"
  | "events";

export type MerchantCategory =
  // Retail & Shops (20 categories)
  | "kirana"
  | "pharmacy"
  | "paan_shop"
  | "bakery"
  | "dairy"
  | "meat"
  | "vegetables"
  | "gift_shop"
  | "stationery"
  | "electronics"
  | "hardware"
  | "clothing"
  | "footwear"
  | "toys"
  | "jewellery"
  | "mobile"
  | "nursery"
  | "water"
  // Food & Beverages (6 categories)
  | "restaurant"
  | "cafe"
  | "tiffin"
  | "sweet_shop"
  | "juice_bar"
  | "catering"
  // Beauty, Health & Wellness (12 categories)
  | "salon"
  | "beauty_parlour"
  | "spa"
  | "clinic"
  | "dental"
  | "dentist"
  | "physio"
  | "gym"
  | "fitness"
  | "yoga"
  | "yoga_studio"
  | "ayurveda"
  // Home Services (16 categories)
  | "plumber"
  | "electrician"
  | "carpenter"
  | "painter"
  | "ac_repair"
  | "cleaning"
  | "laundry"
  | "tailor"
  | "car_wash"
  | "pest_control"
  | "appliance"
  | "repair"
  | "packers"
  | "courier"
  | "security"
  | "cycle"
  // Professional Services (2 categories)
  | "ca_legal"
  | "insurance"
  // Education & Classes (5 categories)
  | "tuition"
  | "hobby_classes"
  | "daycare"
  | "childcare"
  | "driving"
  // Pet & Senior Care (2 categories)
  | "petcare"
  | "senior"
  // Subscriptions (3 categories)
  | "newspaper"
  | "milk_delivery"
  | "water_can"
  // Events & Services (6 categories)
  | "events"
  | "realestate"
  | "travel"
  | "photography"
  | "decorator"
  | "caterer_events"
  // Other
  | "other";

// ────────────────────────────────────────────────────────────────────────────
// METADATA INTERFACE
// ────────────────────────────────────────────────────────────────────────────

export interface CategoryMetadata {
  label: string;           // Human-readable display name
  emoji: string;           // Visual identifier (e.g., "🛒")
  color: string;           // Brand color in hex (e.g., "#10B981")
  workflowProfile: WorkflowProfile;
  keywords: string[];      // For search/filtering
  description?: string;    // Optional description for tooltips
}

// ────────────────────────────────────────────────────────────────────────────
// CATEGORY METADATA (Single Source of Truth)
// ────────────────────────────────────────────────────────────────────────────

export const CATEGORY_META: Record<MerchantCategory, CategoryMetadata> = {
  // ───────────────────────────────────────────────────────────────────────
  // RETAIL & SHOPS
  // ───────────────────────────────────────────────────────────────────────
  kirana: {
    label: "Kirana / Grocery",
    emoji: "🛒",
    color: "#10B981",
    workflowProfile: "retail",
    keywords: ["kirana", "grocery", "general store", "provisions", "daily needs"],
    description: "Neighborhood grocery and general store",
  },
  pharmacy: {
    label: "Pharmacy",
    emoji: "💊",
    color: "#06B6D4",
    workflowProfile: "retail",
    keywords: ["pharmacy", "medical store", "medicines", "chemist", "drugstore"],
    description: "Medical and pharmaceutical supplies",
  },
  paan_shop: {
    label: "Paan / Pan Masala",
    emoji: "🌿",
    color: "#84CC16",
    workflowProfile: "retail",
    keywords: ["paan", "pan", "betel leaf", "tobacco", "gutka"],
    description: "Paan, tobacco, and related products",
  },
  bakery: {
    label: "Bakery",
    emoji: "🍞",
    color: "#D97706",
    workflowProfile: "retail",
    keywords: ["bakery", "bread", "cakes", "pastries", "baked goods"],
    description: "Bread, cakes, and baked goods",
  },
  dairy: {
    label: "Dairy / Milk Booth",
    emoji: "🥛",
    color: "#38BDF8",
    workflowProfile: "retail",
    keywords: ["dairy", "milk", "curd", "butter", "paneer"],
    description: "Milk and dairy products",
  },
  meat: {
    label: "Meat Shop",
    emoji: "🍖",
    color: "#DC2626",
    workflowProfile: "retail",
    keywords: ["meat", "chicken", "mutton", "fish", "butcher"],
    description: "Fresh meat and seafood",
  },
  vegetables: {
    label: "Vegetable Shop",
    emoji: "🥕",
    color: "#22C55E",
    workflowProfile: "retail",
    keywords: ["vegetables", "fruits", "fresh produce", "greens"],
    description: "Fresh vegetables and fruits",
  },
  gift_shop: {
    label: "Gift / Florist",
    emoji: "🎁",
    color: "#F472B6",
    workflowProfile: "retail",
    keywords: ["gifts", "flowers", "florist", "bouquet", "presents"],
    description: "Gifts, flowers, and decorative items",
  },
  stationery: {
    label: "Stationery / Books",
    emoji: "📚",
    color: "#A78BFA",
    workflowProfile: "retail",
    keywords: ["stationery", "books", "pens", "notebooks", "office supplies"],
    description: "Stationery and book supplies",
  },
  electronics: {
    label: "Electronics / Mobile",
    emoji: "📱",
    color: "#60A5FA",
    workflowProfile: "retail",
    keywords: ["electronics", "mobile", "gadgets", "appliances", "phones"],
    description: "Electronics and mobile devices",
  },
  hardware: {
    label: "Hardware / Tools",
    emoji: "🔩",
    color: "#78716C",
    workflowProfile: "retail",
    keywords: ["hardware", "tools", "construction", "building materials"],
    description: "Hardware and construction materials",
  },
  clothing: {
    label: "Clothing / Garments",
    emoji: "👗",
    color: "#FB923C",
    workflowProfile: "retail",
    keywords: ["clothing", "garments", "fashion", "apparel", "clothes"],
    description: "Clothing and fashion items",
  },
  footwear: {
    label: "Footwear",
    emoji: "👟",
    color: "#F97316",
    workflowProfile: "retail",
    keywords: ["footwear", "shoes", "sandals", "slippers", "boots"],
    description: "Shoes and footwear",
  },
  toys: {
    label: "Toy Store",
    emoji: "🧸",
    color: "#F59E0B",
    workflowProfile: "retail",
    keywords: ["toys", "games", "kids", "children", "playthings"],
    description: "Toys and games for children",
  },
  jewellery: {
    label: "Jewellery",
    emoji: "💍",
    color: "#EAB308",
    workflowProfile: "retail",
    keywords: ["jewellery", "jewelry", "gold", "silver", "ornaments"],
    description: "Jewelry and ornaments",
  },
  mobile: {
    label: "Mobile Shop",
    emoji: "📱",
    color: "#3B82F6",
    workflowProfile: "retail",
    keywords: ["mobile", "phone", "smartphone", "accessories", "repairs"],
    description: "Mobile phones and accessories",
  },
  nursery: {
    label: "Plant Nursery",
    emoji: "🌱",
    color: "#16A34A",
    workflowProfile: "retail",
    keywords: ["nursery", "plants", "garden", "flowers", "saplings"],
    description: "Plants and gardening supplies",
  },
  water: {
    label: "Water Can",
    emoji: "💧",
    color: "#0EA5E9",
    workflowProfile: "retail",
    keywords: ["water", "mineral water", "drinking water", "cans"],
    description: "Packaged drinking water",
  },

  // ───────────────────────────────────────────────────────────────────────
  // FOOD & BEVERAGES
  // ───────────────────────────────────────────────────────────────────────
  restaurant: {
    label: "Restaurant / Dhaba",
    emoji: "🍛",
    color: "#F97316",
    workflowProfile: "food",
    keywords: ["restaurant", "dhaba", "dining", "food", "meals"],
    description: "Restaurant and dining services",
  },
  cafe: {
    label: "Cafe / Tea Stall",
    emoji: "☕",
    color: "#92400E",
    workflowProfile: "food",
    keywords: ["cafe", "coffee", "tea", "beverages", "snacks"],
    description: "Cafe and tea services",
  },
  tiffin: {
    label: "Tiffin / Cloud Kitchen",
    emoji: "🍱",
    color: "#B45309",
    workflowProfile: "food",
    keywords: ["tiffin", "cloud kitchen", "home delivery", "meals", "dabba"],
    description: "Tiffin and home-cooked meal delivery",
  },
  sweet_shop: {
    label: "Sweet Shop / Halwai",
    emoji: "🍮",
    color: "#EF4444",
    workflowProfile: "food",
    keywords: ["sweets", "halwai", "mithai", "desserts", "confectionery"],
    description: "Traditional sweets and desserts",
  },
  juice_bar: {
    label: "Juice Bar",
    emoji: "🥤",
    color: "#16A34A",
    workflowProfile: "food",
    keywords: ["juice", "smoothie", "fresh juice", "beverages", "drinks"],
    description: "Fresh juice and beverages",
  },
  catering: {
    label: "Catering Service",
    emoji: "🍽️",
    color: "#EA580C",
    workflowProfile: "events",
    keywords: ["catering", "events", "parties", "bulk orders", "food service"],
    description: "Catering for events and parties",
  },

  // ───────────────────────────────────────────────────────────────────────
  // BEAUTY, HEALTH & WELLNESS
  // ───────────────────────────────────────────────────────────────────────
  salon: {
    label: "Unisex Salon",
    emoji: "✂️",
    color: "#EC4899",
    workflowProfile: "appointments",
    keywords: ["salon", "haircut", "hair", "styling", "grooming"],
    description: "Hair salon and grooming services",
  },
  beauty_parlour: {
    label: "Beauty Parlour",
    emoji: "💄",
    color: "#DB2777",
    workflowProfile: "appointments",
    keywords: ["beauty", "parlour", "makeup", "facial", "cosmetics"],
    description: "Beauty treatments and makeup",
  },
  spa: {
    label: "Spa / Wellness",
    emoji: "🧖",
    color: "#8B5CF6",
    workflowProfile: "appointments",
    keywords: ["spa", "massage", "wellness", "relaxation", "therapy"],
    description: "Spa and wellness treatments",
  },
  clinic: {
    label: "Clinic / Doctor",
    emoji: "🩺",
    color: "#0EA5E9",
    workflowProfile: "appointments",
    keywords: ["clinic", "doctor", "medical", "health", "consultation"],
    description: "Medical clinic and consultation",
  },
  dental: {
    label: "Dental Clinic",
    emoji: "🦷",
    color: "#0284C7",
    workflowProfile: "appointments",
    keywords: ["dental", "dentist", "teeth", "orthodontics", "oral care"],
    description: "Dental care and treatment",
  },
  dentist: {
    label: "Dentist",
    emoji: "🦷",
    color: "#0284C7",
    workflowProfile: "appointments",
    keywords: ["dentist", "dental", "teeth", "oral health"],
    description: "Dental care services",
  },
  physio: {
    label: "Physiotherapy",
    emoji: "🏃",
    color: "#14B8A6",
    workflowProfile: "appointments",
    keywords: ["physiotherapy", "physio", "rehabilitation", "therapy", "recovery"],
    description: "Physiotherapy and rehabilitation",
  },
  gym: {
    label: "Gym / Fitness",
    emoji: "🏋️",
    color: "#EF4444",
    workflowProfile: "appointments",
    keywords: ["gym", "fitness", "workout", "exercise", "training"],
    description: "Gym and fitness center",
  },
  fitness: {
    label: "Fitness Center",
    emoji: "💪",
    color: "#DC2626",
    workflowProfile: "appointments",
    keywords: ["fitness", "gym", "training", "workout", "health"],
    description: "Fitness and training center",
  },
  yoga: {
    label: "Yoga Studio",
    emoji: "🧘",
    color: "#6366F1",
    workflowProfile: "appointments",
    keywords: ["yoga", "meditation", "wellness", "mindfulness", "asanas"],
    description: "Yoga and meditation classes",
  },
  yoga_studio: {
    label: "Yoga / Dance Studio",
    emoji: "🧘",
    color: "#6366F1",
    workflowProfile: "appointments",
    keywords: ["yoga", "dance", "studio", "classes", "fitness"],
    description: "Yoga and dance studio",
  },
  ayurveda: {
    label: "Ayurveda / Traditional Medicine",
    emoji: "🌿",
    color: "#059669",
    workflowProfile: "appointments",
    keywords: ["ayurveda", "herbal", "traditional medicine", "natural healing"],
    description: "Ayurvedic treatments and medicines",
  },

  // ───────────────────────────────────────────────────────────────────────
  // HOME SERVICES
  // ───────────────────────────────────────────────────────────────────────
  plumber: {
    label: "Plumber",
    emoji: "🔧",
    color: "#0891B2",
    workflowProfile: "home_services",
    keywords: ["plumber", "plumbing", "pipes", "leaks", "repairs"],
    description: "Plumbing services and repairs",
  },
  electrician: {
    label: "Electrician",
    emoji: "⚡",
    color: "#F59E0B",
    workflowProfile: "home_services",
    keywords: ["electrician", "electrical", "wiring", "repairs", "installation"],
    description: "Electrical work and repairs",
  },
  carpenter: {
    label: "Carpenter",
    emoji: "🪚",
    color: "#92400E",
    workflowProfile: "home_services",
    keywords: ["carpenter", "woodwork", "furniture", "repairs", "installation"],
    description: "Carpentry and woodwork",
  },
  painter: {
    label: "Painter",
    emoji: "🎨",
    color: "#8B5CF6",
    workflowProfile: "home_services",
    keywords: ["painter", "painting", "walls", "home improvement", "decoration"],
    description: "Painting and wall treatments",
  },
  ac_repair: {
    label: "AC Repair",
    emoji: "❄️",
    color: "#06B6D4",
    workflowProfile: "home_services",
    keywords: ["ac repair", "air conditioning", "cooling", "hvac", "servicing"],
    description: "AC repair and maintenance",
  },
  cleaning: {
    label: "Cleaning Service",
    emoji: "🧹",
    color: "#10B981",
    workflowProfile: "home_services",
    keywords: ["cleaning", "housekeeping", "maid", "sanitation", "deep clean"],
    description: "Home and office cleaning",
  },
  laundry: {
    label: "Laundry / Dry Clean",
    emoji: "👔",
    color: "#3B82F6",
    workflowProfile: "home_services",
    keywords: ["laundry", "dry cleaning", "washing", "ironing", "clothes"],
    description: "Laundry and dry cleaning services",
  },
  tailor: {
    label: "Tailor / Alterations",
    emoji: "🪡",
    color: "#EC4899",
    workflowProfile: "home_services",
    keywords: ["tailor", "stitching", "alterations", "sewing", "garments"],
    description: "Tailoring and alterations",
  },
  car_wash: {
    label: "Car Wash / Detailing",
    emoji: "🚗",
    color: "#0EA5E9",
    workflowProfile: "home_services",
    keywords: ["car wash", "detailing", "cleaning", "auto care", "vehicle"],
    description: "Car washing and detailing",
  },
  pest_control: {
    label: "Pest Control",
    emoji: "🐛",
    color: "#84CC16",
    workflowProfile: "home_services",
    keywords: ["pest control", "fumigation", "insects", "termites", "rodents"],
    description: "Pest control and fumigation",
  },
  appliance: {
    label: "Appliance Repair",
    emoji: "🔌",
    color: "#6B7280",
    workflowProfile: "home_services",
    keywords: ["appliance", "repair", "washing machine", "refrigerator", "servicing"],
    description: "Home appliance repair",
  },
  repair: {
    label: "General Repair",
    emoji: "🛠️",
    color: "#57534E",
    workflowProfile: "home_services",
    keywords: ["repair", "maintenance", "fixing", "handyman", "general"],
    description: "General repair and maintenance",
  },
  packers: {
    label: "Packers & Movers",
    emoji: "📦",
    color: "#D97706",
    workflowProfile: "home_services",
    keywords: ["packers", "movers", "relocation", "shifting", "transportation"],
    description: "Packing and moving services",
  },
  courier: {
    label: "Courier / Delivery",
    emoji: "🚚",
    color: "#F97316",
    workflowProfile: "home_services",
    keywords: ["courier", "delivery", "logistics", "shipping", "parcel"],
    description: "Courier and delivery services",
  },
  security: {
    label: "Security Service",
    emoji: "🛡️",
    color: "#475569",
    workflowProfile: "home_services",
    keywords: ["security", "guard", "surveillance", "protection", "safety"],
    description: "Security and surveillance services",
  },
  cycle: {
    label: "Cycle Repair",
    emoji: "🚲",
    color: "#22C55E",
    workflowProfile: "home_services",
    keywords: ["cycle", "bicycle", "repair", "servicing", "bike"],
    description: "Bicycle repair and maintenance",
  },

  // ───────────────────────────────────────────────────────────────────────
  // PROFESSIONAL SERVICES
  // ───────────────────────────────────────────────────────────────────────
  ca_legal: {
    label: "CA / Legal Services",
    emoji: "⚖️",
    color: "#1E40AF",
    workflowProfile: "home_services",
    keywords: ["CA", "legal", "lawyer", "accountant", "tax", "consultation"],
    description: "Chartered Accountant and legal services",
  },
  insurance: {
    label: "Insurance Agent",
    emoji: "🛡️",
    color: "#0369A1",
    workflowProfile: "home_services",
    keywords: ["insurance", "policy", "agent", "life insurance", "health insurance"],
    description: "Insurance products and services",
  },

  // ───────────────────────────────────────────────────────────────────────
  // EDUCATION & CLASSES
  // ───────────────────────────────────────────────────────────────────────
  tuition: {
    label: "Tuition / Coaching",
    emoji: "📖",
    color: "#7C3AED",
    workflowProfile: "appointments",
    keywords: ["tuition", "coaching", "classes", "education", "teaching"],
    description: "Tutoring and coaching classes",
  },
  hobby_classes: {
    label: "Hobby Classes",
    emoji: "🎭",
    color: "#C026D3",
    workflowProfile: "appointments",
    keywords: ["hobby", "classes", "art", "music", "dance", "skills"],
    description: "Art, music, and hobby classes",
  },
  daycare: {
    label: "Daycare / Creche",
    emoji: "👶",
    color: "#FB923C",
    workflowProfile: "appointments",
    keywords: ["daycare", "creche", "childcare", "kids", "nursery"],
    description: "Daycare and childcare services",
  },
  childcare: {
    label: "Childcare",
    emoji: "👶",
    color: "#FD7E14",
    workflowProfile: "appointments",
    keywords: ["childcare", "babysitting", "nanny", "kids", "care"],
    description: "Childcare and babysitting",
  },
  driving: {
    label: "Driving School",
    emoji: "🚗",
    color: "#2563EB",
    workflowProfile: "appointments",
    keywords: ["driving", "school", "lessons", "license", "training"],
    description: "Driving lessons and training",
  },

  // ───────────────────────────────────────────────────────────────────────
  // PET & SENIOR CARE
  // ───────────────────────────────────────────────────────────────────────
  petcare: {
    label: "Pet Care / Vet",
    emoji: "🐾",
    color: "#F97316",
    workflowProfile: "appointments",
    keywords: ["pet", "veterinary", "vet", "animals", "grooming", "clinic"],
    description: "Pet care and veterinary services",
  },
  senior: {
    label: "Senior Care",
    emoji: "👴",
    color: "#6366F1",
    workflowProfile: "appointments",
    keywords: ["senior", "elderly", "care", "nursing", "home care"],
    description: "Senior citizen care services",
  },

  // ───────────────────────────────────────────────────────────────────────
  // SUBSCRIPTIONS
  // ───────────────────────────────────────────────────────────────────────
  newspaper: {
    label: "Newspaper Delivery",
    emoji: "📰",
    color: "#374151",
    workflowProfile: "subscriptions",
    keywords: ["newspaper", "delivery", "subscription", "daily", "press"],
    description: "Newspaper delivery subscription",
  },
  milk_delivery: {
    label: "Milk Delivery",
    emoji: "🥛",
    color: "#38BDF8",
    workflowProfile: "subscriptions",
    keywords: ["milk", "delivery", "subscription", "daily", "dairy"],
    description: "Daily milk delivery subscription",
  },
  water_can: {
    label: "Water Can Subscription",
    emoji: "💧",
    color: "#06B6D4",
    workflowProfile: "subscriptions",
    keywords: ["water", "can", "subscription", "delivery", "drinking water"],
    description: "Water can delivery subscription",
  },

  // ───────────────────────────────────────────────────────────────────────
  // EVENTS & SERVICES
  // ───────────────────────────────────────────────────────────────────────
  events: {
    label: "Event Management",
    emoji: "🎉",
    color: "#EC4899",
    workflowProfile: "events",
    keywords: ["events", "management", "planning", "weddings", "parties"],
    description: "Event planning and management",
  },
  realestate: {
    label: "Real Estate / Property",
    emoji: "🏠",
    color: "#0369A1",
    workflowProfile: "events",
    keywords: ["real estate", "property", "broker", "agent", "housing"],
    description: "Real estate and property services",
  },
  travel: {
    label: "Travel Agency",
    emoji: "✈️",
    color: "#0EA5E9",
    workflowProfile: "events",
    keywords: ["travel", "tourism", "agency", "tours", "packages"],
    description: "Travel and tour packages",
  },
  photography: {
    label: "Photography",
    emoji: "📸",
    color: "#9333EA",
    workflowProfile: "events",
    keywords: ["photography", "photo", "videography", "events", "portraits"],
    description: "Photography and videography services",
  },
  decorator: {
    label: "Decorator / Florist",
    emoji: "🎨",
    color: "#DB2777",
    workflowProfile: "events",
    keywords: ["decorator", "decoration", "florist", "events", "weddings"],
    description: "Event decoration services",
  },
  caterer_events: {
    label: "Event Catering",
    emoji: "🍽️",
    color: "#DC2626",
    workflowProfile: "events",
    keywords: ["catering", "events", "food", "parties", "bulk orders"],
    description: "Event catering services",
  },

  // ───────────────────────────────────────────────────────────────────────
  // OTHER
  // ───────────────────────────────────────────────────────────────────────
  other: {
    label: "Other",
    emoji: "🏪",
    color: "#6B7280",
    workflowProfile: "retail",
    keywords: ["other", "miscellaneous", "general"],
    description: "Other services",
  },
};

// ────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Get human-readable label for a category
 */
export function getCategoryLabel(category: MerchantCategory): string {
  return CATEGORY_META[category]?.label ?? category;
}

/**
 * Get emoji for a category
 */
export function getCategoryEmoji(category: MerchantCategory): string {
  return CATEGORY_META[category]?.emoji ?? "🏪";
}

/**
 * Get color for a category
 */
export function getCategoryColor(category: MerchantCategory): string {
  return CATEGORY_META[category]?.color ?? "#6B7280";
}

/**
 * Get workflow profile for a category
 */
export function getCategoryWorkflow(category: MerchantCategory): WorkflowProfile {
  return CATEGORY_META[category]?.workflowProfile ?? "retail";
}

/**
 * Get keywords for a category (for search)
 */
export function getCategoryKeywords(category: MerchantCategory): string[] {
  return CATEGORY_META[category]?.keywords ?? [category];
}

/**
 * Get description for a category
 */
export function getCategoryDescription(category: MerchantCategory): string | undefined {
  return CATEGORY_META[category]?.description;
}

/**
 * Get all categories for a specific workflow profile
 */
export function getCategoriesByWorkflow(workflow: WorkflowProfile): MerchantCategory[] {
  return Object.entries(CATEGORY_META)
    .filter(([_, meta]) => meta.workflowProfile === workflow)
    .map(([category]) => category as MerchantCategory);
}

/**
 * Search categories by keyword
 */
export function searchCategories(query: string): MerchantCategory[] {
  const lowerQuery = query.toLowerCase();
  return Object.entries(CATEGORY_META)
    .filter(([_, meta]) => {
      const searchText = [meta.label, ...meta.keywords].join(" ").toLowerCase();
      return searchText.includes(lowerQuery);
    })
    .map(([category]) => category as MerchantCategory);
}

// ────────────────────────────────────────────────────────────────────────────
// CATEGORY GROUPS (For UI Display)
// ────────────────────────────────────────────────────────────────────────────

export interface CategoryGroup {
  workflow: WorkflowProfile;
  label: string;
  icon: string;
  categories: MerchantCategory[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    workflow: "retail",
    label: "Retail & Shops",
    icon: "🛒",
    categories: getCategoriesByWorkflow("retail"),
  },
  {
    workflow: "food",
    label: "Food & Beverages",
    icon: "🍛",
    categories: getCategoriesByWorkflow("food"),
  },
  {
    workflow: "appointments",
    label: "Health, Beauty & Classes",
    icon: "✂️",
    categories: getCategoriesByWorkflow("appointments"),
  },
  {
    workflow: "home_services",
    label: "Home & Professional Services",
    icon: "🔧",
    categories: getCategoriesByWorkflow("home_services"),
  },
  {
    workflow: "subscriptions",
    label: "Subscription Services",
    icon: "📰",
    categories: getCategoriesByWorkflow("subscriptions"),
  },
  {
    workflow: "events",
    label: "Events & Real Estate",
    icon: "🎉",
    categories: getCategoriesByWorkflow("events"),
  },
];

// ────────────────────────────────────────────────────────────────────────────
// TYPE GUARDS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Type guard to check if a string is a valid MerchantCategory
 */
export function isMerchantCategory(value: unknown): value is MerchantCategory {
  return typeof value === "string" && value in CATEGORY_META;
}

/**
 * Safely convert a string to MerchantCategory (returns 'other' if invalid)
 */
export function toMerchantCategory(value: string | null | undefined): MerchantCategory {
  if (!value) return "other";
  return isMerchantCategory(value) ? value : "other";
}
