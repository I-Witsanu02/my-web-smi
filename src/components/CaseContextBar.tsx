import React from 'react';
import { PatientCase, Language } from '../types';

interface CaseContextBarProps {
  currentCase: PatientCase;
  language: Language;
  onSwitchCase: () => void;
  onOpenRoiReview: () => void;
}

export const CaseContextBar: React.FC<CaseContextBarProps> = ({
  currentCase,
  language,
  onSwitchCase,
  onOpenRoiReview,
}) => {
  return (
    <div className="fixed top-16 left-0 md:left-[264px] right-0 h-12 z-30 flex items-center px-4 md:px-8 justify-between bg-[#f3f3fb] border-b border-[#c3c6d4]/50 shadow-2xs">
      <div className="flex items-center gap-3 md:gap-5 overflow-x-auto py-1 scrollbar-none">
        <span className="font-headline-sm text-sm md:text-base font-semibold text-[#1a1b21] whitespace-nowrap">
          {language === 'th' ? 'ข้อมูลเคสปัจจุบัน' : 'Case Context'}
        </span>

        <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-[#434752] whitespace-nowrap">
          <span className="font-data-mono bg-white border border-[#c3c6d4] px-2 py-0.5 rounded text-[#002e6f] font-bold">
            ID: {currentCase.id}
          </span>
          {currentCase.isTestCase && (
            <span className="font-label-caps bg-[#ffebc4] text-[#784d00] px-2 py-0.5 rounded font-bold">
              {language === 'th' ? 'เคสทดสอบ' : 'TEST CASE'}
            </span>
          )}
          <span className="hidden sm:inline w-1 h-1 rounded-full bg-[#c3c6d4]"></span>
          <span className="font-data-mono hidden sm:inline">
            {language === 'th'
              ? `${Math.floor(currentCase.chronologicalAgeMonths / 12)} ปี ${Math.round(currentCase.chronologicalAgeMonths % 12)} เดือน, ${currentCase.sex === 'Male' ? 'ชาย' : 'หญิง'}`
              : `${currentCase.chronologicalAgeDisplay}, ${currentCase.sex}`}
          </span>
          <span className="hidden md:inline w-1 h-1 rounded-full bg-[#c3c6d4]"></span>
          <span className="font-label-caps bg-[#e2e2ea] px-2 py-0.5 rounded text-[#006a63] hidden md:inline">
            {language === 'th' ? 'ขั้นตอน' : 'Step'}: {currentCase.currentStep}
          </span>
          <span className="hidden lg:inline w-1 h-1 rounded-full bg-[#c3c6d4]"></span>
          <span className="font-label-caps text-[#002e6f] hidden lg:inline">
            {language === 'th' ? 'สถานะ' : 'Status'}: {currentCase.status}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <button
          onClick={onOpenRoiReview}
          className="font-label-caps text-xs text-[#ba1a1a] bg-[#ffdad6] hover:bg-[#ffdad6]/80 px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[14px]">warning</span>
          <span className="hidden sm:inline">
            {language === 'th' ? 'ต้องตรวจสอบ ROI' : 'ROI Review Required'}
          </span>
          <span className="sm:hidden">ROI Alert</span>
        </button>

        <button
          onClick={onSwitchCase}
          className="font-label-caps text-xs text-[#006a63] font-bold hover:text-[#002e6f] transition-all border border-[#c3c6d4] hover:border-[#002e6f] px-2.5 py-1 rounded bg-white flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
          <span>{language === 'th' ? 'สลับเคส' : 'Switch Case'}</span>
        </button>
      </div>
    </div>
  );
};
