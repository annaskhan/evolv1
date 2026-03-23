"use client";

import { useState, useCallback } from "react";
import { APP_NAME, APP_TAGLINE, FOCUS_AREAS, STORAGE_KEYS, type FocusAreaId } from "@/lib/constants";
import { setItem } from "@/lib/storage";

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = ["welcome", "name", "focus", "ready"] as const;
type Step = (typeof STEPS)[number];

function FocusIcon({ icon }: { icon: string }) {
  const icons: Record<string, string> = {
    pray: "\u{1F64F}",
    heart: "\u{2764}\u{FE0F}",
    brain: "\u{1F9E0}",
    briefcase: "\u{1F4BC}",
    users: "\u{1F465}",
    book: "\u{1F4DA}",
    "check-circle": "\u{2705}",
    wallet: "\u{1F4B0}",
  };
  return <span className="text-lg">{icons[icon] || "\u{2B50}"}</span>;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<Step>("welcome");
  const [name, setName] = useState("");
  const [focusAreas, setFocusAreas] = useState<FocusAreaId[]>([]);

  const stepIndex = STEPS.indexOf(step);

  const next = useCallback(() => {
    const nextIdx = stepIndex + 1;
    if (nextIdx < STEPS.length) {
      setStep(STEPS[nextIdx]);
    }
  }, [stepIndex]);

  const back = useCallback(() => {
    const prevIdx = stepIndex - 1;
    if (prevIdx >= 0) {
      setStep(STEPS[prevIdx]);
    }
  }, [stepIndex]);

  const toggleFocus = useCallback((id: FocusAreaId) => {
    setFocusAreas((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  }, []);

  const finish = useCallback(() => {
    if (name.trim()) setItem(STORAGE_KEYS.USER_NAME, name.trim());
    if (focusAreas.length > 0) setItem(STORAGE_KEYS.FOCUS_AREAS, focusAreas);
    setItem(STORAGE_KEYS.ONBOARDED, true);
    onComplete();
  }, [name, focusAreas, onComplete]);

  return (
    <div className="onboarding-screen">
      {/* Progress dots */}
      <div className="onboarding-dots">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`onboarding-dot ${i === stepIndex ? "active" : ""}`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="fade-in-up" key={step} style={{ maxWidth: 400, width: "100%" }}>
        {step === "welcome" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u{1F331}"}</div>
            <h1 className="font-display" style={{ fontSize: 36, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
              {APP_NAME}
            </h1>
            <p style={{ fontSize: 18, color: "var(--text-dim)", marginBottom: 40, lineHeight: 1.5 }}>
              {APP_TAGLINE}
            </p>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 48, lineHeight: 1.7, padding: "0 12px" }}>
              Track your goals, journal your journey, and watch yourself grow — one day at a time.
            </p>
            <button className="btn btn-primary" onClick={next} style={{ width: "100%", padding: "16px 24px", fontSize: 16 }}>
              Get Started
            </button>
          </>
        )}

        {step === "name" && (
          <>
            <h2 className="font-display" style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
              {"What\u2019s your name?"}
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-dim)", marginBottom: 32 }}>
              {"We\u2019ll use this to personalize your experience."}
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              autoFocus
              maxLength={50}
              style={{
                width: "100%",
                padding: "14px 18px",
                fontSize: 16,
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--surface-border)",
                background: "var(--bg-card)",
                color: "var(--text)",
                outline: "none",
                marginBottom: 32,
                fontFamily: "var(--font-sans)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--surface-border)")}
              onKeyDown={(e) => e.key === "Enter" && name.trim() && next()}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-secondary" onClick={back} style={{ flex: 1 }}>
                Back
              </button>
              <button className="btn btn-primary" onClick={next} style={{ flex: 2 }} disabled={!name.trim()}>
                Continue
              </button>
            </div>
          </>
        )}

        {step === "focus" && (
          <>
            <h2 className="font-display" style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
              What are you working on?
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-dim)", marginBottom: 24 }}>
              Choose areas you want to focus on. You can change these later.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 32 }}>
              {FOCUS_AREAS.map((area) => (
                <button
                  key={area.id}
                  className={`focus-chip ${focusAreas.includes(area.id) ? "selected" : ""}`}
                  onClick={() => toggleFocus(area.id)}
                >
                  <FocusIcon icon={area.icon} />
                  {area.label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-secondary" onClick={back} style={{ flex: 1 }}>
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={next}
                style={{ flex: 2 }}
                disabled={focusAreas.length === 0}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === "ready" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u{2728}"}</div>
            <h2 className="font-display" style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
              {"You\u2019re all set, " + (name.trim() || "friend") + "!"}
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-dim)", marginBottom: 16, lineHeight: 1.7 }}>
              Your journey begins now. Set your first goal, write your first journal entry, or just explore.
            </p>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 40 }}>
              Remember: progress, not perfection.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-secondary" onClick={back} style={{ flex: 1 }}>
                Back
              </button>
              <button className="btn btn-primary" onClick={finish} style={{ flex: 2, fontSize: 16, padding: "16px 24px" }}>
                {"Let\u2019s Go"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
