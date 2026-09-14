import React, { useState } from 'react';
import { PatientCase, Language } from '../types';

interface ChecklistViewProps {
  currentCase: PatientCase;
  onUpdateCase: (updated: Partial<PatientCase>) => void;
  onNavigateReport: () => void;
  onBack: () => void;
  language: Language;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  currentCase,
  onUpdateCase,
  onNavigateReport,
  onBack,
  language,
}) => {
  const [items, setItems] = useState([
    { id: 1, text: 'Patient Demographics & DOB verified with institutional records', done: true, critical: true },
    { id: 2, text: 'Left hand AP radiograph orientation and positioning verified', done: true, critical: true },
    { id: 3, text: 'Image contrast and exposure quality passed automated DICOM check', done: true, critical: false },
    { id: 4, text: 'All 9 key Region of Interest (ROI) boundaries inspected and approved', done: true, critical: true },
    { id: 5, text: 'Patient-specific Input × Gradient map and ROI-gate weights checked for biological plausibility', done: currentCase.xaiAcknowledged, critical: true },
    { id: 6, text: 'Skeletal age compared against Thai Department of Health (2020) reference', done: true, critical: false },
    { id: 7, text: 'Clinical indication and mid-parental height context reviewed', done: true, critical: false },
  ]);

  const toggleItem = (id: number) => {
    const updated = items.map((i) => (i.id === id ? { ...i, done: !i.done } : i));
    setItems(updated);
    const allDone = updated.every((i) => i.done);
    onUpdateCase({
      checklistComplete: allDone,
      currentStep: allDone ? 'Report' : 'Checklist',
      lastStep: 'Clinical Checklist',
    });
  };

  const allComplete = items.every((i) => i.done);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-28">
      {/* Header */}
      <div>
        <h2 className="font-headline-md text-2xl md:text-3xl text-[#1a1b21] font-bold">
          {language === 'th' ? 'รายการตรวจสอบความปลอดภัยทางคลินิก' : 'Clinical Safety Checklist'}
        </h2>
        <p className="font-body-md text-sm text-[#434752] mt-0.5">
          {language === 'th'
            ? 'ตรวจสอบความครบถ้วนและความถูกต้องก่อนอนุมัติรายงานผล'
            : 'Pre-finalization verification items required before signing clinical report.'}
        </p>
      </div>

      {/* Checklist Card */}
      <div className="bg-white rounded-xl shadow-xs border border-[#c3c6d4]/40 p-6 space-y-5">
        <div className="flex justify-between items-center border-b border-[#c3c6d4]/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#002e6f]">fact_check</span>
            <span className="font-headline-sm text-base font-bold text-[#002e6f]">
              Case {currentCase.id} Verification Items
            </span>
          </div>

          <span
            className={`font-label-caps text-xs font-bold px-3 py-1 rounded-full ${
              allComplete ? 'bg-[#9deee5] text-[#0c6f67]' : 'bg-[#ffebc4] text-[#784d00]'
            }`}
          >
            {items.filter((i) => i.done).length} / {items.length} Completed
          </span>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                item.done
                  ? 'border-[#006a63]/30 bg-[#9deee5]/10'
                  : 'border-[#c3c6d4]/40 hover:border-[#002e6f]/40 bg-[#f8f9ff]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center border ${
                    item.done
                      ? 'bg-[#006a63] border-[#006a63] text-white'
                      : 'border-[#c3c6d4] bg-white'
                  }`}
                >
                  {item.done && <span className="material-symbols-outlined text-sm">check</span>}
                </div>
                <span className={`text-sm ${item.done ? 'text-[#1a1b21] font-medium' : 'text-[#434752]'}`}>
                  {item.text}
                </span>
              </div>

              {item.critical && (
                <span className="font-label-caps text-[10px] bg-[#ba1a1a]/10 text-[#ba1a1a] px-2 py-0.5 rounded font-bold shrink-0 ml-2">
                  Critical
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Bottom Footer Bar */}
      <footer className="fixed bottom-0 left-0 md:left-[264px] right-0 h-16 z-30 flex items-center justify-between px-4 md:px-8 bg-white border-t border-[#c3c6d4]/50 shadow-xs">
        <div className="font-caption text-xs text-[#737784] hidden sm:block">
          Skeleton Bone Age Research MVP | Human Review Required
        </div>

        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <button
            onClick={onBack}
            className="font-label-caps text-xs bg-[#e2e2ea] text-[#1a1b21] font-bold rounded-lg px-5 py-2 hover:bg-[#c3c6d4] transition-all cursor-pointer"
          >
            {language === 'th' ? 'ย้อนกลับ' : 'Back'}
          </button>
          <button
            onClick={onNavigateReport}
            className="font-label-caps text-xs bg-[#002e6f] text-white font-bold rounded-lg px-6 py-2 hover:bg-[#00439b] transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-98"
          >
            <span className="material-symbols-outlined text-base">description</span>
            <span>{language === 'th' ? 'ไปยังหน้าจัดทำรายงาน' : 'Proceed to Report'}</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
