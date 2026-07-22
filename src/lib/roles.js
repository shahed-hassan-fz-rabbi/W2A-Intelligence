export const NAV_ITEMS = [
  { href: "/dashboard",   label: "Dashboard",        icon: "grid",   roles: ["admin", "collector", "company"] },
  { href: "/collection",  label: "Waste Collection", icon: "truck",  roles: ["admin", "collector"] },
  { href: "/zones",       label: "City Zones",       icon: "home",   roles: ["admin"] },
  { href: "/waste-types", label: "Waste Types",      icon: "tag",    roles: ["admin"] },
  { href: "/companies",   label: "Companies",        icon: "build",  roles: ["admin"] },
  { href: "/assignments", label: "Assignments",      icon: "clip",   roles: ["admin", "company"] },
  { href: "/products",    label: "Assets Generated", icon: "box",    roles: ["admin", "company"] },
  { href: "/analytics",   label: "Analytics",        icon: "chart",  roles: ["admin"] },
  { href: "/users",       label: "User Management",  icon: "user",   roles: ["admin"] },
];

export const EXTRA_ROUTES = {
  "/profile": "Profile",
  "/settings": "Settings",
  "/change-password": "Change Password",
};

export const ROLE_LABEL = {
  admin: "City Administrator",
  collector: "Waste Collector",
  company: "Company Manager",
};

export function navFor(role) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export function labelForPath(pathname) {
  const nav = NAV_ITEMS.find(
    (i) => pathname === i.href || pathname.startsWith(i.href + "/")
  );
  if (nav) return nav.label;
  return EXTRA_ROUTES[pathname] || "Page";
}

export function quickActionsFor(role) {
  const all = [
    { href: "/collection",  label: "New Collection", roles: ["admin", "collector"] },
    { href: "/companies",   label: "Add Company",    roles: ["admin"] },
    { href: "/waste-types", label: "Add Waste Type", roles: ["admin"] },
    { href: "/zones",       label: "Add Zone",       roles: ["admin"] },
  ];
  return all.filter((a) => a.roles.includes(role));
}