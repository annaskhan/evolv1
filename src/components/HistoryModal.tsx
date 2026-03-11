"use client";

import { useRef, useEffect } from "react";
import { type SavedSession, formatDate, formatTime, wordCount, clearAllSessions } from "@/lib/sessions";

interface HistoryModalProps {
  show: boolean;
  onClose: () => void;
  sessions: SavedSession[];
  onViewSession: (session: SavedSession) => void;
  onDeleteSession: (id: string) => void;
  onSessionsChanged: () => void;
}

export function HistoryModal({ show, onClose, sessions, onViewSession, onDeleteSession, onSessionsChanged }: HistoryModalProps) {
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const modal = historyRef.current;
      if (!modal) return;
      const focusable = modal.querySelectorAll<HTMLElement>('button, select, input, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const modal = historyRef.current;
    if (modal) {
      const first = modal.querySelector<HTMLElement>('button, select, input');
      first?.focus();
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [show, onClose]);

  if (!show) return null;

  const handleClearAll = () => {
    if (sessions.length === 0) return;
    clearAllSessions();
    onSessionsChanged();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.65)" }} onClick={onClose} role="dialog" aria-modal="true" aria-label="Session history">
      <div ref={historyRef} className="w-full max-w-lg rounded-t-3xl p-6 pb-10 glass fade-in" style={{ border: "1px solid var(--surface-border)", borderBottom: "none", maxHeight: "75vh", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--text)" }}>Session History</h2>
          <div className="flex items-center gap-2">
            {sessions.length > 0 && (
              <button onClick={handleClearAll} className="text-xs px-2 py-1 rounded-lg" style={{ color: "var(--danger)", fontFamily: "var(--font-sans)" }} aria-label="Clear all sessions">
                Clear All
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "var(--text-dim)" }} aria-label="Close history">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {sessions.length === 0 && (
            <p style={{ fontFamily: "var(--font-serif)", fontSize: 14, color: "var(--text-muted)", textAlign: "center", padding: "2rem 0" }}>
              No saved sessions yet. Sessions are saved automatically when you stop listening.
            </p>
          )}
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl p-3 transition-colors" style={{ background: "rgba(196, 168, 130, 0.04)", border: "1px solid var(--surface-border)", cursor: "pointer" }}
              onClick={() => { onClose(); onViewSession(s); }}
              role="button" tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClose(); onViewSession(s); } }}
              aria-label={`Session: ${s.sourceLang} to ${s.targetLang}, ${formatDate(s.date)}`}>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 500, color: "var(--text-dim)", marginBottom: 2 }}>
                  {formatDate(s.date)}
                </p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--text-muted)" }}>
                  {s.sourceLang} &rarr; {s.targetLang} &middot; {formatTime(s.duration)} &middot; {wordCount(s.translation)} words
                </p>
                {s.translation && (
                  <p className="mt-1 truncate" style={{ fontFamily: "var(--font-serif)", fontSize: 13, color: "var(--text-dim)", maxWidth: "100%" }}>
                    {s.translation.slice(0, 80)}{s.translation.length > 80 ? "..." : ""}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-3 shrink-0">
                <button className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-muted)" }}
                  onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id); }}
                  aria-label={`Delete session from ${formatDate(s.date)}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
