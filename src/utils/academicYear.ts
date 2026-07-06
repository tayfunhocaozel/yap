export function currentAcademicYear(date: Date = new Date()): string {
  const year = date.getFullYear();
  const isSecondHalf = date.getMonth() < 7; // Ocak-Temmuz -> önceki yılın güz döneminden devam
  const startYear = isSecondHalf ? year - 1 : year;
  return `${startYear}-${startYear + 1}`;
}
