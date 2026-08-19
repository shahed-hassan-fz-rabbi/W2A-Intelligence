// Location: src/components/CitizenReportModal.jsx
"use client";

import { useState } from "react";
import { Camera, MapPin, Sparkles, CheckCircle2, AlertTriangle, X, Upload } from "lucide-react";

export default function CitizenReportModal({ isOpen, onClose }) {
  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState("");
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setImagePreview(base64String);
      // Strip base64 header if needed for direct API ingestion
      const cleanBase64 = base64String.split(",")[1];
      setImageBase64(cleanBase64);
    };
    reader.readAsDataURL(file);
  }

  function handleGetLocation() {
    setLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude.toFixed(4),
            lng: pos.coords.longitude.toFixed(4),
          });
          setLocating(false);
        },
        () => {
          // Prototype fallback coordinates
          setLocation({ lat: "23.8103", lng: "90.4125" });
          setLocating(false);
        }
      );
    } else {
      setLocation({ lat: "23.8103", lng: "90.4125" });
      setLocating(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!imageBase64) {
      setError("Please upload an image of the waste.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/citizen/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citizen_name: name || "Anonymous Citizen",
          imageBase64,
          latitude: location.lat,
          longitude: location.lng,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit report");

      setAiResponse(data.ai_triage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setImagePreview(null);
    setImageBase64("");
    setAiResponse(null);
    setError("");
    setName("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl">
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 text-muted hover:text-ink p-1 rounded-lg"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
            <Camera className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-ink">Snap & Report Waste</h2>
            <p className="text-xs text-muted">AI-assisted municipal incident triage</p>
          </div>
        </div>

        {!aiResponse ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1">
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shahed"
                className="w-full rounded-xl border border-line bg-canvas px-3 py-2 text-xs text-ink outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1">
                Upload Waste Photo
              </label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-line hover:border-brand-500 rounded-xl p-4 cursor-pointer bg-canvas/50 transition-colors">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-36 rounded-lg object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-6 w-6 text-muted mb-1" />
                    <span className="text-xs text-muted">Click to browse or take a photo</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-line">
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="h-4 w-4 text-brand-600" />
                <span className="text-ink font-medium">
                  {location.lat ? `${location.lat}, ${location.lng}` : "Location not captured"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locating}
                className="text-xs font-bold text-brand-600 hover:underline"
              >
                {locating ? "Detecting..." : "Auto-Detect"}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 transition disabled:opacity-60 shadow-md shadow-brand-600/20"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Analyze with Gemini AI
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                AI Triage Verification Complete
              </div>

              <div className="space-y-1.5 text-xs text-emerald-950">
                <div className="flex justify-between">
                  <span className="font-semibold">Detected Category:</span>
                  <span className="font-bold">{aiResponse.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Priority Level:</span>
                  <span className="font-bold text-red-700">{aiResponse.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Estimated Weight:</span>
                  <span>{aiResponse.estimated_weight_kg} kg</span>
                </div>
                <div className="pt-2 border-t border-emerald-200/60 text-[11px] leading-relaxed text-emerald-900">
                  {aiResponse.reasoning}
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full rounded-xl bg-brand-600 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 transition"
            >
              Submit Another Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}