"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// --- Types ---
interface TranslationLine {
  id: number;
  original: string;
  translated: string;
  timestamp: Date;
}

interface LangOption {
  code: string;
  label: string;
  speechCode: string;
  flag: string;
}

const LANGUAGES: LangOption[] = [
  { code: "Arabic", label: "Arabic", speechCode: "ar-SA", flag: "🇸🇦" },
  { code: "English", label: "English", speechCode: "en-US", flag: "🇺🇸" },
  { code: "French", label: "Fran\u00e7ais", speechCode: "fr-FR", flag: "🇫🇷" },
  { code: "Spanish", label: "Espa\u00f1ol", speechCode: "es-ES", flag: "🇪🇸" },
  { code: "Urdu", label: "Urdu", speechCode: "ur-PK", flag: "🇵🇰" },
  { code: "Turkish", label: "T\u00fcrk\u00e7e", speechCode: "tr-TR", flag: "🇹🇷" },
  { code: "Malay", label: "Bahasa Melayu", speechCode: "ms-MY", flag: "🇲🇾" },
  { code: "Indonesian", label: "Indonesian", speechCode: "id-ID", flag: "🇮🇩" },
  { code: "Bengali", label: "Bengali", speechCode: "bn-BD", flag: "🇧🇩" },
  { code: "Somali", label: "Soomaali", speechCode: "so-SO", flag: "🇸🇴" },
];

const isRTL = (code: string) => code === "Arabic" || code === "Urdu";

