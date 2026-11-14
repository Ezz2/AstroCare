import {
  Bell,
  FileText,
  HeartPulse,
  LayoutDashboard,
  TrendingUp,
  ClipboardCheck,
} from "lucide-react";

export const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/daily-check-in", label: "Daily check-in", icon: ClipboardCheck },
  { to: "/monitoring", label: "Health History", icon: HeartPulse },
  { to: "/analytics", label: "Analytics", icon: TrendingUp },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/alerts", label: "Alerts", icon: Bell, showCount: true },
];
