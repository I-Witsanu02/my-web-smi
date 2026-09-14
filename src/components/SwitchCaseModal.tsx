import React from 'react';
import { PatientCase, Language } from '../types';

interface SwitchCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: PatientCase[];
  selectedCaseId: string;
  onSelectCase: (caseItem: PatientCase) => void;
  language: Language;
}

export const SwitchCaseModal: React.FC<SwitchCaseModalProps> = ({
  isOpen,
  onClose,
  cases,
  selectedCaseId,
  onSelectCase,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#c3c6d4]">
        {/* Header */}
        <div className="p-5 border-b border-[#c3c6d4]/40 flex justify-between items-center bg-[#f3f3fb]">
          <div>
            <h3 className="font-headline-sm text-lg text-[#002e6f] font-bold">
              {language === 'th' ? 'เลือกเคสผู้ป่วย' : 'Select Patient Case'}
            </h3>
            <p className="font-caption text-xs text-[#434752] mt-0.5">
              {language === 'th'
                ? 'เลือกเคสที่ต้องการตรวจสอบหรือประเมินต่อ'
                : 'Select an existing assessment case to review or continue evaluation'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#434752] hover:bg-[#ededf5] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Case List */}
        <div className="p-4 overflow-y-auto divide-y divide-[#c3c6d4]/30 space-y-2">
          {cases.map((c) => {
            const isSelected = c.id === selectedCaseId;
            return (
              <div
                key={c.id}
                onClick={() => {
                  onSelectCase(c);
                  onClose();
                }}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-[#002e6f] bg-[#002e6f]/5 ring-1 ring-[#002e6f]'
                    : 'border-[#c3c6d4]/40 hover:border-[#002e6f]/50 hover:bg-[#f4f7fb]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-data-mono font-bold text-[#002e6f] text-sm">
                      {c.id}
                    </span>
                    <span className="text-xs text-[#434752]">
                      ({c.name.first} {c.name.last})
                    </span>
                    {isSelected && (
                      <span className="bg-[#002e6f] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#434752] flex items-center gap-2">
                    <span>{c.chronologicalAgeDisplay} / {c.sex}</span>
                    <span>•</span>
                    <span>{c.primaryIndication}</span>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-label-caps ${
                      c.status === 'Complete' || c.status === 'Finalized'
                        ? 'bg-[#9deee5] text-[#0c6f67]'
                        : c.status === 'Review Required' || c.status === 'Review Req'
                        ? 'bg-[#ffdad6] text-[#93000a]'
                        : 'bg-[#e2e2ea] text-[#1a1b21]'
                    }`}
                  >
                    {c.status}
                  </span>
                  <div className="text-[11px] text-[#737784] font-data-mono">{c.updatedAt}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#c3c6d4]/40 bg-[#f8f9ff] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#ededf5] hover:bg-[#e2e2ea] text-[#1a1b21] rounded-lg font-label-caps text-xs transition-colors"
          >
            {language === 'th' ? 'ปิด' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
