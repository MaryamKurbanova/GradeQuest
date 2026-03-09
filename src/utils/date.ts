const pad2 = (value: number): string => `${value}`.padStart(2, "0");

export const toDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

export const getTodayDateKey = (): string => {
  return toDateKey(new Date());
};

export const parseAppDateTime = (rawValue: string): Date | null => {
  const raw = rawValue.trim();
  if (!raw) {
    return null;
  }

  // Supports "YYYY-MM-DD HH:MM"
  const isoCandidate = raw.replace(" ", "T");
  const asIso = new Date(isoCandidate);
  if (!Number.isNaN(asIso.getTime())) {
    return asIso;
  }

  // Supports "YYYY-MM-DD HH:MM AM/PM"
  const amPmMatch = raw.match(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i,
  );
  if (amPmMatch) {
    const [, datePart, hhRaw, mmRaw, meridiemRaw] = amPmMatch;
    let hour = Number(hhRaw);
    const minute = Number(mmRaw);
    const meridiem = meridiemRaw.toUpperCase();

    if (meridiem === "PM" && hour < 12) {
      hour += 12;
    }
    if (meridiem === "AM" && hour === 12) {
      hour = 0;
    }

    const rebuilt = `${datePart}T${pad2(hour)}:${pad2(minute)}:00`;
    const parsed = new Date(rebuilt);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  const fallback = new Date(raw);
  if (!Number.isNaN(fallback.getTime())) {
    return fallback;
  }

  return null;
};

export const extractDateKey = (rawValue: string): string => {
  const parsed = parseAppDateTime(rawValue);
  if (!parsed) {
    return "";
  }
  return toDateKey(parsed);
};

export const formatShortDateLabel = (rawValue: string): string => {
  const parsed = parseAppDateTime(rawValue);
  if (!parsed) {
    return rawValue;
  }
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export const formatShortTimeLabel = (rawValue: string): string => {
  const parsed = parseAppDateTime(rawValue);
  if (!parsed) {
    return rawValue;
  }
  return parsed.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};

export const getRelativeDayLabel = (rawValue: string): string => {
  const parsed = parseAppDateTime(rawValue);
  if (!parsed) {
    return rawValue;
  }

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const targetKey = toDateKey(parsed);
  if (targetKey === toDateKey(today)) {
    return "Today";
  }
  if (targetKey === toDateKey(yesterday)) {
    return "Yesterday";
  }
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export const getStartOfWeek = (baseDate = new Date()): Date => {
  const weekStart = new Date(baseDate);
  const day = weekStart.getDay();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - day);
  return weekStart;
};

export const addDays = (baseDate: Date, days: number): Date => {
  const next = new Date(baseDate);
  next.setDate(next.getDate() + days);
  return next;
};
