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

// Import unified category types
import type { WorkflowProfile, MerchantCategory } from "@/types/merchant-categories";
import { getCategoryWorkflow } from "@/types/merchant-categories";

// Re-export WorkflowProfile for backward compatibility
export type { WorkflowProfile } from "@/types/merchant-categories";

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

export interface WorkflowDefinition {
  label: string;
  catalogTitle: string;
  catalogItemLabel: string;
  orderTitle: string;
  offerTitle: string;
  defaultCatalogKind: "product" | "menu_item" | "service" | "consultation" | "class_batch";
  defaultInsight: string;
}

// ── Category → Profile mapping ──────────────────────────────────────────────
// Deprecated: Use getCategoryWorkflow from @/types/merchant-categories instead
// Kept for backward compatibility only

export const CATEGORY_TO_PROFILE: Record<string, WorkflowProfile> = {} as const;

export function getProfileFromCategory(category: string): WorkflowProfile {
  return getCategoryWorkflow(category as MerchantCategory);
}

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
    { icon: Star,         label: "Events",     href: "/merchant/events" },
    { icon: ClipboardList,label: "Enquiries",  href: "/merchant/requests" },
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

export const PROFILE_WORKFLOW_CONFIG: Record<WorkflowProfile, WorkflowDefinition> = {
  retail: {
    label: "Retail",
    catalogTitle: "Catalog",
    catalogItemLabel: "Product",
    orderTitle: "Orders",
    offerTitle: "Offers",
    defaultCatalogKind: "product",
    defaultInsight: "Keep your catalog fresh and make sure your top-selling products are always visible.",
  },
  food: {
    label: "Food",
    catalogTitle: "Menu",
    catalogItemLabel: "Menu Item",
    orderTitle: "Orders",
    offerTitle: "Offers",
    defaultCatalogKind: "menu_item",
    defaultInsight: "Keep the menu updated, highlight top sellers, and refresh offers before peak meal times.",
  },
  appointments: {
    label: "Appointments",
    catalogTitle: "Services",
    catalogItemLabel: "Service",
    orderTitle: "Bookings",
    offerTitle: "Offers",
    defaultCatalogKind: "service",
    defaultInsight: "Keep your schedule and service list current so customers can book on time.",
  },
  home_services: {
    label: "Home Services",
    catalogTitle: "Services",
    catalogItemLabel: "Service",
    orderTitle: "Requests",
    offerTitle: "Offers",
    defaultCatalogKind: "service",
    defaultInsight: "Respond quickly to requests and keep service availability updated for nearby customers.",
  },
  subscriptions: {
    label: "Subscriptions",
    catalogTitle: "Plans",
    catalogItemLabel: "Plan",
    orderTitle: "Subscribers",
    offerTitle: "Offers",
    defaultCatalogKind: "product",
    defaultInsight: "Keep recurring plans simple, visible, and easy to renew for your subscribers.",
  },
  events: {
    label: "Events",
    catalogTitle: "Packages",
    catalogItemLabel: "Package",
    orderTitle: "Enquiries",
    offerTitle: "Offers",
    defaultCatalogKind: "product",
    defaultInsight: "Keep packages visible and reply to enquiries quickly so bookings convert faster.",
  },
};
