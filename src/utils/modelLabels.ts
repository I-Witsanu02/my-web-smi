import { ModelInfo } from '../api';
import { Language } from '../types';
import { modelLabel } from './modelLabel';

export const analysisSystemLabel = (language: Language) =>
  language === 'th'
    ? 'ระบบวิเคราะห์อายุกระดูก อายุ 1–18 ปี'
    : 'Bone-age analysis system, ages 1–18';

export const anatomyDetectorLabel = (language: Language) =>
  language === 'th'
    ? 'ตัวตรวจตำแหน่งกายวิภาค 9 จุด'
    : 'Nine-region anatomy detector';

export function publicModelLabel(model: ModelInfo, language: Language): string {
  return modelLabel(model.id,model.display_name);
}
