// Location: src/components/CityLiveMap.jsx
"use client";

import { useState } from "react";
import { 
  MapPin, 
  Truck, 
  Battery, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  RefreshCw, 
  ExternalLink,
  Navigation
} from "lucide-react";

const INITIAL_BINS = [
  { id: "BIN-101", zone: "Kandirpar Main Road", lat: 23.4607, lng: 91.1809, fill: 42, temp: 28, battery: 94, status: "Normal" },
  { id: "BIN-102", zone: "Comilla University Gate", lat: 23.4211, lng: 91.1378, fill: 68, temp: 31, battery: 88, status: "Normal" },
  { id: "BIN-103", zone: "Kotbari Tourist Hub", lat: 23.4350, lng: 91.1400, fill: 55, temp: 29, battery: 91, status: "Normal" },
  { id: "BIN-104", zone: "Shasongachha Bus Terminal", lat: 23.4720, lng: 91.1750, fill: 89, temp: 36, battery: 72, status: "Warning" },
];

export default function CityLiveMap() {
  const [bins, setBins] = useState(INITIAL_BINS);
  const [selectedBin, setSelectedBin] = useState(INITIAL_BINS[0]);
  const [fleetStatus, setFleetStatus] = useState("En Route to BIN-104");

  function triggerSurge(binId) {
    setBins((prev) =>
      prev.map((b) =>
        b.id === binId
          ? { ...b, fill: 96, temp: 41, status: "Critical Overflow" }
          : b
      )
    );
    const target = bins.find((b) => b.id === binId);
    if (target) {
      setSelectedBin({ ...target, fill: 96, temp: 41, status: "Critical Overflow" });
      setFleetStatus(`Rerouted: Collector Truck #TRK-03 dispatched to ${target.zone}`);
    }
  }

  function resetBins() {
    setBins(INITIAL_BINS);
    setSelectedBin(INITIAL_BINS[0]);
    setFleetStatus("Regular Patrol Route Active");
  }

  // Generate embedded interactive Google Map with dynamic pin centering
  const mapUrl = `https://maps.google.com/maps?q=${selectedBin.lat},${selectedBin.lng}&hl=en&z=15&output=embed`;

  return (
    <div className="rounded-3xl border border-line bg-surface p-5 sm:p-6 shadow-sm space-y-5">
      {/* 1. Header & Live Telemetry Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-50 text-brand-600 border border-brand-200">
            <Navigation className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              Smart City Telemetry & Live Map
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h2>
            <p className="text-xs text-muted">
              Live GPS tracking of IoT Smart Bins and dynamic vehicle dispatch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetBins}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-canvas px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Telemetry</span>
          </button>
        </div>
      </div>

      {/* 2. Google Map + Live Telemetry Inspector Grid */}
      <div className="grid gap-5 lg:grid-cols-3 items-start">
        {/* Left 2 Cols: Live Google Map Embed */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-line bg-canvas h-[360px] sm:h-[420px] relative shadow-inner">
          <iframe
            title="Google Map Live View"
            width="100%"
            height="100%"
            src={mapUrl}
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            className="w-full h-full border-0 filter saturate-150 contrast-105"
          />

          {/* Floating Live Fleet Dispatch Badge on top of map */}
          <div className="absolute top-3 left-3 right-3 sm:right-auto bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl border border-white/10 shadow-lg flex items-center gap-2.5 text-xs">
            <Truck className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-[11px] text-emerald-300 uppercase tracking-wider">Automated Fleet Dispatch</p>
              <p className="text-slate-200 truncate">{fleetStatus}</p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Smart Bin Selector & Inspector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted font-mono">
              IoT Sensor Network ({bins.length})
            </span>
            <span className="text-[11px] text-brand-600 font-semibold">Click to center GPS</span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto no-scrollbar">
            {bins.map((bin) => {
              const isSelected = selectedBin.id === bin.id;
              const isCritical = bin.fill >= 90;
              const isWarning = bin.fill >= 65 && bin.fill < 90;

              return (
                <div
                  key={bin.id}
                  onClick={() => setSelectedBin(bin)}
                  className={`cursor-pointer rounded-2xl border p-3.5 transition-all text-xs ${
                    isSelected
                      ? "border-brand-500 bg-brand-50/40 shadow-sm"
                      : "border-line bg-surface hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className={`h-4 w-4 ${isCritical ? "text-red-500 animate-bounce" : isWarning ? "text-amber-500" : "text-brand-600"}`} />
                      <div>
                        <p className="font-bold text-ink">{bin.id}</p>
                        <p className="text-[11px] text-muted">{bin.zone}</p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isCritical
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : isWarning
                          ? "bg-amber-100 text-amber-700 border border-amber-200"
                          : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {bin.status}
                    </span>
                  </div>

                  {/* Telemetry Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-muted">Fill Capacity:</span>
                      <span className="font-bold text-ink">{bin.fill}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-canvas overflow-hidden border border-line">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCritical ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${bin.fill}%` }}
                      />
                    </div>
                  </div>

                  {/* Sensor Stats & Surge Button */}
                  <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2 text-[11px] text-muted">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Thermometer className="h-3.5 w-3.5 text-slate-400" /> {bin.temp}°C
                      </span>
                      <span className="flex items-center gap-1">
                        <Battery className="h-3.5 w-3.5 text-slate-400" /> {bin.battery}%
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerSurge(bin.id);
                      }}
                      className="text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-lg transition-colors"
                    >
                      Simulate Surge
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}