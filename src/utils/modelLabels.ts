import { ModelInfo } from '../api';
import { Language } from '../types';

export const analysisSystemLabel = (language: Language) =>
  language === 'th'
    ? 'ระบบวิเคราะห์อายุกระดูก อายุ 1–18 ปี'
    : 'Bone-age analysis system, ages 1–18';

export const anatomyDetectorLabel = (language: Language) =>
  language === 'th'
    ? 'ตัวตรวจตำแหน่งกายวิภาค 9 จุด'
    : 'Nine-region anatomy detector';

export function publicModelLabel(model: ModelInfo, language: Language): string {
  const minimum = model.eligible_age_years?.[0];
  const maximum = model.eligible_age_years?.[1];
  const ageRange = minimum != null && maximum != null
    ? language === 'th' ? ` อายุ ${minimum}–${maximum} ปี` : `, ages ${minimum}–${maximum}`
    : '';

  if (model.status === 'legacy_not_served') {
    return language === 'th' ? 'รุ่นงานวิจัยที่เก็บถาวร — ไม่พร้อมใช้งาน' : 'Archived research version — unavailable';
  }
  if (model.status === 'reference') {
    return language === 'th' ? `รุ่นอ้างอิง${ageRange}` : `Reference analysis version${ageRange}`;
  }
  return language === 'th' ? `เวอร์ชันระบบวิเคราะห์${ageRange}` : `Analysis system version${ageRange}`;
}
