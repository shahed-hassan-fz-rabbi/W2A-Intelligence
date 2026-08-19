// Location: src/components/W2AChatbot.jsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, X, Send, Sparkles, Bot, User } from "lucide-react";

export default function W2AChatbot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am your W2A Smart City Assistant. How can I assist you with municipal waste, carbon offsets, or company allocations today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Hide chatbot on Auth pages (/login, /register) for a clean UI
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  async function handleSend(promptText) {
    const textToSend = promptText || input;
    if (!textToSend.trim()) return;

    const userMsg = { sender: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!promptText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.reply || "Sorry, I am unable to process your request at the moment.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I am having trouble connecting to the city database. Please try again shortly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Trigger Button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl hover:bg-brand-700 hover:scale-105 transition-all border border-white/20"
        >
          <Sparkles className="h-4 w-4" />
          <span>Ask W2A AI</span>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="flex flex-col w-[350px] sm:w-[380px] h-[480px] rounded-3xl bg-surface border border-line shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-brand-600 text-white shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/20">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">W2A Intelligence AI</p>
                <p className="text-[10px] text-white/80">Smart City Advisor</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-canvas border-b border-line overflow-x-auto no-scrollbar">
            {["City Summary", "Carbon Impact", "Top Recyclers"].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                className="whitespace-nowrap text-[10px] font-semibold bg-surface border border-line text-ink hover:border-brand-500 px-2.5 py-1 rounded-full transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Message History */}
          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "ai" && (
                  <div className="h-6 w-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`p-2.5 rounded-2xl max-w-[80%] leading-relaxed ${
                    m.sender === "user"
                      ? "bg-brand-600 text-white rounded-br-none"
                      : "bg-canvas border border-line text-ink rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-bounce" />
                <div className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-bounce [animation-delay:0.2s]" />
                <div className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-surface border-t border-line flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about recycling data..."
              className="flex-1 bg-canvas border border-line rounded-xl px-3 py-1.5 text-xs text-ink outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-brand-600 text-white disabled:opacity-40 hover:bg-brand-700"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}