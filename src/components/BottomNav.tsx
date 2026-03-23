"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { useState, useEffect } from "react";

function NavIcon({ icon, active }: { icon: string; active: boolean }) {
  const [wasJustActivated, setWasJustActivated] = useState(false);

  useEffect(() => {
    if (active) {
      setWasJustActivated(true);
      const t = setTimeout(() => setWasJustActivated(false), 600);
      return () => clearTimeout(t);
    }
  }, [active]);

  const baseColor = active ? "var(--primary)" : "var(--text-muted)";
  const fillColor = active ? "var(--primary-glow)" : "none";
  const strokeW = active ? 2.2 : 1.8;
  const aliveStyle: React.CSSProperties = {
    transition: "all 0.3s var(--spring)",
    transform: wasJustActivated ? "scale(1.2)" : "scale(1)",
    filter: active ? "drop-shadow(0 0 6px var(--primary-glow))" : "none",
  };

  switch (icon) {
    case "home":
      return (
        <div className="nav-icon-wrapper" style={aliveStyle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={fillColor} stroke={baseColor} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
            {active && <circle cx="12" cy="8" r="1.5" fill="var(--accent)" stroke="none" style={{ animation: "breathe 2s ease-in-out infinite" }} />}
          </svg>
        </div>
      );
    case "target":
      return (
        <div className="nav-icon-wrapper" style={aliveStyle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={baseColor} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" strokeDasharray={active ? "none" : "3 2"} />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" fill={active ? "var(--accent)" : "none"} stroke={active ? "var(--accent)" : baseColor}>
              {active && <animate attributeName="r" values="2;3;2" dur="1.5s" repeatCount="indefinite" />}
            </circle>
          </svg>
        </div>
      );
    case "pen":
      return (
        <div className="nav-icon-wrapper" style={aliveStyle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={baseColor} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" fill={fillColor} />
            {active && (
              <line x1="4" y1="20" x2="8" y2="20" stroke="var(--accent)" strokeWidth="2">
                <animate attributeName="x2" values="4;10;4" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
              </line>
            )}
          </svg>
        </div>
      );
    case "chart":
      return (
        <div className="nav-icon-wrapper" style={aliveStyle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={baseColor} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
            {active ? (
              <>
                <line x1="6" y1="20" x2="6" y2="14" stroke="var(--accent)">
                  <animate attributeName="y2" values="14;12;14" dur="1.5s" repeatCount="indefinite" />
                </line>
                <line x1="12" y1="20" x2="12" y2="4" stroke={baseColor}>
                  <animate attributeName="y2" values="4;6;4" dur="2s" repeatCount="indefinite" />
                </line>
                <line x1="18" y1="20" x2="18" y2="10" stroke="var(--secondary)">
                  <animate attributeName="y2" values="10;7;10" dur="1.8s" repeatCount="indefinite" />
                </line>
              </>
            ) : (
              <>
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </>
            )}
          </svg>
        </div>
      );
    default:
      return null;
  }
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav safe-area-bottom" role="navigation" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`nav-item ${active ? "active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <NavIcon icon={item.icon} active={active} />
            <span style={{
              transition: "all 0.3s var(--spring)",
              fontWeight: active ? 700 : 500,
              fontSize: active ? 11.5 : 11,
              letterSpacing: active ? "0.02em" : "normal",
              background: active ? "var(--gradient-primary)" : "none",
              WebkitBackgroundClip: active ? "text" : undefined,
              WebkitTextFillColor: active ? "transparent" : undefined,
              backgroundClip: active ? "text" : undefined,
              display: "inline-block",
            }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
