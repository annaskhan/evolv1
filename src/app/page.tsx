"use client";

import { useEffect, useState } from "react";
import { APP_NAME, STORAGE_KEYS } from "@/lib/constants";
import { getItem } from "@/lib/storage";
import Link from "next/link";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function HomePage() {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(getItem(STORAGE_KEYS.USER_NAME, ""));
  }, []);

  return (
    <div style={{ padding: "0 20px" }}>
      {/* Header */}
      <div style={{ padding: "20px 0 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4, margin: 0 }}>
            {formatDate()}
          </p>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 600, margin: "4px 0 0" }}>
            {getGreeting()}{name ? `, ${name}` : ""}
          </h1>
        </div>
        <Link
          href="/settings"
          aria-label="Settings"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "var(--bg-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-dim)",
            textDecoration: "none",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="stagger-children" style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
        <Link href="/goals" style={{ textDecoration: "none" }}>
          <div className="card card-interactive" style={{ padding: "20px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: "var(--radius-md)",
              background: "var(--primary-glow)", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
            }}>
              {"\u{1F3AF}"}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "var(--text)" }}>My Goals</h3>
              <p style={{ fontSize: 13, color: "var(--text-dim)", margin: "2px 0 0" }}>Set targets and track your progress</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </Link>

        <Link href="/journal" style={{ textDecoration: "none" }}>
          <div className="card card-interactive" style={{ padding: "20px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: "var(--radius-md)",
              background: "rgba(181, 131, 141, 0.1)", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
            }}>
              {"\u{1F4DD}"}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "var(--text)" }}>Journal</h3>
              <p style={{ fontSize: 13, color: "var(--text-dim)", margin: "2px 0 0" }}>Reflect on your day and thoughts</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </Link>

        <Link href="/progress" style={{ textDecoration: "none" }}>
          <div className="card card-interactive" style={{ padding: "20px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: "var(--radius-md)",
              background: "rgba(233, 196, 106, 0.1)", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
            }}>
              {"\u{1F4C8}"}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "var(--text)" }}>Progress</h3>
              <p style={{ fontSize: 13, color: "var(--text-dim)", margin: "2px 0 0" }}>See how far you{"'"}ve come</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Motivational card */}
      <div
        className="card fade-in"
        style={{
          marginTop: 24,
          padding: "24px 20px",
          background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)",
          border: "none",
          color: "#ffffff",
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 600, opacity: 0.85, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>
          {"\u{1F331}"} Daily Reminder
        </p>
        <p className="font-display" style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
          {"Every expert was once a beginner. Keep showing up."}
        </p>
      </div>

      {/* App branding */}
      <div style={{ textAlign: "center", marginTop: 32, paddingBottom: 16 }}>
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
          {APP_NAME} — Small steps, lasting change
        </p>
      </div>
    </div>
  );
}
