"use client";

import { useState, useEffect, useCallback } from "react";

type MicPermissionState = "prompt" | "granted" | "denied" | "unsupported";

interface PermissionGateProps {
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
}

export function usePermissionCheck() {
  const [micPermission, setMicPermission] = useState<MicPermissionState>("prompt");

  useEffect(() => {
    if (!navigator.permissions) {
      setMicPermission("prompt");
      return;
    }

    navigator.permissions.query({ name: "microphone" as PermissionName }).then((result) => {
      setMicPermission(result.state as MicPermissionState);
      result.addEventListener("change", () => {
        setMicPermission(result.state as MicPermissionState);
      });
    }).catch(() => {
      setMicPermission("prompt");
    });
  }, []);

  return micPermission;
}

export function PermissionDeniedScreen({ onRetry }: { onRetry: () => void }) {
  const [showInstructions, setShowInstructions] = useState(false);

  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = typeof navigator !== "undefined" && /Android/.test(navigator.userAgent);

  return (
    <div className="flex flex-col items-center justify-center px-8 py-12 text-center fade-in">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: "rgba(194, 112, 112, 0.15)" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      </div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
        Microphone Access Required
      </h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, maxWidth: 320, marginBottom: 16 }}>
        LiveListen needs microphone access to hear and translate speech. Please enable it in your device settings.
      </p>

      <button
        onClick={() => setShowInstructions(!showInstructions)}
        className="text-sm font-medium mb-4"
        style={{ color: "var(--accent)", fontFamily: "var(--font-sans)" }}
      >
        {showInstructions ? "Hide instructions" : "How to enable"}
      </button>

      {showInstructions && (
        <div className="text-left rounded-xl p-4 mb-4" style={{ background: "var(--bg-card)", border: "1px solid var(--surface-border)", maxWidth: 320 }}>
          {isIOS ? (
            <ol className="space-y-2" style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-dim)", paddingLeft: 16 }}>
              <li>Open <strong>Settings</strong> on your device</li>
              <li>Scroll down and tap <strong>Safari</strong> (or your browser)</li>
              <li>Tap <strong>Microphone</strong></li>
              <li>Select <strong>Allow</strong></li>
              <li>Return here and tap &quot;Try Again&quot;</li>
            </ol>
          ) : isAndroid ? (
            <ol className="space-y-2" style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-dim)", paddingLeft: 16 }}>
              <li>Open <strong>Settings</strong> &gt; <strong>Apps</strong></li>
              <li>Find your browser (Chrome, etc.)</li>
              <li>Tap <strong>Permissions</strong> &gt; <strong>Microphone</strong></li>
              <li>Select <strong>Allow</strong></li>
              <li>Return here and tap &quot;Try Again&quot;</li>
            </ol>
          ) : (
            <ol className="space-y-2" style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-dim)", paddingLeft: 16 }}>
              <li>Click the lock/info icon in your browser&apos;s address bar</li>
              <li>Find <strong>Microphone</strong> in the permissions list</li>
              <li>Change it to <strong>Allow</strong></li>
              <li>Refresh the page</li>
            </ol>
          )}
        </div>
      )}

      <button
        onClick={onRetry}
        className="w-full max-w-xs py-3 rounded-2xl text-white font-medium"
        style={{ background: "var(--accent-gradient)", fontFamily: "var(--font-sans)", fontSize: 14 }}
      >
        Try Again
      </button>
    </div>
  );
}
