import { useEffect, useRef, useState } from "react";
import { api } from "../api";

const SUGGESTIONS = ["How does the fit run?", "What's in stock?", "Shipping & returns?"];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome to KAVO. Ask me about sizing, shipping, products or availability.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem("kavo_chat_session") || "");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open, loading]);

  async function send(text) {
    const message = (text ?? input).trim();
    if (!message || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: message }]);
    setLoading(true);
    try {
      const res = await api.chat(message, sessionId);
      if (res.session_id && res.session_id !== sessionId) {
        setSessionId(res.session_id);
        localStorage.setItem("kavo_chat_session", res.session_id);
      }
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch (_) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry — I couldn't reach support right now. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-bone shadow-xl transition hover:scale-105"
        aria-label="Support chat"
      >
        <span className="font-display text-xs tracking-widest">{open ? "×" : "AI"}</span>
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[30rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col border hairline bg-bone shadow-2xl animate-fadeup">
          <div className="border-b hairline px-4 py-3">
            <p className="font-display text-sm tracking-widest">KAVO ASSISTANT</p>
            <p className="text-[10px] uppercase tracking-ultra text-smoke">Sizing · Shipping · Stock</p>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-ink text-bone"
                    : "bg-ash text-ink"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="max-w-[85%] bg-ash px-3 py-2 text-sm text-smoke">…</div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="border hairline px-2.5 py-1 text-[11px] text-smoke hover:border-ink hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex border-t hairline"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything…"
              className="flex-1 bg-transparent px-4 py-3 text-sm outline-none"
            />
            <button type="submit" className="px-4 text-[11px] font-semibold uppercase tracking-ultra">
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
