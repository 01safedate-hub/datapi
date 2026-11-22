import {
  BadgePercent,
  ClipboardList,
  Cloud,
  FileClock,
  FolderTree,
  LayoutDashboard,
  LifeBuoy,
  Package,
  Plane,
  Scale,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  BarChart3,
  Truck,
  Factory,
  UserCog,
  Users,
  FileText,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon; badge?: number };
export type NavGroup = { title: string; items: NavItem[] };

export const adminNav: NavGroup[] = [
  { title: "", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    title: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/support", label: "Support", icon: LifeBuoy },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/admin/sourcing", label: "Sourcing queue", icon: ClipboardList },
      { href: "/admin/warehouse", label: "China warehouse", icon: Scale },
      { href: "/admin/shipments", label: "Shipments", icon: Plane },
      { href: "/admin/deliveries", label: "Deliveries", icon: Truck },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/products/import", label: "Alibaba import", icon: Cloud },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/suppliers", label: "Suppliers", icon: Factory },
    ],
  },
  {
    title: "Money",
    items: [
      { href: "/admin/pricing", label: "Pricing rules", icon: SlidersHorizontal },
      { href: "/admin/discounts", label: "Discounts", icon: BadgePercent },
      { href: "/admin/reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    title: "Admin",
    items: [
      { href: "/admin/content", label: "Content", icon: FileText },
      { href: "/admin/staff", label: "Staff & roles", icon: UserCog },
      { href: "/admin/settings", label: "Settings", icon: Settings },
      { href: "/admin/audit", label: "Audit log", icon: FileClock },
    ],
  },
];
