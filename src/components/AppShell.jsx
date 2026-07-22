"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ThemeProvider } from "./ThemeProvider";

export default function AppShell({ session, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Remember the pin preference across sessions
  useEffect(() => {
    const saved = document.cookie
      .split("; ")
      .find((c) => c.startsWith("w2a_pin="))
      ?.split("=")[1];
    setPinned(saved === "1");
  }, []);

  function togglePin() {
    const next = !pinned;
    setPinned(next);
    document.cookie = `w2a_pin=${next ? 1 : 0}; path=/; max-age=31536000`;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-canvas">
        <Sidebar
          session={session}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          pinned={pinned}
          onTogglePin={togglePin}
          hovered={hovered}
          onHoverChange={setHovered}
        />

        {/* Content shifts only when pinned — hover overlays instead */}
        <div
          className={`flex min-h-screen flex-col transition-all duration-200 ${
            pinned ? "lg:pl-64" : "lg:pl-16"
          }`}
        >
          <Navbar
            session={session}
            onMenuClick={() => setMobileOpen(true)}
            onDesktopToggle={togglePin}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          <Footer />
        </div>
      </div>
    </ThemeProvider>
  );
}