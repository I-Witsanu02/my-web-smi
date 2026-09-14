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

export const localDateString = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
