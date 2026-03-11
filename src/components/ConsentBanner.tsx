"use client";

import { useState, useEffect } from "react";
import { CONSENT_KEY } from "@/lib/constants";

export function ConsentBanner() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(CONSENT_KEY)) {
        setShowConsent(true);
      }
    } catch { /* */ }
  }, []);

  if (!showConsent) return null;

  const accept = () => {
    try { localStorage.setItem(CONSENT_KEY, "accepted"); } catch { /* */ }
    setShowConsent(false);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] px-4 pb-4"
      role="dialog"
      aria-label="Privacy consent"
    >
      <div
        className="max-w-lg mx-auto rounded-2xl p-4 glass fade-in"
        style={{ border: "1px solid var(--surface-border)" }}
      >
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 12 }}>
          LiveListen processes audio through Deepgram for transcription and Anthropic Claude for translation.
          Audio is processed in real-time and not stored. Session history is saved locally on your device only.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={accept}
            className="flex-1 py-2.5 rounded-xl text-white font-medium text-sm"
            style={{ background: "var(--accent-gradient)", fontFamily: "var(--font-sans)" }}
          >
            I Understand
          </button>
          <a
            href="/privacy"
            className="text-xs font-medium px-3 py-2.5"
            style={{ color: "var(--accent)", fontFamily: "var(--font-sans)" }}
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
