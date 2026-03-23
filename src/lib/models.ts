// ===== Evolv Data Models =====

import type { FocusAreaId } from "./constants";

// ===== Goals =====
export interface GoalTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  focusArea: FocusAreaId;
  tasks: GoalTask[];
  createdAt: string; // ISO date
  targetDate: string; // ISO date
  completed: boolean;
}

// ===== Journal =====
export type Mood = "great" | "good" | "okay" | "low" | "rough";

export const MOODS: { id: Mood; label: string; emoji: string }[] = [
  { id: "great", label: "Great", emoji: "\u{1F929}" },
  { id: "good", label: "Good", emoji: "\u{1F60A}" },
  { id: "okay", label: "Okay", emoji: "\u{1F610}" },
  { id: "low", label: "Low", emoji: "\u{1F614}" },
  { id: "rough", label: "Rough", emoji: "\u{1F622}" },
];

export interface JournalEntry {
  id: string;
  date: string; // ISO date
  content: string;
  mood: Mood;
  focusAreas: FocusAreaId[];
  createdAt: string; // ISO datetime
}

// ===== Helpers =====
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
