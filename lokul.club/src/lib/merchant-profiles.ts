import {
  LayoutDashboard,
  Package,
  Tag,
  Ticket,
  CalendarDays,
  ShoppingCart,
  Users,
  Wallet,
  BarChart2,
  GitBranch,
  Settings,
  ClipboardList,
  BookOpen,
  Briefcase,
  Star,
  CheckSquare,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

export type WorkflowProfile =
  | "retail"
  | "food"
  | "appointments"
  | "home_services"
  | "subscriptions"
  | "events";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

export interface ProfileLabels {
  orders: string;
  catalog: string;
  catalogItem: string;
  slots: string;
  customers: string;
  requests: string;
  jobs: string;
  bookings: string;
}

// ── Category → Profile mapping ──────────────────────────────────────────────

export const CATEGORY_TO_PROFILE: Record<string, WorkflowProfile> = {
  // Retail
  kirana: "retail",
  pharmacy: "retail",
  dairy: "retail",
  meat: "retail",
  vegetables: "retail",
  bakery: "retail",
  stationery: "retail",
  gifts: "retail",
  jewellery: "retail",
  mobile: "retail",
  hardware: "retail",
  nursery: "retail",
  water: "retail",
  tailor: "retail",
  other: "retail",

  // Food
  restaurant: "food",
  tiffin: "food",
  catering: "food",
  cafe: "food",
  sweet_shop: "food",

  // Appointments
  clinic: "appointments",
  salon: "appointments",
  fitness: "appointments",
  yoga: "appointments",
  ayurveda: "appointments",
  tutor: "appointments",
  driving: "appointments",
  petcare: "appointments",
  childcare: "appointments",
  senior: "appointments",
  spa: "appointments",
  dentist: "appointments",

  // Home Services
  electrician: "home_services",
  plumber: "home_services",
  carpenter: "home_services",
  painter: "home_services",
  cleaning: "home_services",
  laundry: "home_services",
  appliance: "home_services",
  repair: "home_services",
  packers: "home_services",
  courier: "home_services",
  security: "home_services",
  cycle: "home_services",
  ca_legal: "home_services",
  insurance: "home_services",

  // Subscriptions
  newspaper: "subscriptions",
  milk_delivery: "subscriptions",
  water_can: "subscriptions",

  // Events
  events: "events",
  realestate: "events",
  travel: "events",
  photography: "events",
  decorator: "events",
  caterer_events: "events",
};

// ── Nav items per profile ────────────────────────────────────────────────────

const BASE_NAV: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/merchant" },
];

const COMMON_TAIL: NavItem[] = [
  { icon: Users,     label: "Customers", href: "/merchant/customers" },
  { icon: Wallet,    label: "Earnings",  href: "/merchant/earnings" },
  { icon: BarChart2, label: "Analytics", href: "/merchant/analytics" },
  { icon: GitBranch, label: "Branches",  href: "/merchant/branches" },
  { icon: Megaphone, label: "Broadcast", href: "/merchant/broadcast" },
  { icon: Settings,  label: "Settings",  href: "/merchant/settings" },
];

export const PROFILE_NAV: Record<WorkflowProfile, NavItem[]> = {
  retail: [
    ...BASE_NAV,
    { icon: Package,      label: "Catalog",   href: "/merchant/catalog" },
    { icon: Tag,          label: "Offers",    href: "/merchant/offers" },
    { icon: Ticket,       label: "Coupons",   href: "/merchant/coupons" },
    { icon: ShoppingCart, label: "Orders",    href: "/merchant/orders" },
    ...COMMON_TAIL,
  ],
  food: [
    ...BASE_NAV,
    { icon: BookOpen,     label: "Menu",      href: "/merchant/catalog" },
    { icon: Tag,          label: "Offers",    href: "/merchant/offers" },
    { icon: Ticket,       label: "Coupons",   href: "/merchant/coupons" },
    { icon: ShoppingCart, label: "Orders",    href: "/merchant/orders" },
    ...COMMON_TAIL,
  ],
  appointments: [
    ...BASE_NAV,
    { icon: Package,      label: "Services",   href: "/merchant/catalog" },
    { icon: Tag,          label: "Offers",     href: "/merchant/offers" },
    { icon: Ticket,       label: "Coupons",    href: "/merchant/coupons" },
    { icon: CalendarDays, label: "Schedule",   href: "/merchant/slots" },
    { icon: ClipboardList,label: "Bookings",   href: "/merchant/bookings" },
    ...COMMON_TAIL,
  ],
  home_services: [
    ...BASE_NAV,
    { icon: Package,      label: "Services",   href: "/merchant/catalog" },
    { icon: Tag,          label: "Offers",     href: "/merchant/offers" },
    { icon: Briefcase,    label: "Requests",   href: "/merchant/requests" },
    { icon: CheckSquare,  label: "Jobs",       href: "/merchant/jobs" },
    ...COMMON_TAIL,
  ],
  subscriptions: [
    ...BASE_NAV,
    { icon: Package,      label: "Plans",      href: "/merchant/plans" },
    { icon: Tag,          label: "Offers",     href: "/merchant/offers" },
    { icon: Ticket,       label: "Coupons",    href: "/merchant/coupons" },
    { icon: ClipboardList,label: "Subscribers",href: "/merchant/subscribers" },
    { icon: CalendarDays, label: "Deliveries", href: "/merchant/deliveries" },
    ...COMMON_TAIL,
  ],
  events: [
    ...BASE_NAV,
    { icon: Package,      label: "Packages",   href: "/merchant/catalog" },
    { icon: Tag,          label: "Offers",     href: "/merchant/offers" },
    { icon: Star,         label: "Enquiries",  href: "/merchant/requests" },
    { icon: CalendarDays, label: "Bookings",   href: "/merchant/jobs" },
    ...COMMON_TAIL,
  ],
};

// ── Label overrides per profile ──────────────────────────────────────────────

export const PROFILE_LABELS: Record<WorkflowProfile, ProfileLabels> = {
  retail: {
    orders: "Orders",
    catalog: "Catalog",
    catalogItem: "Product",
    slots: "Slots",
    customers: "Customers",
    requests: "Requests",
    jobs: "Jobs",
    bookings: "Bookings",
  },
  food: {
    orders: "Orders",
    catalog: "Menu",
    catalogItem: "Menu Item",
    slots: "Slots",
    customers: "Customers",
    requests: "Requests",
    jobs: "Jobs",
    bookings: "Bookings",
  },
  appointments: {
    orders: "Bookings",
    catalog: "Services",
    catalogItem: "Service",
    slots: "Schedule",
    customers: "Clients",
    requests: "Enquiries",
    jobs: "Appointments",
    bookings: "Bookings",
  },
  home_services: {
    orders: "Job Requests",
    catalog: "Services",
    catalogItem: "Service",
    slots: "Availability",
    customers: "Clients",
    requests: "Job Requests",
    jobs: "Active Jobs",
    bookings: "Jobs",
  },
  subscriptions: {
    orders: "Subscribers",
    catalog: "Plans",
    catalogItem: "Plan",
    slots: "Deliveries",
    customers: "Subscribers",
    requests: "Requests",
    jobs: "Deliveries",
    bookings: "Subscriptions",
  },
  events: {
    orders: "Enquiries",
    catalog: "Packages",
    catalogItem: "Package",
    slots: "Calendar",
    customers: "Clients",
    requests: "Enquiries",
    jobs: "Bookings",
    bookings: "Bookings",
  },
};

export function getProfileFromCategory(category: string): WorkflowProfile {
  return CATEGORY_TO_PROFILE[category.toLowerCase()] ?? "retail";
}
