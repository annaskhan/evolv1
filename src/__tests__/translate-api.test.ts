import { describe, it, expect } from "vitest";

// Test validation logic that mirrors what the API route does
const VALID_LANGUAGES = new Set([
  "Arabic", "English", "French", "Spanish", "Urdu",
  "Turkish", "Malay", "Indonesian", "Bengali", "Somali",
]);
const MAX_TEXT_LENGTH = 2000;

function validateTranslationInput(text: string, sourceLang: string, targetLang: string) {
  if (!text || !text.trim()) return { valid: false, error: "Empty text" };
  if (text.length > MAX_TEXT_LENGTH) return { valid: false, error: "Text too long" };
  if (!VALID_LANGUAGES.has(sourceLang)) return { valid: false, error: "Invalid source language" };
  if (!VALID_LANGUAGES.has(targetLang)) return { valid: false, error: "Invalid target language" };
  return { valid: true, error: null };
}

describe("Translation API validation", () => {
  it("rejects empty text", () => {
    const result = validateTranslationInput("", "Arabic", "English");
    expect(result.valid).toBe(false);
  });

  it("rejects whitespace-only text", () => {
    const result = validateTranslationInput("   ", "Arabic", "English");
    expect(result.valid).toBe(false);
  });

  it("rejects text over 2000 characters", () => {
    const longText = "a".repeat(2001);
    const result = validateTranslationInput(longText, "Arabic", "English");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Text too long");
  });

  it("accepts text at exactly 2000 characters", () => {
    const text = "a".repeat(2000);
    const result = validateTranslationInput(text, "Arabic", "English");
    expect(result.valid).toBe(true);
  });

  it("rejects invalid source language", () => {
    const result = validateTranslationInput("hello", "Klingon", "English");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid source language");
  });

  it("rejects invalid target language", () => {
    const result = validateTranslationInput("hello", "Arabic", "Elvish");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid target language");
  });

  it("accepts valid input", () => {
    const result = validateTranslationInput("مرحبا بالعالم", "Arabic", "English");
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it("validates all supported languages", () => {
    for (const lang of VALID_LANGUAGES) {
      const result = validateTranslationInput("test", lang, "English");
      expect(result.valid).toBe(true);
    }
  });

  it("prevents prompt injection via language field", () => {
    const result = validateTranslationInput("hello", "English; DROP TABLE", "Arabic");
    expect(result.valid).toBe(false);
  });
});
