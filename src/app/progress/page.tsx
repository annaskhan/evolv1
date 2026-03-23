"use client";

export default function ProgressPage() {
  return (
    <div style={{ padding: "0 20px" }}>
      <div style={{ padding: "20px 0 12px" }}>
        <h1 className="font-display" style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>
          Progress
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-dim)", margin: "4px 0 0" }}>
          See how far you{"'"}ve come
        </p>
      </div>

      {/* Empty state — will be built in Stage 3 */}
      <div
        className="card fade-in-up"
        style={{
          padding: "48px 24px",
          textAlign: "center",
          marginTop: 12,
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u{1F4C8}"}</div>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px", color: "var(--text)" }}>
          No data yet
        </h3>
        <p style={{ fontSize: 14, color: "var(--text-dim)", margin: "0 0 24px", lineHeight: 1.6 }}>
          Once you start logging goals and journal entries, your progress charts, weekly scores, and mood calendar will appear here.
        </p>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Coming soon</p>
      </div>
    </div>
  );
}
