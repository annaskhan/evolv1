"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { useState, useEffect, useCallback } from "react";

function HomeIcon({ active, hovered, pressed }: { active: boolean; hovered: boolean; pressed: boolean }) {
  const color = active ? "var(--primary)" : hovered ? "var(--primary-light)" : "var(--text-muted)";
  const fill = active || hovered ? "rgba(234, 88, 12, 0.08)" : "none";

  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={active ? 2.3 : hovered ? 2.1 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      {/* House body */}
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      {/* Door */}
      <polyline points="9 22 9 12 15 12 15 22" />

      {active && (
        <>
          {/* Chimney smoke puffs */}
          <circle cx="17" cy="3" r="1" fill="var(--accent)" stroke="none" opacity="0">
            <animate attributeName="cy" values="5;-2" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.8;0" dur="2s" repeatCount="indefinite" />
            <animate attributeName="r" values="0.5;2;0.5" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="18.5" cy="2" r="0.8" fill="var(--primary-lighter)" stroke="none" opacity="0">
            <animate attributeName="cy" values="4;-3" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
            <animate attributeName="opacity" values="0;0.6;0" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
            <animate attributeName="r" values="0.3;1.8;0.3" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
          </circle>
          {/* Window glow */}
          <rect x="10.5" y="13.5" width="3" height="3" rx="0.5" fill="var(--secondary)" stroke="none">
            <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3s" repeatCount="indefinite" />
          </rect>
        </>
      )}

      {hovered && !active && (
        <>
          <rect x="10.5" y="13.5" width="3" height="3" rx="0.5" fill="var(--accent)" stroke="none" opacity="0">
            <animate attributeName="opacity" values="0;0.6;0.4" dur="0.4s" fill="freeze" repeatCount="1" />
          </rect>
        </>
      )}
    </svg>
  );
}

function GoalsIcon({ active, hovered, pressed }: { active: boolean; hovered: boolean; pressed: boolean }) {
  const color = active ? "var(--primary)" : hovered ? "var(--primary-light)" : "var(--text-muted)";

  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={active ? 2.3 : hovered ? 2.1 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      {/* Outer ring */}
      <circle cx="12" cy="12" r="10">
        {active && <animate attributeName="r" values="10;10.5;10" dur="2s" repeatCount="indefinite" />}
        {hovered && !active && <animate attributeName="r" values="10;11;10" dur="0.5s" repeatCount="1" />}
      </circle>
      {/* Middle ring */}
      <circle cx="12" cy="12" r="6">
        {active && <animate attributeName="r" values="6;5.5;6.5;6" dur="2s" repeatCount="indefinite" begin="0.3s" />}
      </circle>
      {/* Bullseye center */}
      <circle cx="12" cy="12" r={active ? 2.5 : 2} fill={active ? "var(--accent)" : hovered ? "var(--primary-lighter)" : "none"} stroke={active ? "var(--accent)" : color}>
        {active && (
          <>
            <animate attributeName="r" values="2.5;3.5;2.5" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="fill-opacity" values="1;0.6;1" dur="1.2s" repeatCount="indefinite" />
          </>
        )}
        {hovered && !active && <animate attributeName="r" values="2;3.5;2" dur="0.5s" repeatCount="1" />}
      </circle>

      {active && (
        <>
          {/* Arrow flying in and hitting bullseye */}
          <line x1="22" y1="2" x2="14" y2="10" stroke="var(--secondary)" strokeWidth="2">
            <animate attributeName="x1" values="24;14" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="y1" values="0;10" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="x2" values="20;12" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="y2" values="4;12" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;1;0" dur="0.8s" repeatCount="indefinite" keyTimes="0;0.3;0.8;1" />
          </line>
          {/* Impact ring */}
          <circle cx="12" cy="12" r="2" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0">
            <animate attributeName="r" values="2;8" dur="0.8s" repeatCount="indefinite" begin="0.6s" />
            <animate attributeName="opacity" values="0.8;0" dur="0.8s" repeatCount="indefinite" begin="0.6s" />
          </circle>
        </>
      )}

      {hovered && !active && (
        <>
          <line x1="20" y1="4" x2="14" y2="10" stroke="var(--accent)" strokeWidth="1.5" opacity="0">
            <animate attributeName="opacity" values="0;0.8;0" dur="0.6s" repeatCount="1" />
          </line>
        </>
      )}
    </svg>
  );
}

