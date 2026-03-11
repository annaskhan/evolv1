import { describe, it, expect, beforeEach } from "vitest";
import { loadSessions, saveSessions, saveSession, deleteSession, clearAllSessions, formatDate, formatTime, wordCount, exportSession, type SavedSession } from "../lib/sessions";
import { STORAGE_KEY } from "../lib/constants";

// Mock localStorage
const mockStorage: Record<string, string> = {};
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => { mockStorage[key] = value; },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { for (const key in mockStorage) delete mockStorage[key]; },
  },
});

const makeSession = (overrides: Partial<SavedSession> = {}): SavedSession => ({
  id: "1",
  date: "2026-03-11T10:00:00.000Z",
  sourceLang: "Arabic",
  targetLang: "English",
  original: "مرحبا",
  translation: "Hello",
  duration: 120,
  ...overrides,
});

describe("sessions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loadSessions returns empty array when no data", () => {
    expect(loadSessions()).toEqual([]);
  });

  it("loadSessions returns parsed sessions", () => {
    const sessions = [makeSession()];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    expect(loadSessions()).toEqual(sessions);
  });

  it("loadSessions handles malformed JSON", () => {
    localStorage.setItem(STORAGE_KEY, "not-json");
    expect(loadSessions()).toEqual([]);
  });

  it("saveSessions stores sessions in localStorage", () => {
    const sessions = [makeSession()];
    saveSessions(sessions);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(sessions);
  });

  it("saveSession prepends and limits to 50", () => {
    const sessions: SavedSession[] = [];
    for (let i = 0; i < 55; i++) {
      sessions.push(makeSession({ id: String(i) }));
    }
    saveSessions(sessions);

    saveSession(makeSession({ id: "new" }));
    const result = loadSessions();
    expect(result[0].id).toBe("new");
    expect(result.length).toBe(50);
  });

  it("deleteSession removes by id", () => {
    saveSessions([makeSession({ id: "a" }), makeSession({ id: "b" })]);
    deleteSession("a");
    const result = loadSessions();
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("b");
  });

  it("clearAllSessions removes all", () => {
    saveSessions([makeSession()]);
    clearAllSessions();
    expect(loadSessions()).toEqual([]);
  });
});

describe("formatTime", () => {
  it("formats 0 seconds", () => {
    expect(formatTime(0)).toBe("0:00");
  });

  it("formats minutes and seconds", () => {
    expect(formatTime(65)).toBe("1:05");
  });

  it("formats large durations", () => {
    expect(formatTime(3661)).toBe("61:01");
  });
});

describe("wordCount", () => {
  it("returns 0 for empty string", () => {
    expect(wordCount("")).toBe(0);
    expect(wordCount("   ")).toBe(0);
  });

  it("counts words correctly", () => {
    expect(wordCount("hello world")).toBe(2);
    expect(wordCount("one two three four")).toBe(4);
  });

  it("handles multiple spaces", () => {
    expect(wordCount("hello    world")).toBe(2);
  });
});

describe("formatDate", () => {
  it("formats ISO date string", () => {
    const result = formatDate("2026-03-11T10:00:00.000Z");
    expect(result).toContain("Mar");
    expect(result).toContain("11");
    expect(result).toContain("2026");
  });
});

describe("exportSession", () => {
  it("creates readable export text", () => {
    const session = makeSession();
    const text = exportSession(session);
    expect(text).toContain("Arabic");
    expect(text).toContain("English");
    expect(text).toContain("Hello");
    expect(text).toContain("مرحبا");
    expect(text).toContain("--- Original ---");
    expect(text).toContain("--- Translation ---");
  });
});
