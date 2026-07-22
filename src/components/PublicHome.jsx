"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Leaf, Recycle, MapPin, Factory, Package, TrendingUp, ArrowRight,
} from "lucide-react";
import PublicNavbar from "./PublicNavbar";
import Footer from "./Footer"; // আপনার তৈরি করা মেইন ফুটার

const CAT_COLOR = {
  Plastic: "bg-blue-500",
  Organic: "bg-brand-500",
  Metal: "bg-gray-500",
};

export default function PublicHome({ session }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/public/stats")
      .then((r) => r.json())
      .then((d) => setData(d.error ? null : d))
      .catch(() => setData(null));
  }, []);

  const o = data?.overview;
  const maxZone = data
    ? Math.max(...data.zones.map((z) => Number(z.total_kg)), 1)
    : 1;
  const maxCat = data
    ? Math.max(...data.categories.map((c) => Number(c.collected_kg)), 1)
    : 1;

  return (
    <div className="min-h-screen bg-canvas">
      <PublicNavbar session={session} />

      {/* Hero */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            <Leaf className="h-3.5 w-3.5" />
            Open city data
          </span>
          <h1 className="mt-4 text-2xl font-bold text-ink sm:text-4xl">
            Where does our city&apos;s waste actually go?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Every kilogram collected is tracked from the street to the recycling
            plant to the finished product. These are the live numbers — no login
            required.
          </p>

          {!session && (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Join as staff
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-canvas"
              >
                Sign in
              </Link>
            </div>
          )}

          {session && (
            <p className="mt-6 text-sm text-muted">
              Signed in as{" "}
              <span className="font-medium text-ink">{session.name}</span> —{" "}
              <Link
                href="/dashboard"
                className="font-medium text-brand-600 hover:underline"
              >
                open your dashboard
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* KPIs */}
      <section id="overview" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10 sm:px-6">
        {!data ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl border border-line bg-surface"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi
              icon={Recycle}
              label="Waste Collected"
              value={Number(o.total_collected).toLocaleString()}
              unit="kg"
            />
            <Kpi
              icon={Factory}
              label="Successfully Recycled"
              value={Number(o.total_recycled).toLocaleString()}
              unit="kg"
              tone="blue"
            />
            <Kpi
              icon={Leaf}
              label="CO₂ Emissions Avoided"
              value={Number(o.carbon_saved).toLocaleString()}
              unit="kg"
            />
            <Kpi
              icon={MapPin}
              label="Zones Covered"
              value={o.zones_served}
              tone="amber"
            />
          </div>
        )}
      </section>

      {/* Zones + categories */}
      {data && (
        <section id="zones" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-10 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <h2 className="text-base font-semibold text-ink">
                Collection by neighbourhood
              </h2>
              <p className="mt-0.5 mb-4 text-xs text-muted">
                Total waste collected from each city zone
              </p>
              {data.zones.map((z) => (
                <div key={z.area_code} className="py-2">
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-medium text-ink">
                      {z.zone_name}
                    </span>
                    <span className="shrink-0 text-sm text-ink-soft">
                      {Number(z.total_kg).toLocaleString()}
                      <span className="ml-1 text-xs text-muted">kg</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-canvas">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{
                        width: `${Math.max(
                          (Number(z.total_kg) / maxZone) * 100,
                          1.5
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <h2 className="text-base font-semibold text-ink">
                What we recycle
              </h2>
              <p className="mt-0.5 mb-4 text-xs text-muted">
                Waste categories and the CO₂ each one saves
              </p>
              {data.categories.map((c) => (
                <div key={c.category} className="py-2">
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-ink">
                      {c.category}
                    </span>
                    <span className="shrink-0 text-sm text-ink-soft">
                      {Number(c.collected_kg).toLocaleString()}
                      <span className="ml-1 text-xs text-muted">kg</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-canvas">
                    <div
                      className={`h-full rounded-full ${
                        CAT_COLOR[c.category] || "bg-brand-500"
                      }`}
                      style={{
                        width: `${Math.max(
                          (Number(c.collected_kg) / maxCat) * 100,
                          1.5
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-brand-700">
                    {Number(c.carbon_kg).toLocaleString()} kg CO₂ avoided
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      {data && data.products.length > 0 && (
        <section id="products" className="scroll-mt-20 border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <div className="mb-5 flex items-center gap-2">
              <Package className="h-5 w-5 text-brand-600" />
              <h2 className="text-base font-semibold text-ink">
                Products made from your waste
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data.products.map((p, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-line bg-canvas p-4"
                >
                  <p className="text-sm font-medium text-ink">
                    {p.product_name}
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-600">
                    {Number(p.total_qty).toLocaleString()}
                    <span className="ml-1 text-xs font-medium text-muted">
                      {p.unit}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    from {p.category.toLowerCase()} waste
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Companies */}
      {data && (
        <section id="partners" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10 sm:px-6">
          <div className="mb-5 flex items-center gap-2">
            <Factory className="h-5 w-5 text-brand-600" />
            <h2 className="text-base font-semibold text-ink">
              Recycling partners
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.companies.map((c, i) => (
              <div
                key={i}
                className="rounded-xl border border-line bg-surface p-4"
              >
                <p className="text-sm font-semibold text-ink">{c.name}</p>
                <p className="mt-0.5 text-xs text-muted">{c.location}</p>
                <p className="mt-2 inline-block rounded bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
                  {c.handles || "—"}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft">
                  <TrendingUp className="h-3.5 w-3.5 text-brand-600" />
                  {Number(c.processed_kg).toLocaleString()} kg processed
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section id="how" className="scroll-mt-20 border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="mb-6 text-center text-base font-semibold text-ink">
            How the system works
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                t: "Collected",
                d: "Field collectors log every pickup with its zone, waste type and weight.",
              },
              {
                n: "02",
                t: "Matched",
                d: "The system automatically picks the best recycler based on capability and current workload.",
              },
              {
                n: "03",
                t: "Processed",
                d: "The recycling partner updates progress until the batch is complete.",
              },
              {
                n: "04",
                t: "Recovered",
                d: "Finished products are recorded, closing the loop from waste to asset.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="rounded-xl border border-line bg-canvas p-5"
              >
                <span className="text-xs font-bold text-brand-600">{s.n}</span>
                <p className="mt-1 text-sm font-semibold text-ink">{s.t}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── কাস্টম প্রফেশনাল ফুটার ─── */}
      <Footer />
    </div>
  );
}

function Kpi({ icon: Ico, label, value, unit, tone = "brand" }) {
  const tones = {
    brand: "bg-brand-100 text-brand-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className={`inline-flex rounded-lg p-2 ${tones[tone]}`}>
        <Ico className="h-4 w-4" />
      </div>
      <p className="mt-3 text-2xl font-bold text-ink">
        {value}
        {unit && (
          <span className="ml-1 text-sm font-medium text-muted">{unit}</span>
        )}
      </p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  );
}