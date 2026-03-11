"use client";

import { isRTL } from "@/lib/constants";
import { type SavedSession, formatDate, formatTime, exportSession } from "@/lib/sessions";

interface SessionViewerProps {
  session: SavedSession;
  onBack: () => void;
}

export function SessionViewer({ session, onBack }: SessionViewerProps) {
  const vSourceRTL = isRTL(session.sourceLang);
  const vTargetRTL = isRTL(session.targetLang);

  const handleShare = async () => {
    const text = exportSession(session);
    if (navigator.share) {
      try {
        await navigator.share({ title: "LiveListen Session", text });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="h-dvh flex flex-col" style={{ background: "var(--bg)" }}>
      <header className="flex items-center justify-between px-5 py-3 shrink-0" style={{ borderBottom: "1px solid var(--surface-border)" }}>
        <button onClick={onBack} className="flex items-center gap-2 p-1" style={{ color: "var(--accent)" }} aria-label="Go back to main screen">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500 }}>Back</span>
        </button>
        <div className="flex items-center gap-3">
          <button onClick={handleShare} className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }} aria-label="Share session">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
          <div className="text-right">
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--text-muted)" }}>{formatDate(session.date)}</p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--text-muted)" }}>
              {session.sourceLang} &rarr; {session.targetLang} &middot; {formatTime(session.duration)}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-5 py-2.5 shrink-0" style={{ borderBottom: "1px solid var(--surface-border)" }}>
            <span className="panel-label">{session.targetLang}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5" style={{ direction: vTargetRTL ? "rtl" : "ltr" }}>
            <div className="transcript-translation">{session.translation || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No translation recorded</span>}</div>
          </div>
        </div>
        <div className="panel-divider-responsive shrink-0" />
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-5 py-2.5 shrink-0" style={{ borderBottom: "1px solid var(--surface-border)" }}>
            <span className="panel-label">{session.sourceLang}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5" style={{ direction: vSourceRTL ? "rtl" : "ltr" }}>
            <div className={vSourceRTL ? "transcript-original-rtl" : "transcript-original"}>{session.original || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No transcript recorded</span>}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
