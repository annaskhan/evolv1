"use client";

import { useState, useCallback, useEffect } from "react";
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
  return <span className="text-lg chip-icon" style={{ display: "inline-block", transition: "all 0.3s var(--spring)" }}>{icons[icon] || "\u{2B50}"}</span>;
}

/* ===== Seed-to-Plant Evolution Animation ===== */
function GrowthAnimation() {
  const [phase, setPhase] = useState(0); // 0=seed, 1=pot, 2=watering, 3=sprout, 4=plant

  useEffect(() => {
    const timings = [1200, 2400, 3600, 4800];
    const timers = timings.map((ms, i) =>
      setTimeout(() => setPhase(i + 1), ms)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ width: 180, height: 180, position: "relative", margin: "0 auto 16px" }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        {/* Ground/soil shadow */}
        <ellipse cx="90" cy="152" rx="55" ry="10" fill="var(--secondary)" opacity="0.15">
          <animate attributeName="rx" values="25;55" dur="0.8s" fill="freeze" />
        </ellipse>

        {/* Pot */}
        <g opacity={phase >= 1 ? 1 : 0} style={{ transition: "opacity 0.5s" }}>
          {/* Pot body — tapered terracotta */}
          <path d="M52 110 L58 150 L122 150 L128 110 Z" fill="var(--accent)" stroke="none">
            {phase === 1 && <animate attributeName="d" values="M82 140 L84 150 L96 150 L98 140 Z;M52 110 L58 150 L122 150 L128 110 Z" dur="0.6s" fill="freeze" />}
          </path>
          {/* Pot rim */}
          <rect x="46" y="104" width="88" height="10" rx="4" fill="var(--accent)" opacity="0.85">
            {phase === 1 && <animate attributeName="width" values="16;88" dur="0.6s" fill="freeze" />}
            {phase === 1 && <animate attributeName="x" values="82;46" dur="0.6s" fill="freeze" />}
          </rect>
          {/* Pot highlight */}
          <path d="M60 115 L64 145 L72 145 L68 115 Z" fill="rgba(255,255,255,0.12)" opacity={phase >= 1 ? 1 : 0}>
            {phase === 1 && <animate attributeName="opacity" values="0;1" dur="0.4s" fill="freeze" begin="0.4s" />}
          </path>
          {/* Soil in pot */}
          <ellipse cx="90" cy="112" rx="34" ry="6" fill="#8B6914" opacity="0.6">
            {phase === 1 && <animate attributeName="rx" values="0;34" dur="0.5s" fill="freeze" begin="0.3s" />}
          </ellipse>
          {/* Soil texture dots */}
          <circle cx="78" cy="112" r="2" fill="#6B4F10" opacity={phase >= 1 ? 0.4 : 0} />
          <circle cx="98" cy="111" r="1.5" fill="#6B4F10" opacity={phase >= 1 ? 0.3 : 0} />
          <circle cx="86" cy="114" r="1" fill="#6B4F10" opacity={phase >= 1 ? 0.35 : 0} />
        </g>

        {/* Seed (phase 0) */}
        {phase === 0 && (
          <g>
            <ellipse cx="90" cy="120" rx="9" ry="12" fill="var(--secondary)">
              <animate attributeName="cy" values="50;120" dur="0.7s" fill="freeze" />
              <animate attributeName="opacity" values="0;1" dur="0.4s" fill="freeze" />
            </ellipse>
            {/* Seed ridge line */}
            <path d="M88 112 Q90 108 92 112" fill="none" stroke="var(--secondary-light)" strokeWidth="1.5" opacity="0">
              <animate attributeName="opacity" values="0;0.8" dur="0.3s" fill="freeze" begin="0.4s" />
            </path>
            <path d="M86 118 Q90 128 94 118" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" opacity="0">
              <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze" begin="0.5s" />
            </path>
          </g>
        )}

        {/* Water drops (phase 2) */}
        {phase >= 2 && (
          <g>
            {/* Watering can */}
            <g opacity={phase === 2 ? 1 : 0} style={{ transition: "opacity 0.6s" }}>
              <rect x="112" y="44" width="30" height="20" rx="4" fill="var(--primary)" opacity="0.75">
                <animate attributeName="x" values="160;112" dur="0.5s" fill="freeze" />
              </rect>
              {/* Handle */}
              <path d="M128 44 Q132 34 136 44" fill="none" stroke="var(--primary)" strokeWidth="2.5" opacity="0.6">
                <animate attributeName="d" values="M170 44 Q174 34 178 44;M128 44 Q132 34 136 44" dur="0.5s" fill="freeze" />
              </path>
              {/* Spout */}
              <line x1="112" y1="56" x2="100" y2="70" stroke="var(--primary)" strokeWidth="2.5" opacity="0.7">
                <animate attributeName="x1" values="160;112" dur="0.5s" fill="freeze" />
                <animate attributeName="x2" values="148;100" dur="0.5s" fill="freeze" />
              </line>
            </g>
            {/* Water droplets — multiple, staggered */}
            <circle cx="96" cy="72" r="3" fill="var(--primary-lighter)" opacity="0">
              <animate attributeName="cy" values="72;106" dur="0.7s" repeatCount="3" />
              <animate attributeName="opacity" values="0;0.8;0" dur="0.7s" repeatCount="3" />
            </circle>
            <circle cx="88" cy="76" r="2.5" fill="var(--primary-lighter)" opacity="0">
              <animate attributeName="cy" values="76;108" dur="0.7s" repeatCount="3" begin="0.2s" />
              <animate attributeName="opacity" values="0;0.7;0" dur="0.7s" repeatCount="3" begin="0.2s" />
            </circle>
            <circle cx="102" cy="70" r="2" fill="var(--primary-lighter)" opacity="0">
              <animate attributeName="cy" values="70;104" dur="0.7s" repeatCount="3" begin="0.35s" />
              <animate attributeName="opacity" values="0;0.6;0" dur="0.7s" repeatCount="3" begin="0.35s" />
            </circle>
            <circle cx="92" cy="78" r="1.5" fill="var(--primary-lighter)" opacity="0">
              <animate attributeName="cy" values="78;108" dur="0.6s" repeatCount="3" begin="0.1s" />
              <animate attributeName="opacity" values="0;0.5;0" dur="0.6s" repeatCount="3" begin="0.1s" />
            </circle>
          </g>
        )}

        {/* Sprout (phase 3) */}
        {phase >= 3 && (
          <g>
            {/* Main stem */}
            <line x1="90" y1="108" x2="90" y2="65" stroke="#2d8a4e" strokeWidth="4" strokeLinecap="round">
              <animate attributeName="y2" values="108;65" dur="0.8s" fill="freeze" />
            </line>
            {/* Stem secondary color overlay */}
            <line x1="90" y1="108" x2="90" y2="65" stroke="#3ca85e" strokeWidth="2" strokeLinecap="round" opacity="0.4">
              <animate attributeName="y2" values="108;65" dur="0.8s" fill="freeze" />
            </line>
            {/* Left leaf — larger, shaped */}
            <path d="M90 82 Q72 70 76 86" fill="#3ca85e" opacity="0">
              <animate attributeName="d" values="M90 82 Q88 80 89 83;M90 82 Q72 70 76 86" dur="0.6s" fill="freeze" begin="0.4s" />
              <animate attributeName="opacity" values="0;0.95" dur="0.4s" fill="freeze" begin="0.4s" />
            </path>
            {/* Left leaf vein */}
            <path d="M88 81 Q80 76 78 84" fill="none" stroke="#2d8a4e" strokeWidth="0.8" opacity="0">
              <animate attributeName="opacity" values="0;0.5" dur="0.3s" fill="freeze" begin="0.7s" />
            </path>
            {/* Right leaf — larger, shaped */}
            <path d="M90 75 Q108 62 104 78" fill="#3ca85e" opacity="0">
              <animate attributeName="d" values="M90 75 Q92 73 91 76;M90 75 Q108 62 104 78" dur="0.6s" fill="freeze" begin="0.6s" />
              <animate attributeName="opacity" values="0;0.95" dur="0.4s" fill="freeze" begin="0.6s" />
            </path>
            {/* Right leaf vein */}
            <path d="M92 74 Q100 68 102 76" fill="none" stroke="#2d8a4e" strokeWidth="0.8" opacity="0">
              <animate attributeName="opacity" values="0;0.5" dur="0.3s" fill="freeze" begin="0.9s" />
            </path>
          </g>
        )}

        {/* Full plant with flower (phase 4) */}
        {phase >= 4 && (
          <g>
            {/* Extended stem to top */}
            <line x1="90" y1="65" x2="90" y2="32" stroke="#2d8a4e" strokeWidth="4" strokeLinecap="round">
              <animate attributeName="y2" values="65;32" dur="0.7s" fill="freeze" />
            </line>
            <line x1="90" y1="65" x2="90" y2="32" stroke="#3ca85e" strokeWidth="2" strokeLinecap="round" opacity="0.4">
              <animate attributeName="y2" values="65;32" dur="0.7s" fill="freeze" />
            </line>

            {/* Upper left leaf */}
            <path d="M90 55 Q66 40 72 60" fill="#3ca85e" opacity="0">
              <animate attributeName="opacity" values="0;0.9" dur="0.5s" fill="freeze" begin="0.3s" />
            </path>
            <path d="M88 54 Q76 46 74 58" fill="none" stroke="#2d8a4e" strokeWidth="0.8" opacity="0">
              <animate attributeName="opacity" values="0;0.4" dur="0.3s" fill="freeze" begin="0.5s" />
            </path>

            {/* Upper right leaf */}
            <path d="M90 46 Q114 32 108 52" fill="#3ca85e" opacity="0">
              <animate attributeName="opacity" values="0;0.9" dur="0.5s" fill="freeze" begin="0.5s" />
            </path>
            <path d="M92 45 Q104 38 106 50" fill="none" stroke="#2d8a4e" strokeWidth="0.8" opacity="0">
              <animate attributeName="opacity" values="0;0.4" dur="0.3s" fill="freeze" begin="0.7s" />
            </path>

            {/* Flower — multi-petal bloom */}
            <g opacity="0">
              <animate attributeName="opacity" values="0;1" dur="0.6s" fill="freeze" begin="0.7s" />
              {/* Petals */}
              <ellipse cx="90" cy="20" rx="7" ry="10" fill="var(--accent)" opacity="0.9">
                <animate attributeName="ry" values="0;10" dur="0.5s" fill="freeze" begin="0.7s" />
              </ellipse>
              <ellipse cx="80" cy="28" rx="7" ry="10" fill="var(--accent)" opacity="0.8" transform="rotate(-45 80 28)">
                <animate attributeName="ry" values="0;10" dur="0.5s" fill="freeze" begin="0.8s" />
              </ellipse>
              <ellipse cx="100" cy="28" rx="7" ry="10" fill="var(--accent)" opacity="0.8" transform="rotate(45 100 28)">
                <animate attributeName="ry" values="0;10" dur="0.5s" fill="freeze" begin="0.85s" />
              </ellipse>
              <ellipse cx="82" cy="35" rx="6" ry="9" fill="var(--accent)" opacity="0.7" transform="rotate(-80 82 35)">
                <animate attributeName="ry" values="0;9" dur="0.5s" fill="freeze" begin="0.9s" />
              </ellipse>
              <ellipse cx="98" cy="35" rx="6" ry="9" fill="var(--accent)" opacity="0.7" transform="rotate(80 98 35)">
                <animate attributeName="ry" values="0;9" dur="0.5s" fill="freeze" begin="0.95s" />
              </ellipse>
              {/* Flower center */}
              <circle cx="90" cy="28" r="0" fill="var(--secondary)">
                <animate attributeName="r" values="0;6" dur="0.5s" fill="freeze" begin="1s" />
              </circle>
              <circle cx="90" cy="28" r="0" fill="var(--secondary-light)" opacity="0.6">
                <animate attributeName="r" values="0;3" dur="0.4s" fill="freeze" begin="1.1s" />
              </circle>
            </g>

            {/* Sparkles / glow particles */}
            <circle cx="62" cy="18" r="0" fill="var(--primary)">
              <animate attributeName="r" values="0;3;0" dur="1s" fill="freeze" begin="1.2s" />
              <animate attributeName="opacity" values="0;0.9;0" dur="1s" fill="freeze" begin="1.2s" />
            </circle>
            <circle cx="120" cy="35" r="0" fill="var(--accent)">
              <animate attributeName="r" values="0;2.5;0" dur="1s" fill="freeze" begin="1.4s" />
              <animate attributeName="opacity" values="0;0.8;0" dur="1s" fill="freeze" begin="1.4s" />
            </circle>
            <circle cx="55" cy="50" r="0" fill="var(--secondary)">
              <animate attributeName="r" values="0;2;0" dur="1s" fill="freeze" begin="1.5s" />
              <animate attributeName="opacity" values="0;0.7;0" dur="1s" fill="freeze" begin="1.5s" />
            </circle>
            <circle cx="115" cy="15" r="0" fill="var(--primary-lighter)">
              <animate attributeName="r" values="0;2;0" dur="0.9s" fill="freeze" begin="1.3s" />
              <animate attributeName="opacity" values="0;0.8;0" dur="0.9s" fill="freeze" begin="1.3s" />
            </circle>
          </g>
        )}
      </svg>
    </div>
  );
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
      <div className="slide-up" key={step} style={{ maxWidth: 400, width: "100%" }}>
        {step === "welcome" && (
          <>
            <GrowthAnimation />
            <h1 className="font-display gradient-text" style={{ fontSize: 40, fontWeight: 600, marginBottom: 8 }}>
              {APP_NAME}
            </h1>
            <p style={{ fontSize: 18, color: "var(--text-dim)", marginBottom: 40, lineHeight: 1.5 }}>
              {APP_TAGLINE}
            </p>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 48, lineHeight: 1.7, padding: "0 12px" }}>
              Track your goals, journal your journey, and watch yourself grow — one day at a time.
            </p>
            <button className="btn btn-primary" onClick={next} style={{ width: "100%", padding: "16px 24px", fontSize: 16, borderRadius: "var(--radius-lg)" }}>
              Get Started
            </button>
          </>
        )}

        {step === "name" && (
          <>
            <div className="pop-in" style={{ fontSize: 44, marginBottom: 12 }}>{"\u{1F44B}"}</div>
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
                padding: "16px 20px",
                fontSize: 18,
                fontWeight: 500,
                borderRadius: "var(--radius-lg)",
                border: "2px solid var(--surface-border)",
                background: "var(--bg-card)",
                color: "var(--text)",
                outline: "none",
                marginBottom: 32,
                fontFamily: "var(--font-sans)",
                transition: "all 0.3s var(--smooth)",
                textAlign: "center",
              }}
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
            <div className="pop-in" style={{ fontSize: 44, marginBottom: 12 }}>{"\u{1F3AF}"}</div>
            <h2 className="font-display" style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
              What are you working on?
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-dim)", marginBottom: 24 }}>
              Choose areas you want to focus on. You can change these later.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 32 }}>
              {FOCUS_AREAS.map((area, i) => (
                <button
                  key={area.id}
                  className={`focus-chip ${focusAreas.includes(area.id) ? "selected" : ""}`}
                  onClick={() => toggleFocus(area.id)}
                  style={{ animationDelay: `${i * 50}ms` }}
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
            <div className="celebrate" style={{ fontSize: 56, marginBottom: 16, display: "inline-block" }}>{"\u{2728}"}</div>
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