// --- Component ---
export default function LiveListen() {
  const [isListening, setIsListening] = useState(false);
  const [lines, setLines] = useState<TranslationLine[]>([]);
  const [currentPartial, setCurrentPartial] = useState("");
  const [liveTranslation, setLiveTranslation] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sourceLang, setSourceLang] = useState<LangOption>(LANGUAGES[0]);
  const [targetLang, setTargetLang] = useState<LangOption>(LANGUAGES[1]);
  const [error, setError] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const lineIdRef = useRef(0);
  const pendingTextRef = useRef("");
  const isListeningRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interimTranslateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastInterimRef = useRef("");

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) setAvailableVoices(voices);
    };
    loadVoices();
    speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  // Auto-scroll feed
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [lines, currentPartial, liveTranslation]);

  // Pick the best voice
  const getBestVoice = useCallback((): SpeechSynthesisVoice | null => {
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) return null;
    if (selectedVoiceURI) {
      const selected = voices.find((v) => v.voiceURI === selectedVoiceURI);
      if (selected) return selected;
    }
    const langCode = targetLang.speechCode.split("-")[0];
    const langVoices = voices.filter((v) => v.lang.startsWith(langCode));
    if (langVoices.length === 0) return null;
    const premium = langVoices.find((v) => /natural|premium|enhanced|neural/i.test(v.name));
    if (premium) return premium;
    const smooth = langVoices.find((v) => /samantha|karen|fiona|google/i.test(v.name));
    if (smooth) return smooth;
    return langVoices[0];
  }, [targetLang.speechCode, selectedVoiceURI]);

  const speak = useCallback(
    (text: string) => {
      if (!voiceEnabled || !text) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang.speechCode;
      utterance.rate = 0.85;
      utterance.pitch = 0.95;
      utterance.volume = 0.9;
      const voice = getBestVoice();
      if (voice) utterance.voice = voice;
      speechSynthesis.speak(utterance);
    },
    [voiceEnabled, targetLang.speechCode, getBestVoice]
  );

  // Translate text via streaming API
  const translateText = useCallback(
    async (text: string, isInterim = false) => {
      if (!text.trim()) return;

      // Cancel any in-flight interim request
      if (isInterim && abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      if (isInterim) abortControllerRef.current = controller;

      if (!isInterim) setTranslating(true);

      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            sourceLang: sourceLang.code,
            targetLang: targetLang.code,
            stream: true,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const data = await res.json();
          if (data.error) setError(data.error);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let fullTranslation = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullTranslation += chunk;

          if (isInterim) {
            setLiveTranslation(fullTranslation);
          } else {
            setLiveTranslation(fullTranslation);
          }
        }

        if (!isInterim) {
          // Finalize as a completed line
          const newLine: TranslationLine = {
            id: ++lineIdRef.current,
            original: text,
            translated: fullTranslation,
            timestamp: new Date(),
          };
          setLines((prev) => [...prev, newLine]);
          setLiveTranslation("");
          speak(fullTranslation);
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        console.error(e);
        if (!isInterim) setError("Failed to connect to translation service");
      } finally {
        if (!isInterim) setTranslating(false);
        if (isInterim) abortControllerRef.current = null;
      }
    },
    [sourceLang.code, targetLang.code, speak]
  );

  // Start listening
  const startListening = useCallback(() => {
    setError(null);
    setLines([]);
    setLiveTranslation("");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition not supported. Try Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = sourceLang.speechCode;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const finalText = result[0].transcript.trim();
          if (finalText) {
            pendingTextRef.current += (pendingTextRef.current ? " " : "") + finalText;
            // Clear interim translation timers
            if (interimTranslateTimerRef.current) {
              clearTimeout(interimTranslateTimerRef.current);
              interimTranslateTimerRef.current = null;
            }
            // Debounce final: send after 800ms of no new finals
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(() => {
              if (pendingTextRef.current.trim()) {
                const text = pendingTextRef.current;
                pendingTextRef.current = "";
                setCurrentPartial("");
                setLiveTranslation("");
                translateText(text, false);
              }
            }, 800);
          }
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // Show pending + interim as the live partial
      const fullPartial = [pendingTextRef.current, interimTranscript].filter(Boolean).join(" ");
      if (fullPartial) {
        setCurrentPartial(fullPartial);
      }

      // Fire interim translation for real-time English preview
      // Only if we have enough new text and aren't about to send a final
      const combinedText = [pendingTextRef.current, interimTranscript].filter(Boolean).join(" ");
      if (combinedText.trim() && combinedText !== lastInterimRef.current) {
        lastInterimRef.current = combinedText;
        if (interimTranslateTimerRef.current) clearTimeout(interimTranslateTimerRef.current);
        interimTranslateTimerRef.current = setTimeout(() => {
          translateText(combinedText, true);
        }, 400);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      console.error("Speech error:", event.error);
      setError(`Microphone error: ${event.error}`);
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        try { recognition.start(); } catch { /* already started */ }
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setError("Could not start microphone. Please allow microphone access.");
    }
  }, [sourceLang.speechCode, translateText]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    setCurrentPartial("");
    if (debounceTimerRef.current) { clearTimeout(debounceTimerRef.current); debounceTimerRef.current = null; }
    if (interimTranslateTimerRef.current) { clearTimeout(interimTranslateTimerRef.current); interimTranslateTimerRef.current = null; }
    if (abortControllerRef.current) { abortControllerRef.current.abort(); abortControllerRef.current = null; }
    if (recognitionRef.current) { recognitionRef.current.onend = null; recognitionRef.current.abort(); recognitionRef.current = null; }
    speechSynthesis.cancel();
    if (pendingTextRef.current.trim()) {
      const remaining = pendingTextRef.current;
      pendingTextRef.current = "";
      translateText(remaining, false);
    }
  }, [translateText]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) { recognitionRef.current.onend = null; recognitionRef.current.abort(); }
      speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="h-dvh flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 shrink-0">
        <h1 className="text-xl font-bold tracking-tight gradient-text">
          LiveListen
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="p-2.5 rounded-xl transition-all"
            style={{
              background: voiceEnabled ? "rgba(124, 106, 255, 0.2)" : "rgba(148, 148, 192, 0.08)",
              color: voiceEnabled ? "var(--accent-light)" : "var(--text-muted)",
              border: `1px solid ${voiceEnabled ? "rgba(124, 106, 255, 0.3)" : "transparent"}`,
            }}
            title={voiceEnabled ? "Voice on" : "Voice off"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {voiceEnabled ? (
                <>
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </>
              ) : (
                <>
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </>
              )}
            </svg>
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 rounded-xl transition-all"
            style={{
              background: "rgba(148, 148, 192, 0.08)",
              color: "var(--text-muted)",
              border: "1px solid transparent",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Language bar */}
      <div className="flex items-center justify-center gap-3 px-4 py-2 shrink-0">
        <span className="lang-pill">{sourceLang.flag} {sourceLang.label}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        <span className="lang-pill">{targetLang.flag} {targetLang.label}</span>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2 px-4 py-3 rounded-xl text-sm shrink-0 flex items-center justify-between"
          style={{ background: "rgba(255, 92, 114, 0.1)", color: "var(--danger)", border: "1px solid rgba(255, 92, 114, 0.2)" }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-3 opacity-70 hover:opacity-100 text-lg leading-none">&times;</button>
        </div>
      )}

      {/* Translation Feed */}
      <div ref={feedRef} className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollBehavior: "smooth" }}>
        {/* Empty state - not listening */}
        {lines.length === 0 && !currentPartial && !isListening && (
          <div className="flex flex-col items-center justify-center h-full gap-5" style={{ color: "var(--text-dim)" }}>
            <div style={{ opacity: 0.3 }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-base font-medium mb-1" style={{ color: "var(--text)" }}>Ready to translate</p>
              <p className="text-sm max-w-[260px]">Tap the button below to start real-time translation</p>
            </div>
          </div>
        )}

        {/* Empty state - listening, waiting for speech */}
        {lines.length === 0 && !currentPartial && isListening && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="flex items-end gap-1.5 h-8">
              <div className="wave-bar" /><div className="wave-bar" /><div className="wave-bar" /><div className="wave-bar" /><div className="wave-bar" />
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--accent-light)" }}>Listening for speech...</p>
          </div>
        )}

        {/* Completed translation lines */}
        {lines.map((line) => (
          <div key={line.id} className="slide-up translation-card mb-3">
            <p className="text-lg leading-relaxed font-semibold" style={{ color: "var(--text)" }}>
              {line.translated}
            </p>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--text-dim)", direction: isRTL(sourceLang.code) ? "rtl" : "ltr" }}>
              {line.original}
            </p>
          </div>
        ))}

        {/* Live section: partial speech + streaming translation side by side */}
        {(currentPartial || liveTranslation) && (
          <div className="slide-up translation-card mb-3" style={{ borderColor: "rgba(124, 106, 255, 0.25)", background: "rgba(124, 106, 255, 0.08)" }}>
            {liveTranslation && (
              <p className={`text-lg leading-relaxed font-semibold streaming-cursor`} style={{ color: "var(--accent-light)" }}>
                {liveTranslation}
              </p>
            )}
            {currentPartial && (
              <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--text-dim)", direction: isRTL(sourceLang.code) ? "rtl" : "ltr" }}>
                {currentPartial}
              </p>
            )}
          </div>
        )}

        {translating && !liveTranslation && (
          <div className="flex items-center gap-2 mb-3 px-2" style={{ color: "var(--accent-light)" }}>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-current pulse-ring" style={{ animationDelay: "0s" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-current pulse-ring" style={{ animationDelay: "0.15s" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-current pulse-ring" style={{ animationDelay: "0.3s" }} />
            </div>
            <span className="text-sm font-medium">Translating...</span>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="shrink-0 pb-8 pt-3 flex flex-col items-center gap-3 glass" style={{ borderTop: "1px solid var(--surface-border)" }}>
        {isListening && (
          <div className="flex items-center gap-2.5">
            <div className="flex items-end gap-1 h-4">
              <div className="wave-bar" style={{ width: 2, height: 6 }} />
              <div className="wave-bar" style={{ width: 2, height: 10 }} />
              <div className="wave-bar" style={{ width: 2, height: 7 }} />
              <div className="wave-bar" style={{ width: 2, height: 12 }} />
              <div className="wave-bar" style={{ width: 2, height: 5 }} />
            </div>
            <span className="text-xs font-bold tracking-widest" style={{ color: "var(--accent-light)" }}>LIVE</span>
          </div>
        )}

        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all ${isListening ? "" : "glow-btn"}`}
          style={{
            background: isListening ? "var(--danger)" : "var(--accent-gradient)",
            border: "none",
            cursor: "pointer",
            boxShadow: isListening ? "0 0 30px rgba(255, 92, 114, 0.3)" : undefined,
          }}
        >
          {isListening ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="6" width="12" height="12" rx="3" />
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>

        <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          {isListening ? "Tap to stop" : "Tap to start"}
        </p>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setShowSettings(false)}>
          <div className="w-full max-w-lg rounded-t-3xl p-6 pb-10 glass" style={{ border: "1px solid var(--surface-border)", borderBottom: "none" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold gradient-text">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-dim)", background: "rgba(148, 148, 192, 0.08)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-dim)" }}>
                  Source Language
                </label>
                <select value={sourceLang.code} onChange={(e) => { const l = LANGUAGES.find((l) => l.code === e.target.value); if (l) setSourceLang(l); }} className="settings-select">
                  {LANGUAGES.map((l) => (<option key={l.code} value={l.code}>{l.flag} {l.label}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-dim)" }}>
                  Target Language
                </label>
                <select value={targetLang.code} onChange={(e) => { const l = LANGUAGES.find((l) => l.code === e.target.value); if (l) setTargetLang(l); }} className="settings-select">
                  {LANGUAGES.map((l) => (<option key={l.code} value={l.code}>{l.flag} {l.label}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-dim)" }}>
                  Voice
                </label>
                <select value={selectedVoiceURI} onChange={(e) => setSelectedVoiceURI(e.target.value)} className="settings-select">
                  <option value="">Auto (best available)</option>
                  {availableVoices
                    .filter((v) => v.lang.startsWith(targetLang.speechCode.split("-")[0]))
                    .map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>{v.name}{v.localService ? "" : " (cloud)"}</option>
                    ))}
                </select>
              </div>
            </div>

            <p className="text-xs mt-6 text-center" style={{ color: "var(--text-muted)" }}>
              Changes take effect on next session
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
