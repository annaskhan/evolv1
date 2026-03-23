"use client";

export default function JournalPage() {
  return (
    <div style={{ padding: "0 20px" }}>
      <div style={{ padding: "20px 0 12px" }}>
        <h1 className="font-display" style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>
          Journal
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-dim)", margin: "4px 0 0" }}>
          Reflect, write, and grow
        </p>
      </div>

      {/* Empty state — will be built in Stage 2 */}
      <div
        className="card fade-in-up"
        style={{
          padding: "48px 24px",
          textAlign: "center",
          marginTop: 12,
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u{1F4DD}"}</div>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px", color: "var(--text)" }}>
          Your journal is empty
        </h3>
        <p style={{ fontSize: 14, color: "var(--text-dim)", margin: "0 0 24px", lineHeight: 1.6 }}>
          Capture your thoughts, feelings, and reflections. Add photos, voice notes, and more.
        </p>
        <button className="btn btn-primary" disabled style={{ opacity: 0.6 }}>
          + New Entry
        </button>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>Coming in the next update</p>
      </div>
    </div>
  );
}
