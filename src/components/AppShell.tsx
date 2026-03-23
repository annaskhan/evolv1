"use client";

import { useState, useEffect } from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import { getItem } from "@/lib/storage";
import ThemeProvider from "./ThemeProvider";
import BottomNav from "./BottomNav";
import Onboarding from "./Onboarding";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    setOnboarded(getItem(STORAGE_KEYS.ONBOARDED, false));
  }, []);

  // Show nothing while loading onboarding state to avoid flash
  if (onboarded === null) {
    return (
      <ThemeProvider>
        <div className="page-shell" />
      </ThemeProvider>
    );
  }

  if (!onboarded) {
    return (
      <ThemeProvider>
        <Onboarding onComplete={() => setOnboarded(true)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="page-shell">
        <div className="page-content">
          {children}
        </div>
        <BottomNav />
      </div>
    </ThemeProvider>
  );
}
