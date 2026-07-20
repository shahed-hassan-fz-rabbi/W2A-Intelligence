export const NAV_ITEMS = [
  { href: "/dashboard",   label: "Dashboard",        icon: "grid",   roles: ["admin", "collector", "company"] },
  { href: "/collection",  label: "Waste Collection", icon: "truck",  roles: ["admin", "collector"] },
  { href: "/waste-types", label: "Waste Types",      icon: "tag",    roles: ["admin"] },
  { href: "/companies",   label: "Companies",        icon: "build",  roles: ["admin"] },
  { href: "/assignments", label: "Assignments",      icon: "clip",   roles: ["admin", "company"] },
  { href: "/products",    label: "Assets Generated", icon: "box",    roles: ["admin", "company"] },
  { href: "/analytics",   label: "Analytics",        icon: "chart",  roles: ["admin"] },
];

export const ROLE_LABEL = {
  admin: "City Administrator",
  collector: "Waste Collector",
  company: "Company Manager",
};

export function navFor(role) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}