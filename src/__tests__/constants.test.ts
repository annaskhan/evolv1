import { describe, it, expect } from "vitest";
import { LANGUAGES, isRTL } from "../lib/constants";

describe("LANGUAGES", () => {
  it("has 10 languages", () => {
    expect(LANGUAGES).toHaveLength(10);
  });

  it("each language has required fields", () => {
    for (const lang of LANGUAGES) {
      expect(lang.code).toBeTruthy();
      expect(lang.label).toBeTruthy();
      expect(lang.speechCode).toBeTruthy();
      expect(lang.deepgramCode).toBeTruthy();
    }
  });

  it("includes Arabic and English", () => {
    expect(LANGUAGES.find((l) => l.code === "Arabic")).toBeTruthy();
    expect(LANGUAGES.find((l) => l.code === "English")).toBeTruthy();
  });

  it("has unique codes", () => {
    const codes = LANGUAGES.map((l) => l.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe("isRTL", () => {
  it("returns true for Arabic", () => {
    expect(isRTL("Arabic")).toBe(true);
  });

  it("returns true for Urdu", () => {
    expect(isRTL("Urdu")).toBe(true);
  });

  it("returns false for English", () => {
    expect(isRTL("English")).toBe(false);
  });

  it("returns false for French", () => {
    expect(isRTL("French")).toBe(false);
  });
});
