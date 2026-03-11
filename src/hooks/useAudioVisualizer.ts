"use client";

import { useState, useEffect, useRef } from "react";

export function useAudioVisualizer(stream: MediaStream | null) {
  const [levels, setLevels] = useState<number[]>(new Array(24).fill(0));
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!stream) {
      setLevels(new Array(24).fill(0));
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.75;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    let cancelled = false;

    function tick() {
      if (cancelled) return;
      analyser.getByteFrequencyData(data);
      const bars: number[] = [];
      for (let i = 0; i < 24; i++) {
        bars.push(data[Math.floor((i / 24) * data.length)] / 255);
      }
      setLevels(bars);
      animRef.current = requestAnimationFrame(tick);
    }
    tick();
    return () => { cancelled = true; if (animRef.current) cancelAnimationFrame(animRef.current); ctx.close(); };
  }, [stream]);

  return levels;
}
