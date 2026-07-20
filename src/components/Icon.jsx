const PATHS = {
  grid:  "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  truck: "M3 7h11v8H3zM14 10h4l3 3v2h-7zM7 19a2 2 0 100-4 2 2 0 000 4zM18 19a2 2 0 100-4 2 2 0 000 4z",
  tag:   "M3 12l9-9 9 9-9 9zM12 8v.01",
  build: "M4 21V8l7-4 7 4v13M9 21v-6h6v6M9 11h.01M15 11h.01",
  clip:  "M9 4h6v3H9zM7 4h10v16H7zM10 11h4M10 15h4",
  box:   "M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8",
  chart: "M4 20V10M10 20V4M16 20v-8M22 20H2",
  logout:"M9 20H5V4h4M14 16l4-4-4-4M18 12H9",
  menu:  "M4 6h16M4 12h16M4 18h16",
  close: "M6 6l12 12M18 6L6 18",
};

export default function Icon({ name, className = "h-5 w-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name] || PATHS.grid} />
    </svg>
  );
}