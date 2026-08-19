// Location: src/components/PublicHome.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Leaf, Recycle, MapPin, Factory, Package, TrendingUp, ArrowRight,
  ShieldCheck, Award, Activity, Globe, CheckCircle2, DollarSign, Trophy, Sparkles,
  PlayCircle, Video
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from "recharts";
import PublicNavbar from "./PublicNavbar";
import Footer from "./Footer";

const CAT_COLOR = {
  Plastic: "#2563eb",
  Organic: "#16a34a",
  Metal: "#6b7280",
  Paper: "#d97706",
  Glass: "#06b6d4",
};

const CHART_COLORS = ["#2563eb", "#16a34a", "#d97706", "#06b6d4", "#6b7280"];

export default function PublicHome({ session }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/stats")
      .then((r) => r.json())
      .then((d) => {
        setData(d.error ? null : d);
        setLoading(false);
      })
      .catch(() => {
        setData(null);
        setLoading(false);
      });
  }, []);

  const o = data?.overview;
  const zonesList = data?.zones || [];
  const categoriesList = data?.categories || [];
  const productsList = data?.products || [];
  const companiesList = data?.companies || [];
  
  const monthlyChartData = (data?.monthlyStats || []).map((m) => ({
    month: m.month,
    kg: Number(m.collected_kg ?? m.kg ?? 0),
  }));

  const categoriesChartData = categoriesList
    .map((c) => ({
      category: c.category,
      collected_kg: Number(c.collected_kg || 0),
      carbon_kg: Number(c.carbon_kg || 0),
    }))
    .filter((c) => c.collected_kg > 0);

  const maxZone = zonesList.length ? Math.max(...zonesList.map((z) => Number(z.total_kg) || 0), 1) : 1;
  const maxCat = categoriesChartData.length ? Math.max(...categoriesChartData.map((c) => Number(c.collected_kg) || 0), 1) : 1;

  const carbonSavedKg = Number(o?.carbon_saved || 0);
  const treesEquivalent = Math.round(carbonSavedKg / 21);

  const targetGoalKg = 5000;
  const goalProgressPercent = Math.min(Math.round((carbonSavedKg / targetGoalKg) * 100), 100);

  return (
    <div className="min-h-screen bg-canvas selection:bg-brand-500 selection:text-white text-ink">
      <PublicNavbar session={session} />

      {/* Marquee Banner */}
      <div className="relative flex items-center overflow-hidden border-b border-emerald-900 bg-emerald-950 py-2 shadow-inner">
        <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center gap-2 bg-emerald-900 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          Attention
        </div>

        <div className="ml-24 w-full overflow-hidden whitespace-nowrap">
          <div className="flex w-max animate-marquee gap-12 text-xs font-medium text-emerald-100">
            <span>
              Please dispose of waste only in designated bins. Littering streets,
              rivers, and public places harms the environment.
            </span>
            <span>
              Every recycled kilogram reduces landfill waste, saves natural
              resources, and supports a cleaner, greener city.
            </span>
            <span>
              W2A Intelligence monitors waste collection, company allocation,
              recycling progress, and environmental impact in real time.
            </span>
            <span>
              Together we can build a Smart City by turning Waste into Valuable Assets.
            </span>
          </div>
        </div>
      </div>
      
      {/* Hero Section */}
      <section
        className="relative overflow-hidden border-b border-line py-16 lg:py-22"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5), rgba(255,255,255,0.6)), url('/images/hero-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm">
            <Leaf className="h-3.5 w-3.5" />
            Open City Data Platform
          </span>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Where does our city&apos;s <span className="text-brand-600">waste</span> actually go?
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Every kilogram collected is tracked transparently from street bins to recycling plants and transformed into high-value assets.
          </p>

          {!session ? (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition-all hover:bg-brand-700"
              >
                Join as staff
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-line bg-white/85 px-5 py-2.5 text-sm font-semibold text-ink shadow-sm transition-all hover:bg-canvas"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <div className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-white/90 border border-line px-4 py-2.5 shadow-sm backdrop-blur-md">
              <span className="text-sm text-muted">
                Welcome back, <span className="font-bold text-ink">{session.name}</span>
              </span>
              <span className="text-line">|</span>
              <Link
                href="/dashboard"
                className="text-sm font-bold text-brand-600 hover:underline flex items-center gap-1"
              >
                Open dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          <div className="mt-10 pt-8 border-line/60">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-4">
              End-to-End Traceability Pipeline
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 max-w-3xl mx-auto">
              {[
                { label: "1. Collected", icon: Recycle, desc: "Streets" },
                { label: "2. Allocated", icon: MapPin, desc: "Zones" },
                { label: "3. Processed", icon: Factory, desc: "Partners" },
                { label: "4. Recovered", icon: Package, desc: "Assets" },
                { label: "5. Monetized", icon: DollarSign, desc: "B2B Value" },
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center p-2.5 rounded-xl bg-white/80 border border-line shadow-sm">
                  <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600 mb-1">
                    <step.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-ink">{step.label}</span>
                  <span className="text-[10px] text-muted">{step.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Project Overview Video Showcase Section */}
      <section className="mx-auto max-w-5xl px-4 pt-10 pb-4 sm:px-6">
        <div className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                <Video className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-ink">
                  Platform Overview & Operational Walkthrough
                </h2>
                <p className="text-xs text-muted">
                  Watch how W2A Intelligence connects municipal waste to commercial circular assets
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              <PlayCircle className="h-3.5 w-3.5" /> Demo Video
            </span>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-inner border border-line/60">
            <video
              src="/projectOverview.mp4"
              controls
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* KPI Overview */}
      <section id="overview" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10 sm:px-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-line bg-surface" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi icon={Recycle} label="Total Waste Collected" value={Number(o?.total_collected || 0).toLocaleString()} unit="kg" />
            <Kpi icon={Factory} label="Successfully Recycled" value={Number(o?.total_recycled || 0).toLocaleString()} unit="kg" tone="blue" />
            <Kpi icon={Leaf} label="CO₂ Emissions Avoided" value={Number(o?.carbon_saved || 0).toLocaleString()} unit="kg" />
            <Kpi icon={DollarSign} label="Circular Economy Value" value={`৳${Number(o?.total_market_value || 285400).toLocaleString()}`} tone="amber" />
          </div>
        )}
      </section>

      {/* Climate Action Card */}
      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden border border-emerald-900/50">
          <div className="relative z-10 grid gap-6 md:grid-cols-3 items-center">
            <div className="md:col-span-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900/60 px-3 py-1 text-[11px] font-semibold text-emerald-300 mb-2 border border-emerald-700/40">
                Climate Action & Carbon Watch
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Data-Driven Carbon Reduction
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Every processed batch reduces toxic greenhouse gases. Total equivalent impact scales directly with verified city recycling output.
              </p>
            </div>

            <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-4 text-center shadow-inner">
              <p className="text-xs text-slate-400">Trees Equivalent Saved</p>
              <p className="text-2xl font-extrabold text-emerald-400 mt-0.5">{treesEquivalent.toLocaleString()} Trees</p>
              <div className="mt-2 w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${goalProgressPercent}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Goal Progress: {goalProgressPercent}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Charts Grid */}
      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Monthly Bar Chart */}
          <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-ink">Monthly Collection Growth</h2>
                <p className="text-xs text-muted">Waste volume over recent periods</p>
              </div>
              <Activity className="h-4 w-4 text-brand-600" />
            </div>
            <div className="h-64 w-full pt-2">
              {monthlyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData}>
                    <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "#111827", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px" }} />
                    <Bar dataKey="kg" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted">No monthly chart data recorded yet</div>
              )}
            </div>
          </div>

          {/* Waste Category Pie Chart */}
          <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-ink">Waste Category Breakdown</h2>
                <p className="text-xs text-muted">Material ratios across collections</p>
              </div>
              <Globe className="h-4 w-4 text-blue-600" />
            </div>
            <div className="h-64 w-full">
              {categoriesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoriesChartData}
                      dataKey="collected_kg"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={40}
                      paddingAngle={4}
                    >
                      {categoriesChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => [`${Number(val).toLocaleString()} kg`, "Collected"]}
                      contentStyle={{ background: "#111827", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px" }} 
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted">
                  No distribution records found
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Zones & Recovery Details */}
      {data && (
        <section id="zones" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-10 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-sm">
              <h2 className="text-base font-bold text-ink">Collection by Neighbourhood</h2>
              <p className="mt-0.5 mb-4 text-xs text-muted">Volume handled per municipal sector</p>
              {zonesList.length > 0 ? zonesList.map((z) => (
                <div key={z.area_code} className="py-2">
                  <div className="mb-1 flex items-baseline justify-between gap-3">
                    <span className="truncate text-xs font-semibold text-ink">{z.zone_name}</span>
                    <span className="shrink-0 text-xs font-bold text-ink-soft">
                      {Number(z.total_kg).toLocaleString()} <span className="text-[10px] text-muted font-normal">kg</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-canvas">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${Math.max((Number(z.total_kg) / maxZone) * 100, 1.5)}%` }}
                    />
                  </div>
                </div>
              )) : <p className="text-xs text-muted">No zone records available</p>}
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-sm">
              <h2 className="text-base font-bold text-ink">Material Recovery Stats</h2>
              <p className="mt-0.5 mb-4 text-xs text-muted">Carbon offsets per material category</p>
              {categoriesChartData.length > 0 ? categoriesChartData.map((c) => (
                <div key={c.category} className="py-2">
                  <div className="mb-1 flex items-baseline justify-between gap-3">
                    <span className="text-xs font-semibold text-ink">{c.category}</span>
                    <span className="shrink-0 text-xs font-bold text-ink-soft">
                      {Number(c.collected_kg).toLocaleString()} <span className="text-[10px] text-muted font-normal">kg</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-canvas">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: CAT_COLOR[c.category] || "#16a34a",
                        width: `${Math.max((Number(c.collected_kg) / maxCat) * 100, 1.5)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-0.5 text-[11px] text-brand-700">
                    {Number(c.carbon_kg).toLocaleString()} kg CO₂ avoided
                  </p>
                </div>
              )) : <p className="text-xs text-muted">No category records available</p>}
            </div>
          </div>
        </section>
      )}

      {/* Generated Products */}
      {productsList.length > 0 && (
        <section id="products" className="scroll-mt-20 border-y border-line bg-surface py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-6 flex items-center gap-2">
              <Package className="h-5 w-5 text-brand-600" />
              <h2 className="text-base font-bold text-ink">Products Generated from Municipal Waste</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {productsList.map((p, i) => (
                <div key={i} className="rounded-xl border border-line bg-canvas p-4 shadow-sm">
                  <p className="text-xs font-bold text-ink">{p.product_name}</p>
                  <p className="mt-1 text-xl font-extrabold text-brand-600">
                    {Number(p.total_qty).toLocaleString()}
                    <span className="ml-1 text-[11px] font-semibold text-muted">{p.unit}</span>
                  </p>
                  <p className="mt-1 text-[11px] text-muted flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    From {p.category.toLowerCase()} waste
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Green Recyclers Leaderboard */}
      {companiesList.length > 0 && (
        <section id="partners" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-ink">
                  Top Certified Recycling Partners
                </h2>
                <p className="text-xs text-muted">
                  Ranked by ESG recycling efficiency and verified processing throughput
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
              <Sparkles className="h-4 w-4" />
              <span>Transparent B2B Circular Network</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companiesList.map((c, i) => {
              const isGold = i === 0;
              const isSilver = i === 1;
              return (
                <div
                  key={i}
                  className={`relative rounded-2xl border p-5 transition-all hover:shadow-md ${
                    isGold
                      ? "border-amber-400/80 bg-gradient-to-b from-amber-50/40 via-surface to-surface shadow-sm"
                      : isSilver
                      ? "border-slate-300 bg-surface shadow-sm"
                      : "border-line bg-surface shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${
                            isGold
                              ? "bg-amber-500 text-white shadow-sm"
                              : isSilver
                              ? "bg-slate-400 text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          #{c.rank || i + 1}
                        </span>
                        <p className="text-sm font-bold text-ink">{c.name}</p>
                      </div>
                      <p className="mt-0.5 text-xs text-muted">{c.location}</p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                        isGold
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {c.badge || "Verified"}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-ink-soft">ESG Efficiency Score</span>
                      <span className="font-extrabold text-brand-600">{c.efficiency_score}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-canvas overflow-hidden border border-line">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-brand-600 transition-all duration-500"
                        style={{ width: `${c.efficiency_score}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                    <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                      {c.handles || "General"}
                    </span>
                    <p className="flex items-center gap-1 text-xs font-bold text-ink-soft">
                      <TrendingUp className="h-3.5 w-3.5 text-brand-600" />
                      {Number(c.processed_kg).toLocaleString()} kg processed
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Interactive Circular ROI Simulator */}
      <InteractiveRoiCalculator />

      {/* How it Works */}
      <section id="how" className="scroll-mt-20 border-t border-line bg-surface py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-2 text-center text-lg font-extrabold text-ink">
            How W2A Intelligence Works
          </h2>
          <p className="text-center text-xs text-muted mb-8 max-w-md mx-auto">
            Complete database workflow linking municipal field collection to partner recycling plants.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "01", t: "Collected", d: "Collectors log municipal pickups with precise zoning and weights." },
              { n: "02", t: "Matched", d: "System assigns loads automatically to certified recycling plants." },
              { n: "03", t: "Processed", d: "Plants update operational milestones in real time until batch completion." },
              { n: "04", t: "Monetized", d: "Raw waste converted into high-value assets and certified material passports." },
            ].map((s) => (
              <div key={s.n} className="rounded-xl border border-line bg-canvas p-5 shadow-sm">
                <span className="text-xs font-bold text-brand-600">{s.n}</span>
                <p className="mt-1 text-sm font-bold text-ink">{s.t}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function InteractiveRoiCalculator() {
  const [wasteType, setWasteType] = useState("Plastic");
  const [weightKg, setWeightKg] = useState(500);

  const RATES = {
    Plastic: { price: 45, co2Factor: 1.8, product: "Recycled Granules" },
    Organic: { price: 15, co2Factor: 0.5, product: "Bio-Fertilizer (Bags)" },
    Metal: { price: 85, co2Factor: 2.2, product: "Steel Billets" },
    Paper: { price: 25, co2Factor: 1.1, product: "Eco Packaging Boxes" },
    Glass: { price: 18, co2Factor: 0.8, product: "Glass Cullets" },
  };

  const selected = RATES[wasteType] || RATES.Plastic;
  const totalRevenue = weightKg * selected.price;
  const co2Saved = Math.round(weightKg * selected.co2Factor);
  const treesSaved = Math.round(co2Saved / 21);
  const estimatedProducts = Math.round(weightKg * 0.85);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50/60 via-surface to-emerald-50/40 p-6 sm:p-10 shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
            Interactive Impact Simulator
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Calculate Your Municipal Circular Value
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-muted">
            Drag the slider to calculate monetary earnings, carbon avoidance, and asset recovery
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-center">
          {/* Controls */}
          <div className="lg:col-span-6 space-y-6 bg-surface p-6 rounded-2xl border border-line shadow-sm">
            {/* Waste Type Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                Select Waste Material
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {Object.keys(RATES).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setWasteType(type)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                      wasteType === type
                        ? "bg-brand-600 text-white border-brand-600 shadow-sm scale-105"
                        : "bg-canvas border-line text-ink hover:border-brand-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted">
                  Monthly Volume Input
                </label>
                <span className="text-base font-extrabold text-brand-600 font-mono">
                  {Number(weightKg).toLocaleString()} kg
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="5000"
                step="50"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full h-2.5 bg-canvas rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-muted mt-1 font-mono">
                <span>50 kg</span>
                <span>2,500 kg</span>
                <span>5,000 kg</span>
              </div>
            </div>
          </div>

          {/* Real-time Dynamic Results */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3.5">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm">
              <p className="text-[11px] font-bold text-emerald-800 uppercase">Monetary Value</p>
              <p className="mt-1 text-2xl font-black text-emerald-700">৳{totalRevenue.toLocaleString()}</p>
              <p className="text-[10px] text-emerald-600 mt-0.5">@ ৳{selected.price}/kg buying rate</p>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 shadow-sm">
              <p className="text-[11px] font-bold text-blue-800 uppercase">CO₂ Mitigated</p>
              <p className="mt-1 text-2xl font-black text-blue-700">{co2Saved.toLocaleString()} kg</p>
              <p className="text-[10px] text-blue-600 mt-0.5">Verified carbon avoidance</p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
              <p className="text-[11px] font-bold text-amber-800 uppercase">Trees Equivalent</p>
              <p className="mt-1 text-2xl font-black text-amber-700">{treesSaved} Trees</p>
              <p className="text-[10px] text-amber-600 mt-0.5">Annual offset equivalent</p>
            </div>

            <div className="rounded-2xl border border-purple-200 bg-purple-50/80 p-4 shadow-sm">
              <p className="text-[11px] font-bold text-purple-800 uppercase">Assets Produced</p>
              <p className="mt-1 text-2xl font-black text-purple-700">{estimatedProducts.toLocaleString()} kg</p>
              <p className="text-[10px] text-purple-600 mt-0.5 truncate">{selected.product}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Kpi({ icon: Ico, label, value, unit, tone = "brand" }) {
  const tones = {
    brand: "bg-brand-100 text-brand-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <div className={`inline-flex rounded-xl p-2.5 ${tones[tone]}`}>
        <Ico className="h-4 w-4" />
      </div>
      <p className="mt-3 text-2xl font-extrabold text-ink tracking-tight">
        {value}
        {unit && <span className="ml-1 text-xs font-semibold text-muted">{unit}</span>}
      </p>
      <p className="mt-0.5 text-xs font-medium text-muted">{label}</p>
    </div>
  );
}