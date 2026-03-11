export interface LangOption {
  code: string;
  label: string;
  speechCode: string;
  deepgramCode: string;
}

export const LANGUAGES: LangOption[] = [
  { code: "Arabic", label: "Arabic", speechCode: "ar-SA", deepgramCode: "ar" },
  { code: "English", label: "English", speechCode: "en-US", deepgramCode: "en-US" },
  { code: "French", label: "Français", speechCode: "fr-FR", deepgramCode: "fr" },
  { code: "Spanish", label: "Español", speechCode: "es-ES", deepgramCode: "es" },
  { code: "Urdu", label: "Urdu", speechCode: "ur-PK", deepgramCode: "ur" },
  { code: "Turkish", label: "Türkçe", speechCode: "tr-TR", deepgramCode: "tr" },
  { code: "Malay", label: "Bahasa Melayu", speechCode: "ms-MY", deepgramCode: "ms" },
  { code: "Indonesian", label: "Indonesian", speechCode: "id-ID", deepgramCode: "id" },
  { code: "Bengali", label: "Bengali", speechCode: "bn-BD", deepgramCode: "bn" },
  { code: "Somali", label: "Soomaali", speechCode: "so-SO", deepgramCode: "so" },
];

export const isRTL = (code: string) => code === "Arabic" || code === "Urdu";

export const STORAGE_KEY = "livelisten_sessions";
export const ONBOARDING_KEY = "livelisten_onboarded";
export const CONSENT_KEY = "livelisten_consent";
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
