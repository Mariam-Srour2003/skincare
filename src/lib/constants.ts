export const PRODUCT_CATEGORIES = [
  "CLEANSER",
  "SERUM",
  "MOISTURIZER",
  "SUNSCREEN",
  "TREATMENT",
  "TONER",
  "OTHER",
] as const;

export const TIME_OF_USE_OPTIONS = ["MORNING", "NIGHT", "BOTH"] as const;
export const ROUTINE_PERIODS = ["MORNING", "NIGHT"] as const;
export const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};
