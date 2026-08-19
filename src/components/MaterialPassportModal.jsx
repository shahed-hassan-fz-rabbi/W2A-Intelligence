// Location: src/components/MaterialPassportModal.jsx
"use client";

import { useEffect, useState } from "react";
import { X, QrCode, Leaf, Factory, MapPin, CheckCircle2, ShieldCheck } from "lucide-react";
import { notify } from "@/lib/toast";

export default function MaterialPassportModal({ isOpen, onClose, productId }) {
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !productId) return;

    let isMounted = true;
    async function fetchPassport() {
      setLoading(true);
      try {
        const res = await fetch(`/api/passport/${productId}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Failed to load passport");
        if (isMounted) setPassport(data.passport);
      } catch (err) {
        if (isMounted) {
          notify.error(err.message);
          onClose();
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchPassport();
    return () => { isMounted = false; };
  }, [isOpen, productId, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
        {/* Header styling mimics a secure certificate */}
        <div className="bg-emerald-950 p-6 text-center border-b border-emerald-900/50">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-300 hover:text-white p-1 rounded-lg transition-colors bg-emerald-900/50 hover:bg-emerald-800"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-800 text-emerald-300 border border-emerald-700 shadow-inner">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-extrabold text-white tracking-tight uppercase">
            Digital Material Passport
          </h2>
          <p className="text-[11px] font-semibold text-emerald-400 mt-1 uppercase tracking-widest">
            Verified Circular Asset
          </p>
        </div>

        {loading || !passport ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-brand-600 mb-4" />
            <p className="text-xs font-semibold text-muted">Retrieving blockchain-verified record...</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              {/* Simulated QR Code rendering */}
              <div className="shrink-0 p-2 bg-white rounded-xl border border-line shadow-sm">
                 <QrCode className="h-20 w-20 text-ink" strokeWidth={1} />
                 <p className="text-[8px] text-center font-mono text-muted mt-1">DMP-{passport.product_id}-TX</p>
              </div>
              
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-extrabold text-ink leading-tight">
                  {passport.product_name}
                </h3>
                <p className="text-sm font-semibold text-brand-600 mt-1">
                  {Number(passport.quantity_produced).toLocaleString()} {passport.unit}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  100% Traceable
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-line bg-canvas p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3 border-b border-line/60 pb-2">
                  Circular Genealogy
                </p>
                
                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand-200 before:to-emerald-200">
                  
                  {/* Origin */}
                  <div className="relative flex items-start gap-4">
                    <div className="absolute left-0 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-canvas border-2 border-brand-500 shadow-sm">
                      <MapPin className="h-2.5 w-2.5 text-brand-600" />
                    </div>
                    <div className="pl-8">
                      <p className="text-xs font-bold text-ink">Municipal Origin</p>
                      <p className="text-[11px] text-muted">{passport.origin_zone}</p>
                      <p className="text-[10px] font-medium text-ink-soft bg-surface border border-line rounded px-1.5 py-0.5 mt-1 inline-block">
                        Raw Material: {passport.raw_material}
                      </p>
                    </div>
                  </div>

                  {/* Processing */}
                  <div className="relative flex items-start gap-4">
                    <div className="absolute left-0 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-canvas border-2 border-blue-500 shadow-sm">
                      <Factory className="h-2.5 w-2.5 text-blue-600" />
                    </div>
                    <div className="pl-8">
                      <p className="text-xs font-bold text-ink">Recycling Processor</p>
                      <p className="text-[11px] text-muted">{passport.processor_company}</p>
                      <p className="text-[10px] text-muted mt-0.5">Efficiency Score: {passport.efficiency_score}/100</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Environmental Impact Footer */}
              <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase text-emerald-800">Carbon Offset</p>
                  <p className="text-lg font-extrabold text-emerald-600 tracking-tight flex items-baseline gap-1 mt-0.5">
                    {Number(passport.verified_carbon_saved_kg).toLocaleString()} 
                    <span className="text-[10px] font-semibold text-emerald-700">kg CO₂</span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                  <Leaf className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </div>
            
            <p className="text-center text-[9px] text-muted mt-4">
              Issued by W2A Intelligence Platform on {passport.production_date}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}