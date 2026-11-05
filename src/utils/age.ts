export const calculateAgeMonths = (birthDate: string, assessmentDate: string): number => {
  if (!birthDate || !assessmentDate) return 0;
  const [birthYear, birthMonth, birthDay] = birthDate.split('-').map(Number);
  const [assessmentYear, assessmentMonth, assessmentDay] = assessmentDate.split('-').map(Number);
  if (![birthYear, birthMonth, birthDay, assessmentYear, assessmentMonth, assessmentDay].every(Number.isFinite)) return 0;
  let months = (assessmentYear - birthYear) * 12 + assessmentMonth - birthMonth;
  if (assessmentDay < birthDay) months -= 1;
  return Math.max(0, months);
};

export const formatAge = (months: number, language: 'th' | 'en' = 'en'): string => {
  const safeMonths = Math.max(0, Math.floor(months));
  const years = Math.floor(safeMonths / 12);
  const remainder = safeMonths % 12;
  return language === 'th' ? `${years} ปี ${remainder} เดือน` : `${years}y ${remainder}m`;
};

/** Calendar age uses actual dates, not approximate days per month. */
export const formatCalendarAge = (birthDate: string, assessmentDate: string, language: 'th' | 'en' = 'th'): string => {
  const parse = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? date : null;
  };
  const birth = parse(birthDate), end = parse(assessmentDate);
  if (!birth || !end || end < birth) return '—';
  let months = (end.getUTCFullYear() - birth.getUTCFullYear()) * 12 + end.getUTCMonth() - birth.getUTCMonth();
  const anniversary = (count: number) => {
    const first = new Date(Date.UTC(birth.getUTCFullYear(), birth.getUTCMonth() + count, 1));
    const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
    return new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), Math.min(birth.getUTCDate(), lastDay)));
  };
  if (anniversary(months) > end) months--;
  const days = Math.round((end.getTime() - anniversary(months).getTime()) / 86400000);
  return language === 'th' ? `${Math.floor(months / 12)} ปี ${months % 12} เดือน ${days} วัน` : `${Math.floor(months / 12)}y ${months % 12}m ${days}d`;
};

/** Convert decimal months to a readable age using the mean Gregorian month.
 * This is an approximation for display only; it is not a clinical age calculation.
 */
export const formatAgeDetailed = (months: number, language: 'th' | 'en' = 'th'): string => {
  if (!Number.isFinite(months) || months < 0) return '—';
  const wholeMonths = Math.floor(months);
  const years = Math.floor(wholeMonths / 12);
  const monthsAfterYears = wholeMonths % 12;
  const days = Math.round((months - wholeMonths) * (365.2425 / 12));
  return language === 'th'
    ? `${years} ปี ${monthsAfterYears} เดือน ${days} วัน`
    : `${years}y ${monthsAfterYears}m ${days}d`;
};

export const localDateString = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
