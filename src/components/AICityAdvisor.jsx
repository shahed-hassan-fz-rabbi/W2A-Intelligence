// Location: src/components/AICityAdvisor.jsx
"use client";

import { useState } from "react";
import { Sparkles, Send, Bot, AlertCircle } from "lucide-react";

export default function AICityAdvisor() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const samplePrompts = [
    "Which zone requires immediate attention today?",
    "Which recycling partner has the highest efficiency?",
    "Summarize our current carbon reduction impact.",
  ];

  async function handleAsk(promptText) {
    const queryToAsk = promptText || question;
    if (!queryToAsk.trim()) return;

    setLoading(true);
    setError("");
    setAnswer("");
    if (promptText) setQuestion(promptText);

    try {
      const res = await fetch("/api/ai/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: queryToAsk }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reach AI advisor");

      setAnswer(data.answer);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-5 sm:p-6 text-white shadow-md">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              W2A AI City Advisor
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                Gemini 1.5 Powered
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Real-time generative decision support and environmental analytics
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleAsk(p)}
            disabled={loading}
            className="text-[11px] rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 px-2.5 py-1 text-slate-200 transition-colors disabled:opacity-50 text-left"
          >
            &ldquo;{p}&rdquo;
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask AI about municipal waste patterns, overloaded zones, or partner stats..."
          className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-slate-400 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-white transition-all disabled:opacity-50 shadow-sm"
        >
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>Analyze</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-950/60 border border-red-800/60 p-3 text-xs text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {answer && (
        <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-4 text-xs leading-relaxed text-slate-100 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1.5">
            <Bot className="h-4 w-4" />
            <span>Operational Advisory:</span>
          </div>
          <p className="whitespace-pre-line">{answer}</p>
        </div>
      )}
    </div>
  );
}