"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, subtitle, children, wide }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-line bg-surface p-6 ${
          wide ? "max-w-2xl" : "max-w-md"
        }`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-ink">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted transition hover:bg-canvas hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}