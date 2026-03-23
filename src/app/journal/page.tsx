"use client";

import { useState, useEffect, useCallback } from "react";
import { STORAGE_KEYS, FOCUS_AREAS, type FocusAreaId } from "@/lib/constants";
import { getItem, setItem } from "@/lib/storage";
import { type JournalEntry, type Mood, MOODS, generateId } from "@/lib/models";

type View = "list" | "create" | "detail";

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function getMoodEmoji(mood: Mood): string {
  return MOODS.find((m) => m.id === mood)?.emoji ?? "";
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "...";
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [view, setView] = useState<View>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Create form state
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood>("good");
  const [focusAreas, setFocusAreas] = useState<FocusAreaId[]>([]);

  useEffect(() => {
    setEntries(getItem<JournalEntry[]>(STORAGE_KEYS.JOURNAL, []));
  }, []);

  const persist = useCallback((updated: JournalEntry[]) => {
    setEntries(updated);
    setItem(STORAGE_KEYS.JOURNAL, updated);
  }, []);

  const resetForm = () => {
    setContent(""); setMood("good"); setFocusAreas([]);
  };

  const handleCreate = () => {
    if (!content.trim()) return;
    const entry: JournalEntry = {
      id: generateId(),
      date: new Date().toISOString().split("T")[0],
      content: content.trim(),
      mood,
      focusAreas,
      createdAt: new Date().toISOString(),
    };
    persist([entry, ...entries]);
    resetForm();
    setView("list");
  };

  const toggleFocus = (id: FocusAreaId) => {
    setFocusAreas((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const deleteEntry = (entryId: string) => {
    if (!confirm("Delete this journal entry?")) return;
    persist(entries.filter((e) => e.id !== entryId));
    setView("list");
    setSelectedId(null);
  };

  const selectedEntry = entries.find((e) => e.id === selectedId);

  // ===== CREATE VIEW =====
  if (view === "create") {
    return (
      <div style={{ padding: "0 20px" }}>
        <div style={{ padding: "20px 0 12px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => { resetForm(); setView("list"); }} aria-label="Back"
            style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>New Entry</h1>
        </div>

        <div className="stagger-children" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Mood */}
          <div className="card" style={{ padding: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10, display: "block" }}>
              How are you feeling?
            </label>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
              {MOODS.map((m) => (
                <button key={m.id} onClick={() => setMood(m.id)}
                  style={{
                    flex: 1, padding: "12px 4px", borderRadius: "var(--radius-md)",
                    border: mood === m.id ? "2px solid var(--primary)" : "2px solid var(--surface-border)",
                    background: mood === m.id ? "var(--primary-glow)" : "var(--bg)",
                    cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  }}>
                  <span style={{ fontSize: 24 }}>{m.emoji}</span>
                  <span style={{ fontSize: 11, color: mood === m.id ? "var(--primary)" : "var(--text-muted)", fontWeight: 500 }}>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="card" style={{ padding: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {"What\u2019s on your mind?"}
            </label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="Write freely. This is your safe space..."
              autoFocus maxLength={5000} rows={8}
              style={{
                width: "100%", padding: "12px", fontSize: 15, borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--surface-border)", background: "var(--bg)", color: "var(--text)",
                outline: "none", marginTop: 6, fontFamily: "var(--font-sans)", resize: "vertical", lineHeight: 1.7,
              }} />
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "6px 0 0", textAlign: "right" }}>
              {content.length}/5000
            </p>
          </div>

          {/* Focus Areas (optional tags) */}
          <div className="card" style={{ padding: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "block" }}>
              Related to (optional)
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {FOCUS_AREAS.map((area) => (
                <button key={area.id} onClick={() => toggleFocus(area.id)}
                  className={`focus-chip ${focusAreas.includes(area.id) ? "selected" : ""}`}
                  style={{ fontSize: 12, padding: "6px 12px" }}>
                  {area.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button onClick={handleCreate} className="btn btn-primary" disabled={!content.trim()}
            style={{ width: "100%", padding: 14, fontSize: 16, marginBottom: 24 }}>
            Save Entry
          </button>
        </div>
      </div>
    );
  }

  // ===== DETAIL VIEW =====
  if (view === "detail" && selectedEntry) {
    return (
      <div style={{ padding: "0 20px" }}>
        <div style={{ padding: "20px 0 12px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => { setView("list"); setSelectedId(null); }} aria-label="Back"
            style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div style={{ flex: 1 }}>
            <h1 className="font-display" style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>
              {formatDateLong(selectedEntry.date)}
            </h1>
          </div>
          <button onClick={() => deleteEntry(selectedEntry.id)} aria-label="Delete entry"
            style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(193,87,78,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>

        <div className="stagger-children" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Mood */}
          <div className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 32 }}>{getMoodEmoji(selectedEntry.mood)}</span>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: 0 }}>
                Feeling {selectedEntry.mood}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
                {formatDateLong(selectedEntry.date)}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>
              {selectedEntry.content}
            </p>
          </div>

          {/* Focus areas */}
          {selectedEntry.focusAreas.length > 0 && (
            <div className="card" style={{ padding: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "block" }}>
                Related to
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {selectedEntry.focusAreas.map((id) => {
                  const area = FOCUS_AREAS.find((f) => f.id === id);
                  return (
                    <span key={id} style={{ fontSize: 13, background: "var(--primary-glow)", padding: "4px 12px", borderRadius: "var(--radius-xl)", color: "var(--primary)", fontWeight: 500 }}>
                      {area?.label ?? id}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div style={{ height: 24 }} />
      </div>
    );
  }

  // ===== LIST VIEW =====
  // Group entries by month
  const grouped = entries.reduce<Record<string, JournalEntry[]>>((acc, entry) => {
    const monthKey = new Date(entry.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(entry);
    return acc;
  }, {});

  return (
    <div style={{ padding: "0 20px" }}>
      <div style={{ padding: "20px 0 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>Journal</h1>
          <p style={{ fontSize: 14, color: "var(--text-dim)", margin: "4px 0 0" }}>Reflect, write, and grow</p>
        </div>
        <button onClick={() => setView("create")} className="btn btn-primary" style={{ padding: "10px 18px", fontSize: 14 }}>
          + New
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="card fade-in-up" style={{ padding: "48px 24px", textAlign: "center", marginTop: 12 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u{1F4DD}"}</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px", color: "var(--text)" }}>Your journal is empty</h3>
          <p style={{ fontSize: 14, color: "var(--text-dim)", margin: "0 0 24px", lineHeight: 1.6 }}>
            Capture your thoughts, feelings, and reflections. Writing helps you process and grow.
          </p>
          <button onClick={() => setView("create")} className="btn btn-primary">+ New Entry</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
          {Object.entries(grouped).map(([month, monthEntries]) => (
            <div key={month}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "16px 0 8px" }}>
                {month}
              </div>
              <div className="stagger-children" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {monthEntries.map((entry) => (
                  <button key={entry.id} onClick={() => { setSelectedId(entry.id); setView("detail"); }}
                    className="card card-interactive"
                    style={{ padding: 16, textAlign: "left", width: "100%", cursor: "pointer", border: "1px solid var(--surface-border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                      <span style={{ fontSize: 22 }}>{getMoodEmoji(entry.mood)}</span>
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                        {formatDateShort(entry.date)}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {entry.mood}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.5, margin: 0 }}>
                      {truncate(entry.content, 120)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ height: 24 }} />
    </div>
  );
}
