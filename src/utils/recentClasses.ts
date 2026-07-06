const STORAGE_KEY = 'yap:recentClasses';
const MAX_ENTRIES = 10;

interface RecentClassEntry {
  classId: string;
  visitedAt: string;
}

function readEntries(): RecentClassEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentClassEntry[];
  } catch {
    return [];
  }
}

export function recordClassVisit(classId: string): void {
  const entries = readEntries().filter((e) => e.classId !== classId);
  entries.unshift({ classId, visitedAt: new Date().toISOString() });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // localStorage kullanılamıyor (ör. gizli sekme); son sınıf takibi sessizce atlanır.
  }
}

export function getRecentClassIds(limit: number): string[] {
  return readEntries()
    .slice(0, limit)
    .map((e) => e.classId);
}
