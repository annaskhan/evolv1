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
}

const LANGUAGES: LangOption[] = [
  { code: "Arabic", label: "Arabic (العربية)", speechCode: "ar-SA" },
  { code: "English", label: "English", speechCode: "en-US" },
  { code: "French", label: "French (Français)", speechCode: "fr-FR" },
  { code: "Spanish", label: "Spanish (Español)", speechCode: "es-ES" },
  { code: "Urdu", label: "Urdu (اردو)", speechCode: "ur-PK" },
  { code: "Turkish", label: "Turkish (Türkçe)", speechCode: "tr-TR" },
  { code: "Malay", label: "Malay (Bahasa)", speechCode: "ms-MY" },
  { code: "Indonesian", label: "Indonesian", speechCode: "id-ID" },
  { code: "Bengali", label: "Bengali (বাংলা)", speechCode: "bn-BD" },
  { code: "Somali", label: "Somali (Soomaali)", speechCode: "so-SO" },
];

// --- Component ---
export default function LiveListen() {
  const [isListening, setIsListening] = useState(false);
  const [lines, setLines] = useState<TranslationLine[]>([]);
  const [currentPartial, setCurrentPartial] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sourceLang, setSourceLang] = useState<LangOption>(LANGUAGES[0]);
  const [targetLang, setTargetLang] = useState<LangOption>(LANGUAGES[1]);
  const [error, setError] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const lineIdRef = useRef(0);
  const pendingTextRef = useRef("");
  const isListeningRef = useRef(false);

  // Keep ref in sync
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Auto-scroll feed
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [lines, currentPartial]);

  // Speak translation
  const speak = useCallback(
    (text: string) => {
      if (!voiceEnabled || !text) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang.speechCode;
      utterance.rate = 0.95;
      speechSynthesis.speak(utterance);
    },
    [voiceEnabled, targetLang.speechCode]
  );

  // Translate text via API
  const translateText = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setTranslating(true);
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            sourceLang: sourceLang.code,
            targetLang: targetLang.code,
          }),
        });
        const data = await res.json();
        if (data.error) {
          setError(data.error);
          return;
        }
        const newLine: TranslationLine = {
          id: ++lineIdRef.current,
          original: text,
          translated: data.translation,
          timestamp: new Date(),
        };
        setLines((prev) => [...prev, newLine]);
        speak(data.translation);
      } catch (e) {
        console.error(e);
        setError("Failed to connect to translation service");
      } finally {
        setTranslating(false);
      }
    },
    [sourceLang.code, targetLang.code, speak]
  );

  // Start listening
  const startListening = useCallback(() => {
    setError(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition not supported in this browser. Try Chrome or Safari."
      );
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
            // Send for translation once we have enough text
            const text = pendingTextRef.current;
            pendingTextRef.current = "";
            setCurrentPartial("");
            translateText(text);
          }
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      if (interimTranscript) {
        setCurrentPartial(interimTranscript);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") return; // Ignore no-speech
      if (event.error === "aborted") return;
      console.error("Speech error:", event.error);
      setError(`Microphone error: ${event.error}`);
    };

    recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch {
          // Already started
        }
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

  // Stop listening
  const stopListening = useCallback(() => {
    setIsListening(false);
    setCurrentPartial("");
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    speechSynthesis.cancel();
    // Translate any remaining text
    if (pendingTextRef.current.trim()) {
      const remaining = pendingTextRef.current;
      pendingTextRef.current = "";
      translateText(remaining);
    }
  }, [translateText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      }
      speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="h-dvh flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 shrink-0">
        <h1 className="text-lg font-semibold tracking-tight" style={{ color: "var(--text)" }}>
          LiveListen
        </h1>
        <div className="flex items-center gap-3">
          {/* Voice toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="p-2 rounded-lg transition-colors"
            style={{
              background: voiceEnabled ? "var(--accent)" : "var(--bg-card)",
              color: voiceEnabled ? "#fff" : "var(--text-dim)",
            }}
            title={voiceEnabled ? "Voice on" : "Voice off"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ background: "var(--bg-card)", color: "var(--text-dim)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Language bar */}
      <div
        className="flex items-center justify-center gap-2 px-4 py-2 text-xs shrink-0"
        style={{ color: "var(--text-dim)" }}
      >
        <span>{sourceLang.label}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        <span>{targetLang.label}</span>
      </div>

      {/* Error */}
      {error && (
        <div
          className="mx-4 mb-2 px-3 py-2 rounded-lg text-sm shrink-0"
          style={{ background: "rgba(255,71,87,0.15)", color: "var(--danger)" }}
        >
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Translation Feed */}
      <div
        ref={feedRef}
        className="flex-1 overflow-y-auto px-4 py-2"
        style={{ scrollBehavior: "smooth" }}
      >
        {lines.length === 0 && !currentPartial && !isListening && (
          <div
            className="flex flex-col items-center justify-center h-full gap-4"
            style={{ color: "var(--text-dim)" }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            <p className="text-center text-sm max-w-[240px]">
              Tap the button below to start listening and translating in real time
            </p>
          </div>
        )}

        {lines.length === 0 && !currentPartial && isListening && (
          <div
            className="flex flex-col items-center justify-center h-full gap-3"
            style={{ color: "var(--text-dim)" }}
          >
            <div className="pulse-ring">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              </svg>
            </div>
            <p className="text-sm">Listening...</p>
          </div>
        )}

        {lines.map((line) => (
          <div
            key={line.id}
            className="slide-up mb-4"
          >
            <p
              className="text-xl leading-relaxed font-medium"
              style={{ color: "var(--text)" }}
            >
              {line.translated}
            </p>
            <p
              className="text-sm mt-1 leading-relaxed"
              style={{ color: "var(--text-dim)", direction: sourceLang.code === "Arabic" || sourceLang.code === "Urdu" ? "rtl" : "ltr" }}
            >
              {line.original}
            </p>
          </div>
        ))}

        {/* Current partial / in-progress */}
        {currentPartial && (
          <div className="mb-4 slide-up">
            <p
              className="text-lg italic"
              style={{ color: "var(--text-dim)", direction: sourceLang.code === "Arabic" || sourceLang.code === "Urdu" ? "rtl" : "ltr" }}
            >
              {currentPartial}
            </p>
          </div>
        )}

        {translating && (
          <div className="flex items-center gap-2 mb-4" style={{ color: "var(--accent)" }}>
            <div className="w-2 h-2 rounded-full bg-current pulse-ring" />
            <span className="text-sm">Translating...</span>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="shrink-0 pb-8 pt-4 flex flex-col items-center gap-3">
        {/* Listening indicator */}
        {isListening && (
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--accent)" }}>
            <div className="w-2 h-2 rounded-full bg-current pulse-ring" />
            <span>LIVE</span>
          </div>
        )}

        {/* Main button */}
        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            isListening ? "" : "glow-btn"
          }`}
          style={{
            background: isListening ? "var(--danger)" : "var(--accent)",
            border: "none",
            cursor: "pointer",
          }}
        >
          {isListening ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>

        <p className="text-xs" style={{ color: "var(--text-dim)" }}>
          {isListening ? "Tap to stop" : "Tap to start listening"}
        </p>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setShowSettings(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-2xl p-6 pb-10"
            style={{ background: "var(--bg-card)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                style={{ color: "var(--text-dim)" }}
                className="p-1"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: "var(--text-dim)" }}>
                  Source Language (listening)
                </label>
                <select
                  value={sourceLang.code}
                  onChange={(e) => {
                    const lang = LANGUAGES.find((l) => l.code === e.target.value);
                    if (lang) setSourceLang(lang);
                  }}
                  className="w-full p-3 rounded-lg text-base"
                  style={{
                    background: "var(--bg)",
                    color: "var(--text)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: "var(--text-dim)" }}>
                  Target Language (translation)
                </label>
                <select
                  value={targetLang.code}
                  onChange={(e) => {
                    const lang = LANGUAGES.find((l) => l.code === e.target.value);
                    if (lang) setTargetLang(lang);
                  }}
                  className="w-full p-3 rounded-lg text-base"
                  style={{
                    background: "var(--bg)",
                    color: "var(--text)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-xs mt-6" style={{ color: "var(--text-dim)" }}>
              Changes take effect on next listen session.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
