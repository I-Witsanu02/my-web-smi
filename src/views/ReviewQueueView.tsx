import React, { useState } from 'react';
import { PatientCase, Language } from '../types';
import { FeedbackItem } from '../api';

interface ReviewQueueViewProps {
  cases: PatientCase[];
  onSelectCase: (caseItem: PatientCase) => void;
  language: Language;
  feedbackItems: FeedbackItem[];
  onFeedbackStatus: (feedbackId: string, status: FeedbackItem['status']) => void | Promise<void>;
  onExportApproved: () => void | Promise<void>;
}

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({
  cases,
  onSelectCase,
  language,
  feedbackItems,
  onFeedbackStatus,
  onExportApproved,
}) => {
  const [filterReason, setFilterReason] = useState('All Reasons');

  const pendingCases = cases.filter(
    (c) => c.status === 'Review Required' || c.status === 'Review Req' || c.status === 'Draft'
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-headline-md text-2xl md:text-3xl text-[#1a1b21] font-bold">
              {language === 'th' ? 'คิวรอการตรวจสอบ (Review Queue)' : 'Review Queue'}
            </h2>
            <span className="bg-[#ba1a1a] text-white px-2.5 py-0.5 rounded-full text-xs font-bold font-data-mono">
              {pendingCases.length} {language === 'th' ? 'เคส' : 'pending'}
            </span>
          </div>
          <p className="font-body-md text-sm text-[#434752] mt-0.5">
            {language === 'th'
              ? 'เคสที่ต้องการการยืนยัน ROI หรือการตรวจทานผล XAI จากรังสีแพทย์'
              : 'Cases flagged for automated ROI boundary adjustments or outlier uncertainty.'}
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={filterReason}
            onChange={(e) => setFilterReason(e.target.value)}
            className="bg-white border border-[#c3c6d4] rounded-lg px-3 py-2 text-xs font-label-caps text-[#1a1b21] focus:border-[#002e6f] focus:outline-none"
          >
            <option value="All Reasons">{language === 'th' ? 'ทุกเหตุผล' : 'All Reasons'}</option>
            <option value="ROI Boundary Check">{language === 'th' ? 'ตรวจขอบเขต ROI' : 'ROI Boundary Check'}</option>
            <option value="Advanced Offset (> 2 SD)">{language === 'th' ? 'อายุกระดูกเร็วกว่าเกณฑ์' : 'Advanced Offset (> 2 SD)'}</option>
            <option value="Low Contrast Radiograph">{language === 'th' ? 'ภาพรังสีคอนทราสต์ต่ำ' : 'Low Contrast Radiograph'}</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-[#c3c6d4]/40 overflow-hidden">
        <div className="p-5 border-b border-[#c3c6d4]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#002e6f]">Feedback Dataset</h3>
            <p className="text-xs text-[#434752] mt-1">
              {language === 'th' ? 'คำตอบแพทย์ถูกเก็บเป็น revision และต้องอนุมัติก่อนนำไปสร้างชุดฝึก' : 'Expert labels are revisioned and require approval before training use.'}
            </p>
          </div>
          <button onClick={onExportApproved} className="px-4 py-2 bg-[#006a63] text-white rounded-lg text-xs font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">download</span>
            {language === 'th' ? 'ส่งออกที่อนุมัติแล้ว' : 'Export approved CSV'}
          </button>
        </div>
        <div className="divide-y divide-[#c3c6d4]/30">
          {feedbackItems.length === 0 && <p className="p-5 text-sm text-[#737784]">{language === 'th' ? 'ยังไม่มีข้อมูล Feedback' : 'No feedback records yet.'}</p>}
          {feedbackItems.map((item) => (
            <div key={item.id} className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-data-mono font-bold text-[#002e6f]">{item.case_id}</span>
                  <span className="text-[10px] rounded px-2 py-0.5 bg-[#ededf5]">revision {item.revision}</span>
                  <span className={`text-[10px] rounded px-2 py-0.5 font-bold ${item.status === 'approved' ? 'bg-[#9deee5] text-[#005049]' : item.status === 'rejected' || item.status === 'blocked_locked_test' ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#ffebc4] text-[#784d00]'}`}>{item.status}</span>
                </div>
                <p className="text-xs text-[#434752]">
                  AI {item.payload.raw_prediction_months.toFixed(1)} เดือน • {language === 'th' ? 'แพทย์' : 'Expert'} {item.payload.expert_bone_age_months.toFixed(1)} เดือน • |error| {item.payload.absolute_error_vs_expert_months.toFixed(1)} เดือน
                </p>
              </div>
              <div className="flex gap-2">
                <button disabled={item.status === 'blocked_locked_test'} onClick={() => onFeedbackStatus(item.id, 'approved')} className="px-3 py-1.5 rounded-lg bg-[#006a63] disabled:bg-[#aeb7b7] text-white text-xs font-bold">{language === 'th' ? 'อนุมัติใช้ฝึก' : 'Approve'}</button>
                <button onClick={() => onFeedbackStatus(item.id, 'rejected')} className="px-3 py-1.5 rounded-lg border border-[#ba1a1a] text-[#93000a] text-xs font-bold">{language === 'th' ? 'ไม่นำไปใช้' : 'Reject'}</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Queue List */}
      <div className="bg-white rounded-xl shadow-xs border border-[#c3c6d4]/40 overflow-hidden divide-y divide-[#c3c6d4]/30">
        {pendingCases.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelectCase(c)}
            className="p-5 hover:bg-[#f4f7fb] transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#ffdad6] flex items-center justify-center text-[#93000a] shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-data-mono font-bold text-base text-[#002e6f]">
                    {c.id}
                  </span>
                  <span className="text-xs text-[#737784]">
                    ({c.name.first} {c.name.last})
                  </span>
                  <span className="bg-[#ba1a1a]/10 text-[#ba1a1a] font-label-caps text-[10px] px-2 py-0.5 rounded font-bold">
                    {language === 'th' ? 'ต้องทบทวน ROI' : 'ROI Review Needed'}
                  </span>
                </div>
                <div className="text-xs text-[#434752] flex flex-wrap gap-x-3 gap-y-1">
                  <span>{language === 'th' ? 'อายุ' : 'Age'}: {language === 'th' ? `${Math.floor(c.chronologicalAgeMonths / 12)} ปี ${Math.round(c.chronologicalAgeMonths % 12)} เดือน` : c.chronologicalAgeDisplay}</span>
                  <span>•</span>
                  <span>{language === 'th' ? 'เพศ' : 'Sex'}: {language === 'th' ? (c.sex === 'Male' ? 'ชาย' : 'หญิง') : c.sex}</span>
                  <span>•</span>
                  <span>{language === 'th' ? 'ข้อบ่งชี้' : 'Indication'}: {c.primaryIndication}</span>
                </div>
                <p className="text-xs text-[#737784] font-caption">
                  {language === 'th' ? 'เหตุผลที่ต้องทบทวน' : 'Flagged reason'}: {c.rois.filter((roi) => roi.status === 'flagged').map((roi) => roi.source === 'expert_review' ? `${roi.code} (${language === 'th' ? 'แพทย์แก้ไข' : 'expert reviewed'})` : `${roi.code} ${(roi.confidence * 100).toFixed(1)}%`).join(', ') || `${c.roisAccepted}/${c.roisTotal} ${language === 'th' ? 'ROI ที่ยอมรับ' : 'required ROIs accepted'}`}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end md:self-center">
              <div className="text-right text-xs font-data-mono text-[#737784]">
                <div>{c.updatedAt}</div>
                <div className="text-[11px] text-[#004e62]">{language === 'th' ? 'ขั้นตอน' : 'Step'}: {c.currentStep}</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCase(c);
                }}
                className="px-4 py-2 bg-[#002e6f] hover:bg-[#00439b] text-white rounded-lg font-label-caps text-xs font-bold transition-colors shadow-xs flex items-center gap-1"
              >
                <span>{language === 'th' ? 'ตรวจสอบ' : 'Review'}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
