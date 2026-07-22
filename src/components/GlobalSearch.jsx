"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

const KIND_COLOR = {
  Collection: "bg-blue-50 text-blue-700",
  Company: "bg-brand-50 text-brand-700",
  Zone: "bg-amber-50 text-amber-700",
  "Waste Type": "bg-purple-50 text-purple-700",
  Product: "bg-gray-100 text-ink-soft",
};

export default function GlobalSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        boxRef.current?.querySelector("input")?.focus();
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function go(href) {
    setOpen(false);
    setQ("");
    router.push(href);
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Search waste, company, zone…"
          className="w-full rounded-lg border border-line bg-canvas py-2 pr-16 pl-9 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        {q ? (
          <button
            onClick={() => {
              setQ("");
              setOpen(false);
            }}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <kbd className="absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border border-line px-1.5 py-0.5 text-[10px] text-muted lg:block">
            Ctrl K
          </kbd>
        )}
      </div>

      {open && (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-line bg-surface shadow-lg">
          {loading && (
            <p className="px-4 py-3 text-sm text-muted">Searching…</p>
          )}
          {!loading && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted">No results found</p>
          )}
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => go(r.href)}
              className="flex w-full items-start gap-3 border-b border-line px-4 py-2.5 text-left last:border-0 hover:bg-brand-50"
            >
              <span
                className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  KIND_COLOR[r.kind] || "bg-gray-100 text-ink-soft"
                }`}
              >
                {r.kind}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink">
                  {r.ref}
                </span>
                <span className="block truncate text-xs text-muted">
                  {r.label}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}