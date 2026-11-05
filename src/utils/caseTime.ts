export function caseTime(value?: string): string {
  if (!value || Number.isNaN(Date.parse(value))) return '—';
  return new Intl.DateTimeFormat('th-TH', {timeZone:'Asia/Bangkok',day:'numeric',month:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value));
}