function JournalIcon({ active, hovered, pressed }: { active: boolean; hovered: boolean; pressed: boolean }) {
  const color = active ? "var(--primary)" : hovered ? "var(--primary-light)" : "var(--text-muted)";
  const fill = active || hovered ? "rgba(234, 88, 12, 0.06)" : "none";

  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={active ? 2.3 : hovered ? 2.1 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      {/* Pen body */}
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" fill={fill}>
        {active && (
          <>
            <animateTransform attributeName="transform" type="rotate" values="0 12 12;-2 12 12;2 12 12;0 12 12" dur="0.8s" repeatCount="indefinite" />
          </>
        )}
      </path>

      {/* Writing line that grows */}
      <path d="M12 20h9" />

      {active && (
        <>
          {/* Active writing line - pen writes continuously */}
          <line x1="4" y1="20" x2="4" y2="20" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
            <animate attributeName="x2" values="4;14;4" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2.5s" repeatCount="indefinite" />
          </line>
          {/* Second writing line */}
          <line x1="4" y1="17.5" x2="4" y2="17.5" stroke="var(--primary-lighter)" strokeWidth="1.5" strokeLinecap="round" opacity="0">
            <animate attributeName="x2" values="4;11;4" dur="2.5s" repeatCount="indefinite" begin="0.8s" />
            <animate attributeName="opacity" values="0;0.5;0" dur="2.5s" repeatCount="indefinite" begin="0.8s" />
          </line>
          {/* Sparkle at pen tip */}
          <circle cx="7" cy="19" r="0" fill="var(--secondary)" stroke="none">
            <animate attributeName="r" values="0;2;0" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.8;0" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="cx" values="5;10;5" dur="2.5s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      {hovered && !active && (
        <>
          <line x1="4" y1="20" x2="4" y2="20" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
            <animate attributeName="x2" values="4;12;12" dur="0.6s" fill="freeze" repeatCount="1" />
            <animate attributeName="opacity" values="0;0.8;0.5" dur="0.6s" fill="freeze" repeatCount="1" />
          </line>
        </>
      )}
    </svg>
  );
}

function ProgressIcon({ active, hovered, pressed }: { active: boolean; hovered: boolean; pressed: boolean }) {
  const color = active ? "var(--primary)" : hovered ? "var(--primary-light)" : "var(--text-muted)";

  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {active ? (
        <>
          {/* Bar 1 - bouncing */}
          <line x1="6" y1="20" x2="6" y2="14" stroke="var(--accent)" strokeWidth="3">
            <animate attributeName="y2" values="14;8;16;11;14" dur="1.8s" repeatCount="indefinite" />
          </line>
          {/* Bar 2 - bouncing offset */}
          <line x1="12" y1="20" x2="12" y2="4" stroke={color} strokeWidth="3">
            <animate attributeName="y2" values="4;10;6;12;4" dur="2s" repeatCount="indefinite" begin="0.2s" />
          </line>
          {/* Bar 3 - bouncing offset */}
          <line x1="18" y1="20" x2="18" y2="10" stroke="var(--secondary)" strokeWidth="3">
            <animate attributeName="y2" values="10;4;12;6;10" dur="1.6s" repeatCount="indefinite" begin="0.4s" />
          </line>
          {/* Sparkle on top of tallest bar */}
          <circle cx="12" cy="3" r="0" fill="var(--accent)" stroke="none">
            <animate attributeName="r" values="0;1.5;0" dur="2s" repeatCount="indefinite" begin="0.5s" />
            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.5s" />
            <animate attributeName="cy" values="4;10;6;12;4" dur="2s" repeatCount="indefinite" begin="0.7s" />
          </circle>
        </>
      ) : hovered ? (
        <>
          {/* Bars grow from bottom on hover */}
          <line x1="6" y1="20" x2="6" y2="20" stroke="var(--accent)" strokeWidth="2.8">
            <animate attributeName="y2" values="20;14" dur="0.35s" fill="freeze" />
          </line>
          <line x1="12" y1="20" x2="12" y2="20" stroke={color} strokeWidth="2.8">
            <animate attributeName="y2" values="20;4" dur="0.45s" fill="freeze" begin="0.05s" />
          </line>
          <line x1="18" y1="20" x2="18" y2="20" stroke="var(--secondary)" strokeWidth="2.8">
            <animate attributeName="y2" values="20;10" dur="0.4s" fill="freeze" begin="0.1s" />
          </line>
        </>
      ) : (
        <>
          <line x1="6" y1="20" x2="6" y2="14" stroke={color} strokeWidth="2" />
          <line x1="12" y1="20" x2="12" y2="4" stroke={color} strokeWidth="2" />
          <line x1="18" y1="20" x2="18" y2="10" stroke={color} strokeWidth="2" />
        </>
      )}
    </svg>
  );
}

function NavIcon({ icon, active, hovered, pressed }: { icon: string; active: boolean; hovered: boolean; pressed: boolean }) {
  const getScale = () => {
    if (pressed) return "scale(0.75)";
    if (hovered && !active) return "scale(1.12)";
    return "scale(1)";
  };

  const wrapperStyle: React.CSSProperties = {
    transition: pressed ? "all 0.1s ease" : "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
    transform: getScale(),
    filter: active
      ? "drop-shadow(0 2px 8px rgba(234, 88, 12, 0.35))"
      : hovered
        ? "drop-shadow(0 1px 4px rgba(234, 88, 12, 0.2))"
        : "none",
  };

  const props = { active, hovered, pressed };

  return (
    <div className="nav-icon-wrapper" style={wrapperStyle}>
      {icon === "home" && <HomeIcon {...props} />}
      {icon === "target" && <GoalsIcon {...props} />}
      {icon === "pen" && <JournalIcon {...props} />}
      {icon === "chart" && <ProgressIcon {...props} />}
    </div>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pressedId, setPressedId] = useState<string | null>(null);

  const handlePointerUp = useCallback(() => {
    setPressedId(null);
  }, []);

  useEffect(() => {
    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, [handlePointerUp]);

  return (
    <nav className="bottom-nav safe-area-bottom" role="navigation" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const hovered = hoveredId === item.id;
        const pressed = pressedId === item.id;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`nav-item ${active ? "active" : ""}`}
            aria-current={active ? "page" : undefined}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            onPointerDown={() => setPressedId(item.id)}
          >
            <NavIcon icon={item.icon} active={active} hovered={hovered} pressed={pressed} />
            <span style={{
              transition: pressed ? "all 0.1s ease" : "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              fontWeight: active ? 700 : hovered ? 600 : 500,
              fontSize: active ? 11.5 : 11,
              letterSpacing: active ? "0.02em" : "normal",
              color: active ? undefined : hovered ? "var(--primary-light)" : undefined,
              background: active ? "var(--gradient-primary)" : "none",
              WebkitBackgroundClip: active ? "text" : undefined,
              WebkitTextFillColor: active ? "transparent" : undefined,
              backgroundClip: active ? "text" : undefined,
              display: "inline-block",
              transform: pressed ? "scale(0.85)" : hovered && !active ? "translateY(-1px)" : "none",
            }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
