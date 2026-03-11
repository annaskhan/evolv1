"use client";

interface OnboardingScreenProps {
  onDismiss: () => void;
}

export function OnboardingScreen({ onDismiss }: OnboardingScreenProps) {
  return (
    <div className="h-dvh flex flex-col items-center justify-center px-8" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm fade-in text-center">
        <div className="mb-6">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: "var(--accent-gradient)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2" style={{ fontFamily: "var(--font-serif)", color: "var(--text)" }}>
            Welcome to LiveListen
          </h1>
          <p className="mb-6" style={{ fontFamily: "var(--font-serif)", fontSize: 15, color: "var(--text-dim)", lineHeight: 1.6 }}>
            Real-time translation for conversations, meetings, speeches, and more.
          </p>
        </div>

        <div className="space-y-4 mb-8 text-left">
          {[
            { step: "1", title: "Allow microphone access", desc: "LiveListen needs your microphone to hear and translate speech in real-time." },
            { step: "2", title: "Choose your languages", desc: "Set the source and target languages in Settings before starting." },
            { step: "3", title: "Tap to start", desc: "Tap the microphone button and the translation will appear as the speaker talks." },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center" style={{ background: "rgba(196, 168, 130, 0.1)" }}>
                <span style={{ color: "var(--accent)", fontSize: 14, fontWeight: 600 }}>{item.step}</span>
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{item.title}</p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-muted)" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={onDismiss} className="w-full py-3.5 rounded-2xl text-white font-medium" style={{ background: "var(--accent-gradient)", fontFamily: "var(--font-sans)", fontSize: 15 }}>
          Get Started
        </button>

        <div className="mt-4 flex items-center justify-center gap-4">
          <a href="/privacy" className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>Privacy Policy</a>
          <a href="/terms" className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>Terms of Service</a>
        </div>
      </div>
    </div>
  );
}
