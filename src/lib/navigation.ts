export type NavItem = {
  href: string;
  label: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const adminNav: NavGroup[] = [
  {
    label: "Operate",
    items: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/calendar", label: "Calendar" },
    ],
  },
  {
    label: "Pipeline",
    items: [
      { href: "/admin/inquiries", label: "Inquiries" },
      { href: "/admin/clients", label: "Universities" },
      { href: "/admin/events", label: "Events" },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/readers", label: "Readers" },
      { href: "/admin/assignments", label: "Assignments" },
    ],
  },
  {
    label: "Event work",
    items: [
      { href: "/admin/call-sheets", label: "Call Sheets" },
      { href: "/admin/expenses", label: "Expenses" },
      { href: "/admin/debriefs", label: "Debriefs" },
    ],
  },
  {
    label: "Money",
    items: [{ href: "/admin/payments", label: "Payments" }],
  },
  {
    label: "System",
    items: [{ href: "/admin/settings", label: "Settings" }],
  },
];

export const readerNav: NavItem[] = [
  { href: "/reader", label: "Home" },
  { href: "/reader/assignments", label: "Assignments" },
  { href: "/reader/call-sheets", label: "Call Sheets" },
  { href: "/reader/calendar", label: "Calendar" },
  { href: "/reader/expenses", label: "Expenses" },
  { href: "/reader/debrief", label: "Debrief" },
  { href: "/reader/profile", label: "Profile" },
];

export const readerBottomNav: NavItem[] = [
  { href: "/reader", label: "Home" },
  { href: "/reader/assignments", label: "Jobs" },
  { href: "/reader/call-sheets", label: "Packet" },
  { href: "/reader/expenses", label: "Expenses" },
  { href: "/reader/profile", label: "Profile" },
];
