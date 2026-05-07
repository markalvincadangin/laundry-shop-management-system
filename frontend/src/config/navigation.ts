import {
  LayoutDashboard,
  ClipboardList,
  Users,
  MessageSquare,
  Tag,
  CreditCard,
  BarChart3,
  History,
  UserCog
} from "lucide-react";
import { UI_LABELS } from "@/constants/ui";

export interface NavItem {
  href: string;
  label: string;
  icon: any;
  role?: string;
}

export interface NavGroup {
  id: string;
  label: string;
  role?: string;
  items: NavItem[];
}

/**
 * Grouped Navigation Configuration (v4.0)
 * 
 * DESIGN RATIONALE:
 * 1. Functional Grouping: Separates day-to-day operations from system-wide administration.
 * 2. Visual Hierarchy: Prioritizes high-frequency tasks (Orders, Dashboard) at the top.
 * 3. Icon Distinctness: Uses 'Users' for Customers and 'MessageSquare' for Messaging.
 */
export const NAVIGATION_GROUPS: NavGroup[] = [
  {
    id: "operations",
    label: UI_LABELS.layout.nav.GROUP_OPERATIONS,
    items: [
      { href: "/overview", label: UI_LABELS.layout.nav.DASHBOARD, icon: LayoutDashboard },
      { href: "/orders", label: UI_LABELS.layout.nav.ORDERS, icon: ClipboardList },
      { href: "/customers", label: UI_LABELS.layout.nav.CUSTOMERS, icon: Users },
      { href: "/messaging", label: UI_LABELS.layout.nav.CLIENT_ALERTS, icon: MessageSquare },
    ],
  },
  {
    id: "administration",
    label: UI_LABELS.layout.nav.GROUP_ADMIN,
    role: "ADMIN",
    items: [
      { href: "/reports", label: UI_LABELS.layout.nav.REPORTS, icon: BarChart3 },
      { href: "/payments", label: UI_LABELS.layout.nav.PAYMENTS, icon: CreditCard },
      { href: "/users", label: UI_LABELS.layout.nav.USERS, icon: UserCog },
      { href: "/rates", label: UI_LABELS.layout.nav.RATES, icon: Tag },
      { href: "/audit-logs", label: UI_LABELS.layout.nav.AUDIT_LOG, icon: History },
    ],
  },
];



