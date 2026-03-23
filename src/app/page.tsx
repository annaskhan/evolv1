"use client";

import { useEffect, useState } from "react";
import { APP_NAME, STORAGE_KEYS } from "@/lib/constants";
import { getItem } from "@/lib/storage";
import { type Goal, type JournalEntry } from "@/lib/models";
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

const QUOTES = [
  "Every expert was once a beginner. Keep showing up.",
  "Small daily improvements lead to staggering long-term results.",
  "The secret of getting ahead is getting started.",
  "Progress, not perfection.",
  "You don\u2019t have to be great to start, but you have to start to be great.",
  "Discipline is choosing between what you want now and what you want most.",
  "Growth is never by mere chance; it is the result of forces working together.",
];

function getDailyQuote(): string {
  const day = Math.floor(Date.now() / 86400000);
  return QUOTES[day % QUOTES.length];
}

export default function HomePage() {
  const [name, setName] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setName(getItem(STORAGE_KEYS.USER_NAME, ""));
    setGoals(getItem<Goal[]>(STORAGE_KEYS.GOALS, []));
    setEntries(getItem<JournalEntry[]>(STORAGE_KEYS.JOURNAL, []));
    setLoaded(true);
  }, []);

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);
  const thisWeekEntries = entries.filter((e) => {
    const diff = Date.now() - new Date(e.date).getTime();
    return diff < 7 * 86400000;
  });

  return (
    <div style={{ padding: "0 20px" }}>
      {/* Header */}
      <div className="greeting-text" style={{ padding: "20px 0 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
            {formatDate()}
          </p>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 600, margin: "4px 0 0" }}>
            {getGreeting()}{name ? <>, <span className="greeting-name">{name}</span></> : ""}
          </h1>
        </div>
        <Link
          href="/settings"
          aria-label="Settings"
          className="icon-btn settings-btn"
          style={{
            background: "var(--bg-secondary)",
            color: "var(--text-dim)", textDecoration: "none",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </Link>
      </div>

      {/* Stats row */}
      {loaded && (goals.length > 0 || entries.length > 0) && (
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {[
            { value: activeGoals.length, label: "Active Goals", color: "var(--primary)", delay: "0ms" },
            { value: completedGoals.length, label: "Completed", color: "var(--accent)", delay: "100ms" },
            { value: thisWeekEntries.length, label: "This Week", color: "var(--secondary)", delay: "200ms" },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{
              flex: 1, padding: "14px 16px", textAlign: "center",
              animation: `bounceIn 0.5s var(--spring) both`,
              animationDelay: stat.delay,
            }}>
              <p className="stat-number" style={{ fontSize: 24, fontWeight: 700, color: stat.color, margin: 0, animationDelay: stat.delay }}>{stat.value}</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="stagger-children" style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
        {[
          { href: "/goals", emoji: "\u{1F3AF}", bg: "var(--primary-glow)", title: "My Goals", subtitle: activeGoals.length > 0 ? `${activeGoals.length} active goal${activeGoals.length > 1 ? "s" : ""}` : "Set targets and track your progress" },
          { href: "/journal", emoji: "\u{1F4DD}", bg: "rgba(181, 131, 141, 0.1)", title: "Journal", subtitle: entries.length > 0 ? `${entries.length} entr${entries.length > 1 ? "ies" : "y"} so far` : "Reflect on your day and thoughts" },
          { href: "/progress", emoji: "\u{1F4C8}", bg: "rgba(233, 196, 106, 0.1)", title: "Progress", subtitle: "See how far you\u2019ve come" },
        ].map((item) => (
          <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
            <div className="card card-interactive" style={{ padding: "20px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: "var(--radius-md)",
                background: item.bg, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, transition: "transform 0.3s var(--spring)",
              }}>
                {item.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "var(--text)" }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-dim)", margin: "2px 0 0" }}>{item.subtitle}</p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.3s var(--smooth)" }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Motivational card */}
      <div
        className="card quote-card slide-up"
        style={{
          marginTop: 24, padding: "24px 20px",
          background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)",
          border: "none", color: "#ffffff",
          animationDelay: "0.3s",
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 600, opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>
          {"\u{1F331}"} Daily Reminder
        </p>
        <p className="font-display" style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
          {getDailyQuote()}
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
