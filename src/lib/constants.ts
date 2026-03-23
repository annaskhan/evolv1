// ===== Evolv Constants =====

export const APP_NAME = "Evolv";
export const APP_TAGLINE = "Small steps, lasting change";

// Storage keys
export const STORAGE_KEYS = {
  THEME: "evolv_theme",
  ONBOARDED: "evolv_onboarded",
  USER_NAME: "evolv_user_name",
  FOCUS_AREAS: "evolv_focus_areas",
  GOALS: "evolv_goals",
  JOURNAL: "evolv_journal",
  SETTINGS: "evolv_settings",
} as const;

// Focus areas for onboarding and goals
export const FOCUS_AREAS = [
  { id: "spiritual", label: "Spiritual Growth", icon: "pray" },
  { id: "health", label: "Health & Fitness", icon: "heart" },
  { id: "mindfulness", label: "Mindfulness", icon: "brain" },
  { id: "career", label: "Career & Skills", icon: "briefcase" },
  { id: "relationships", label: "Relationships", icon: "users" },
  { id: "education", label: "Education", icon: "book" },
  { id: "habits", label: "Daily Habits", icon: "check-circle" },
  { id: "finance", label: "Financial Goals", icon: "wallet" },
] as const;

export type FocusAreaId = (typeof FOCUS_AREAS)[number]["id"];

// Navigation items
export const NAV_ITEMS = [
  { id: "home", label: "Home", href: "/", icon: "home" },
  { id: "goals", label: "Goals", href: "/goals", icon: "target" },
  { id: "journal", label: "Journal", href: "/journal", icon: "pen" },
  { id: "progress", label: "Progress", href: "/progress", icon: "chart" },
] as const;

// Theme options
export type Theme = "light" | "dark" | "system";

// Quote of the day categories (for later use)
export const QUOTE_CATEGORIES = [
  "motivation",
  "gratitude",
  "growth",
  "resilience",
  "faith",
] as const;
