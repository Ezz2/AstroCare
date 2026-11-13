import {
  Bell,
  FileText,
  HeartPulse,
  LayoutDashboard,
  Settings,
  TrendingUp,
} from "lucide-react";

export const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  {
    to: "/daily-check-in",
    label: "Daily Check-in",
    icon: CalendarCheck,
    end: true,
  },
  { to: "/monitoring", label: "Health Monitoring", icon: HeartPulse },
  { to: "/analytics", label: "Analytics", icon: TrendingUp },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/alerts", label: "Alerts", icon: Bell, showCount: true },
];
