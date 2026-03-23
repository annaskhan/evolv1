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

function AnimatedGoalIcon({ hovered }: { hovered: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "all 0.3s var(--spring)" }}>
      <circle cx="12" cy="12" r="10" stroke="var(--primary)" strokeWidth="1.8" fill="rgba(108,60,224,0.08)">
        {hovered && <animate attributeName="r" values="10;11;10" dur="0.8s" repeatCount="1" />}
      </circle>
      <circle cx="12" cy="12" r="6" stroke="var(--primary-light)" strokeWidth="1.5" fill="none">
        {hovered && <animate attributeName="r" values="6;5;6" dur="0.8s" repeatCount="1" />}
      </circle>
      <circle cx="12" cy="12" r="2" fill="var(--accent)" stroke="none">
        {hovered && <animate attributeName="r" values="2;3;2" dur="0.6s" repeatCount="1" />}
      </circle>
    </svg>
  );
}

function AnimatedJournalIcon({ hovered }: { hovered: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "all 0.3s var(--spring)" }}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" fill="rgba(244,114,182,0.1)" />
      {hovered && (
        <line x1="4" y1="20" x2="10" y2="20" stroke="var(--accent-light)" strokeWidth="2">
          <animate attributeName="x2" values="4;12;4" dur="1s" repeatCount="1" />
        </line>
      )}
    </svg>
  );
}

function AnimatedProgressIcon({ hovered }: { hovered: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "all 0.3s var(--spring)" }}>
      {hovered ? (
        <>
          <line x1="6" y1="20" x2="6" y2="14" stroke="var(--accent)">
            <animate attributeName="y2" values="20;14" dur="0.3s" fill="freeze" />
          </line>
          <line x1="12" y1="20" x2="12" y2="4" stroke="var(--secondary)">
            <animate attributeName="y2" values="20;4" dur="0.4s" fill="freeze" />
          </line>
          <line x1="18" y1="20" x2="18" y2="10" stroke="var(--primary)">
            <animate attributeName="y2" values="20;10" dur="0.35s" fill="freeze" />
          </line>
        </>
      ) : (
        <>
          <line x1="6" y1="20" x2="6" y2="14" stroke="var(--secondary)" />
          <line x1="12" y1="20" x2="12" y2="4" stroke="var(--secondary)" />
          <line x1="18" y1="20" x2="18" y2="10" stroke="var(--secondary)" />
        </>
      )}
    </svg>
  );
}

function QuickActionCard({ href, icon, title, subtitle, gradientBg }: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gradientBg: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={href} style={{ textDecoration: "none" }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="card card-interactive card-gradient" style={{ padding: "20px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 52, height: 52, borderRadius: "var(--radius-md)",
          background: gradientBg, display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.35s var(--spring)",
          transform: hovered ? "scale(1.08) rotate(-3deg)" : "scale(1)",
          boxShadow: hovered ? "0 4px 16px rgba(108, 60, 224, 0.15)" : "none",
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "var(--text)" }}>{title}</h3>
          <p style={{ fontSize: 13, color: "var(--text-dim)", margin: "2px 0 0" }}>{subtitle}</p>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "all 0.3s var(--spring)", transform: hovered ? "translateX(3px)" : "translateX(0)" }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [name, setName] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [goalsHovered, setGoalsHovered] = useState(false);
  const [journalHovered, setJournalHovered] = useState(false);
  const [progressHovered, setProgressHovered] = useState(false);

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
            { value: activeGoals.length, label: "Active Goals", gradient: "var(--gradient-primary)", delay: "0ms" },
            { value: completedGoals.length, label: "Completed", gradient: "var(--gradient-accent)", delay: "100ms" },
            { value: thisWeekEntries.length, label: "This Week", gradient: "var(--gradient-warm)", delay: "200ms" },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{
              flex: 1, padding: "14px 16px", textAlign: "center",
              animation: `bounceIn 0.5s var(--spring) both`,
              animationDelay: stat.delay,
            }}>
              <p className="stat-number" style={{
                fontSize: 26, fontWeight: 800, margin: 0, animationDelay: stat.delay,
                background: stat.gradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>{stat.value}</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "4px 0 0", fontWeight: 500 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="stagger-children" style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
        <div onMouseEnter={() => setGoalsHovered(true)} onMouseLeave={() => setGoalsHovered(false)}>
          <QuickActionCard
            href="/goals"
            icon={<AnimatedGoalIcon hovered={goalsHovered} />}
            title="My Goals"
            subtitle={activeGoals.length > 0 ? `${activeGoals.length} active goal${activeGoals.length > 1 ? "s" : ""}` : "Set targets and track your progress"}
            gradientBg="var(--primary-glow)"
          />
        </div>
        <div onMouseEnter={() => setJournalHovered(true)} onMouseLeave={() => setJournalHovered(false)}>
          <QuickActionCard
            href="/journal"
            icon={<AnimatedJournalIcon hovered={journalHovered} />}
            title="Journal"
            subtitle={entries.length > 0 ? `${entries.length} entr${entries.length > 1 ? "ies" : "y"} so far` : "Reflect on your day and thoughts"}
            gradientBg="rgba(244, 114, 182, 0.1)"
          />
        </div>
        <div onMouseEnter={() => setProgressHovered(true)} onMouseLeave={() => setProgressHovered(false)}>
          <QuickActionCard
            href="/progress"
            icon={<AnimatedProgressIcon hovered={progressHovered} />}
            title="Progress"
            subtitle="See how far you\u2019ve come"
            gradientBg="rgba(245, 158, 11, 0.1)"
          />
        </div>
      </div>

      {/* Motivational card */}
      <div
        className="card quote-card slide-up blob-bg"
        style={{
          marginTop: 24, padding: "24px 20px",
          background: "var(--gradient-hero)",
          backgroundSize: "200% 200%",
          animation: "gradientShift 6s ease infinite, slideUp 0.5s var(--spring)",
          border: "none", color: "#ffffff",
          animationDelay: "0.3s",
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
          {"\u{2728}"} Daily Reminder
        </p>
        <p className="font-display" style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
          {getDailyQuote()}
        </p>
      </div>

      {/* App branding */}
      <div style={{ textAlign: "center", marginTop: 32, paddingBottom: 16 }}>
        <p className="gradient-text" style={{ fontSize: 12, margin: 0, fontWeight: 600 }}>
          {APP_NAME} — Small steps, lasting change
        </p>
      </div>
    </div>
  );
}
