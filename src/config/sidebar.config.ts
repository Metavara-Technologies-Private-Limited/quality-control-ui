import BriefcaseIcon from "../assets/icons/brifecase-tick.svg";
import ReceiptSearch from "../assets/icons/receipt-search.svg";
import TickmarkCircle from "../assets/icons/Tick-mark-circle.svg";
import SecuritySafe from "../assets/icons/security-safe.svg";

export type SidebarTabKey = "quality" | "work" | "security" | "documents";

export const SIDEBAR_TABS = [
  {
    key: "quality",
    iconIndex: 0,
    label: "Quality Control",
    icon: {
      src: TickmarkCircle,
      baseScale: 1.2,
    },
    views: ["admin", "technician", "user"],
    defaultPath: "/dashboard",
    menu: [
      { label: "Dashboard", path: "/dashboard", views: ["technician", "user"] },
      { label: "Admin Dashboard", path: "/admin-dashboard", views: ["admin"] },
      { label: "Clinical", path: "/clinical", views: ["admin", "technician"] },
      {
        label: "Lab",
        path: "/qc-lab/embryology/task",
        views: ["admin", "technician"],
      },

      { label: "Reports", path: "/reports", views: ["admin", "technician"] },
      {
        label: "Configuration",
        path: "/configuration",
        views: ["admin", "technician"],
      },
      { label: "Configuration", path: "/user-configuration", views: ["user"] },
    ],
  },
  {
    key: "work",
    iconIndex: 1,
    label: "Work",
    icon: {
      src: BriefcaseIcon,
      baseScale: 1,
    },
    views: ["admin", "technician"],
    menu: [],
  },
  {
    key: "security",
    iconIndex: 2,
    label: "Security",
    icon: {
      src: SecuritySafe,
      baseScale: 1,
    },
    views: ["admin", "technician"],
    menu: [],
  },
  {
    key: "documents",
    iconIndex: 3,
    label: "Documents",
    icon: {
      src: ReceiptSearch,
      baseScale: 1,
    },
    views: ["admin", "technician"],
    menu: [],
  },
];
