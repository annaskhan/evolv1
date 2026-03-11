"use client";

import { useRef, useEffect } from "react";
import { LANGUAGES, type LangOption } from "@/lib/constants";

interface SettingsModalProps {
  show: boolean;
  onClose: () => void;
  sourceLang: LangOption;
  targetLang: LangOption;
  onSourceLangChange: (lang: LangOption) => void;
  onTargetLangChange: (lang: LangOption) => void;
  selectedVoiceURI: string;
  onVoiceChange: (uri: string) => void;
  availableVoices: SpeechSynthesisVoice[];
  useDeepgram: boolean;
  onEngineChange: (useDeepgram: boolean) => void;
}

export function SettingsModal({
  show, onClose, sourceLang, targetLang,
  onSourceLangChange, onTargetLangChange,
  selectedVoiceURI, onVoiceChange, availableVoices,
  useDeepgram, onEngineChange,
}: SettingsModalProps) {
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const modal = settingsRef.current;
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
    const modal = settingsRef.current;
    if (modal) {
      const first = modal.querySelector<HTMLElement>('button, select, input');
      first?.focus();
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.65)" }} onClick={onClose} role="dialog" aria-modal="true" aria-label="Settings">
      <div ref={settingsRef} className="w-full max-w-lg rounded-t-3xl p-6 pb-10 glass fade-in" style={{ border: "1px solid var(--surface-border)", borderBottom: "none" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--text)" }}>Settings</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "var(--text-dim)" }} aria-label="Close settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div className="space-y-5">
          <div>
            <label htmlFor="source-lang" className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Source Language</label>
            <select id="source-lang" value={sourceLang.code} onChange={(e) => { const l = LANGUAGES.find((x) => x.code === e.target.value); if (l) onSourceLangChange(l); }} className="settings-select">
              {LANGUAGES.map((l) => (<option key={l.code} value={l.code}>{l.label}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="target-lang" className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Target Language</label>
            <select id="target-lang" value={targetLang.code} onChange={(e) => { const l = LANGUAGES.find((x) => x.code === e.target.value); if (l) onTargetLangChange(l); }} className="settings-select">
              {LANGUAGES.map((l) => (<option key={l.code} value={l.code}>{l.label}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="voice-select" className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Voice</label>
            <select id="voice-select" value={selectedVoiceURI} onChange={(e) => onVoiceChange(e.target.value)} className="settings-select">
              <option value="">Auto</option>
              {availableVoices.filter((v) => v.lang.startsWith(targetLang.speechCode.split("-")[0])).map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>{v.name}{v.localService ? "" : " (cloud)"}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="engine-select" className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Speech Engine</label>
            <select id="engine-select" value={useDeepgram ? "deepgram" : "browser"} onChange={(e) => onEngineChange(e.target.value === "deepgram")} className="settings-select">
              <option value="deepgram">Deepgram Nova-3</option>
              <option value="browser">Browser built-in</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>Changes apply on next session</p>
          <div className="flex items-center gap-3">
            <a href="/privacy" className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>Privacy</a>
            <a href="/terms" className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>Terms</a>
          </div>
        </div>
      </div>
    </div>
  );
}
