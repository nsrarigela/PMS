// lib/holidays.js
// India — Gazetted Holidays 2026 (source: Govt. of India holiday calendar)
// type: "national" = the 3 holidays observed nationwide without exception
// type: "festival" = other gazetted religious/cultural holidays

export const HOLIDAYS_2026 = {
  "2026-01-01": { name: "New Year's Day", type: "festival" },
  "2026-01-26": { name: "Republic Day", type: "national" },
  "2026-03-04": { name: "Holi", type: "festival" },
  "2026-03-21": { name: "Id-ul-Fitr", type: "festival" },
  "2026-03-26": { name: "Ram Navami", type: "festival" },
  "2026-03-31": { name: "Mahavir Jayanti", type: "festival" },
  "2026-04-03": { name: "Good Friday", type: "festival" },
  "2026-05-01": { name: "Buddha Purnima", type: "festival" },
  "2026-05-27": { name: "Id-ul-Zuha (Bakrid)", type: "festival" },
  "2026-06-26": { name: "Muharram", type: "festival" },
  "2026-08-15": { name: "Independence Day", type: "national" },
  "2026-08-26": { name: "Id-e-Milad", type: "festival" },
  "2026-09-04": { name: "Janmashtami", type: "festival" },
  "2026-10-02": { name: "Gandhi Jayanti", type: "national" },
  "2026-10-20": { name: "Dussehra", type: "festival" },
  "2026-11-08": { name: "Diwali", type: "festival" },
  "2026-11-24": { name: "Guru Nanak Jayanti", type: "festival" },
  "2026-12-25": { name: "Christmas", type: "festival" },
};

export function getUpcomingHolidays(limit = 5) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const today = new Date(todayKey);

  return Object.entries(HOLIDAYS_2026)
    .filter(([date]) => date >= todayKey)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .slice(0, limit)
    .map(([date, info]) => {
      const daysUntil = Math.round((new Date(date) - today) / 86400000);
      return { date, ...info, daysUntil };
    });
}