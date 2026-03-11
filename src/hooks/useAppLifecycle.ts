"use client";

import { useEffect, useRef } from "react";

interface LifecycleCallbacks {
  onPause?: () => void;
  onResume?: () => void;
}

export function useAppLifecycle({ onPause, onResume }: LifecycleCallbacks) {
  const callbacksRef = useRef({ onPause, onResume });
  callbacksRef.current = { onPause, onResume };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        callbacksRef.current.onPause?.();
      } else {
        callbacksRef.current.onResume?.();
      }
    };

    const handleBeforeUnload = () => {
      callbacksRef.current.onPause?.();
    };

    // Handle both web and native app lifecycle events
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Capacitor-specific lifecycle events
    document.addEventListener("pause", () => callbacksRef.current.onPause?.());
    document.addEventListener("resume", () => callbacksRef.current.onResume?.());

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
}
