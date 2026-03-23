"use client";

import { useState, useEffect } from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import { getItem, setItem } from "@/lib/storage";
import { type Mood, MOODS } from "@/lib/models";

const MOOD_COLORS: Record<Mood, string> = {
  great: "#10b981",
  good: "#8b5cf6",
  okay: "#f59e0b",
  low: "#f472b6",
  rough: "#ef4444",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function MoodCheckin() {
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState<Mood | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const checkins = getItem<Record<string, Mood>>(STORAGE_KEYS.MOOD_CHECKINS, {});
    // Only show if user hasn't checked in today
    if (!checkins[today]) {
      // Small delay so it doesn't flash immediately on load
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelect = (mood: Mood) => {
    setSelected(mood);
    const today = new Date().toISOString().split("T")[0];
    const checkins = getItem<Record<string, Mood>>(STORAGE_KEYS.MOOD_CHECKINS, {});
    checkins[today] = mood;
    setItem(STORAGE_KEYS.MOOD_CHECKINS, checkins);
    // Brief pause to show selection, then close
    setTimeout(() => dismiss(), 600);
  };

  const dismiss = () => {
    setClosing(true);
    setTimeout(() => setShow(false), 300);
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(8px)",
      animation: closing ? "fadeOut 0.3s ease forwards" : "fadeIn 0.3s ease",
      padding: 20,
    }}>
      <div style={{
        background: "var(--bg-card)",
        borderRadius: "var(--radius-xl)",
        padding: "32px 24px",
        maxWidth: 360, width: "100%",
        boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
        animation: closing ? "scaleOut 0.3s ease forwards" : "bounceIn 0.5s var(--spring)",
        textAlign: "center",
      }}>
        {/* Header */}
        <p style={{ fontSize: 40, margin: "0 0 8px", animation: "bounceIn 0.6s var(--spring) 0.1s both" }}>
          {"\u{1F31E}"}
        </p>
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px", color: "var(--text)" }}>
          {getGreeting()}!
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-dim)", margin: "0 0 24px" }}>
          How are you feeling today?
        </p>

        {/* Mood options */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 24 }}>
          {MOODS.map((mood, i) => {
            const isSelected = selected === mood.id;
            return (
              <button
                key={mood.id}
                onClick={() => handleSelect(mood.id)}
                disabled={selected !== null}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  padding: "12px 8px", minWidth: 56, border: "none", cursor: selected ? "default" : "pointer",
                  borderRadius: "var(--radius-md)",
                  background: isSelected ? `${MOOD_COLORS[mood.id]}20` : "var(--bg-secondary)",
                  transition: "all 0.3s var(--spring)",
                  transform: isSelected ? "scale(1.15)" : selected ? "scale(0.9)" : "scale(1)",
                  opacity: selected && !isSelected ? 0.4 : 1,
                  boxShadow: isSelected ? `0 4px 20px ${MOOD_COLORS[mood.id]}40` : "none",
                  animation: `bounceIn 0.4s var(--spring) ${0.15 + i * 0.06}s both`,
                }}
              >
                <span style={{
                  fontSize: 28,
                  transition: "transform 0.3s var(--spring)",
                  transform: isSelected ? "scale(1.3)" : "scale(1)",
                  display: "inline-block",
                }}>{mood.emoji}</span>
                <span style={{
                  fontSize: 11, fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? MOOD_COLORS[mood.id] : "var(--text-muted)",
                  transition: "all 0.2s",
                }}>{mood.label}</span>
              </button>
            );
          })}
        </div>

        {/* Selected confirmation */}
        {selected && (
          <p style={{
            fontSize: 14, color: MOOD_COLORS[selected], fontWeight: 600,
            margin: "0 0 8px", animation: "fadeIn 0.3s var(--smooth)",
          }}>
            {selected === "great" ? "Amazing! Keep it up! \u{2728}" :
             selected === "good" ? "That's wonderful! \u{1F60A}" :
             selected === "okay" ? "Every day is a step forward \u{1F4AA}" :
             selected === "low" ? "Tomorrow is a new day \u{1F49B}" :
             "You're not alone. Be gentle with yourself \u{2764}\u{FE0F}"}
          </p>
        )}

        {/* Skip */}
        {!selected && (
          <button onClick={dismiss}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 14, color: "var(--text-muted)", fontWeight: 500,
              padding: "8px 16px", transition: "all 0.2s",
            }}>
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
