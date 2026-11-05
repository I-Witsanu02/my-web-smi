import React, { useEffect, useState } from 'react';

export const maskDateDigits = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/');
};

export const parseDayMonthYear = (value: string): string | null => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return null;
  const [day, month, year] = value.split('/').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (year < 1900 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const displayDate = (iso: string) => /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('/') : '';

/** Locale-independent display; persistence always receives ISO dates. */
export const DayMonthYearInput: React.FC<{
  value: string;
  onChange: (iso: string) => void;
  onValidityChange?: (valid: boolean) => void;
  className?: string;
  required?: boolean;
}> = ({ value, onChange, onValidityChange, className, required = false }) => {
  const [draft, setDraft] = useState(displayDate(value));
  useEffect(() => { setDraft(displayDate(value)); }, [value]);
  const invalid = draft !== '' && parseDayMonthYear(draft) === null;
  return <div>
    <input type="text" inputMode="numeric" placeholder="dd/mm/yyyy" aria-label="Date dd/mm/yyyy (AD)" required={required}
      className={className} value={draft} aria-invalid={invalid}
      onChange={(event) => {
        const text = maskDateDigits(event.target.value);
        setDraft(text);
        const iso = parseDayMonthYear(text);
        onValidityChange?.(iso !== null || (!required && text === ''));
        event.target.setCustomValidity(text && !iso ? 'Enter a valid date in dd/mm/yyyy (AD)' : '');
        if (iso !== null || text === '') onChange(iso ?? '');
      }} />
    {invalid && <p className="text-xs text-red-700 mt-1">กรอกวันที่ให้ครบ dd/mm/yyyy (ค.ศ.)</p>}
  </div>;
};
