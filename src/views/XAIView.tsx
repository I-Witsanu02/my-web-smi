import React, { useState } from 'react';
import { PatientCase, Language } from '../types';
import { AuthenticatedImage } from '../components/AuthenticatedImage';

interface XAIViewProps {
  currentCase: PatientCase;
  onUpdateCase: (updated: Partial<PatientCase>) => void;
  onNavigateReport: () => void;
  onNavigateChecklist: () => void;
  onBack: () => void;
  language: Language;
}

export const XAIView: React.FC<XAIViewProps> = ({
  currentCase,
  onUpdateCase,
  onNavigateReport,
  onNavigateChecklist,
  onBack,
  language,
}) => {
  const [heatmapOpacity, setHeatmapOpacity] = useState(70);
  const [showRoiOverlays, setShowRoiOverlays] = useState(true);
  const [researchNotes, setResearchNotes] = useState('');
  const [isAcknowledged, setIsAcknowledged] = useState(currentCase.xaiAcknowledged);
  const activeHeatmapUrl = currentCase.xaiHeatmapUrl;
  const hasGeneratedXai = currentCase.xaiEvidenceStatus === 'generated' && Boolean(activeHeatmapUrl);
  const xaiMethod = currentCase.xaiMethod || 'ROI-gate-weighted SmoothGrad Input × Gradient';

  const handleAcknowledge = () => {
    setIsAcknowledged(true);
    onUpdateCase({ xaiAcknowledged: true, currentStep: 'XAI', lastStep: 'XAI Review' });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-md text-2xl md:text-3xl text-[#1a1b21] font-bold">
            {language === 'th'
              ? 'การตรวจสอบคำอธิบาย AI (Explainable AI Review)'
              : 'Explainable AI Review'}
          </h2>
          <p className="font-body-md text-sm text-[#434752] mt-0.5">
            {language === 'th'
              ? 'แผนผังความสนใจของโมเดล (Attribution Heatmap) และการวิเคราะห์การมีส่วนร่วมของแต่ละอวัยวะ'
              : 'Attribution Map & Regional Contribution Analysis'}
          </p>
        </div>

        {isAcknowledged && (
          <div className="bg-[#9deee5] text-[#0c6f67] px-4 py-2 rounded-lg font-label-caps text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{language === 'th' ? 'ยืนยันการตรวจ XAI แล้ว' : 'XAI Review Acknowledged'}</span>
          </div>
        )}
      </div>

      {!hasGeneratedXai && (
        <div className="bg-[#ffebc4] text-[#784d00] border border-[#784d00]/20 rounded-xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined">warning</span>
          <div>
            <div className="font-headline-sm text-sm font-bold">
              {language === 'th' ? 'ยังไม่มี XAI heatmap สำหรับเคสนี้' : 'No generated XAI heatmap for this case'}
            </div>
            <div className="font-caption text-xs mt-1">
              {language === 'th'
                ? 'ผล ROI gate และค่าน้ำหนักยังดูได้ แต่ระบบจะไม่แสดงภาพอ้างอิงของผู้ป่วยรายอื่นแทนผลจริง'
                : 'ROI gate weights remain available, but the app will not substitute another patient’s reference heatmap.'}
            </div>
          </div>
        </div>
      )}

      {/* XAI Controls Bar */}
      <div className="bg-white rounded-xl p-4 border border-[#c3c6d4]/40 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-label-caps text-xs text-[#737784] font-bold">{language === 'th' ? 'วิธีอธิบาย:' : 'Method:'}</span>
          <span className="bg-[#002e6f] text-white px-3 py-1 rounded-md text-xs font-bold">{xaiMethod}</span>
        </div>

        {/* Opacity Slider */}
        <div className="flex items-center gap-3 min-w-[220px]">
          <span className="font-label-caps text-xs text-[#737784] font-bold">
            {language === 'th' ? 'ความทึบของแผนที่ความสนใจ' : 'Heatmap Opacity'}: {heatmapOpacity}%
          </span>
          <input
            type="range"
            min="10"
            max="100"
            value={heatmapOpacity}
            onChange={(e) => setHeatmapOpacity(parseInt(e.target.value))}
            className="flex-1 accent-[#002e6f] cursor-pointer"
          />
        </div>

        {/* Overlay toggle */}
        <button
          onClick={() => setShowRoiOverlays(!showRoiOverlays)}
          className={`px-3 py-1.5 rounded-lg border font-label-caps text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            showRoiOverlays
              ? 'bg-[#006a63] text-white border-[#006a63]'
              : 'bg-[#ededf5] text-[#434752] border-[#c3c6d4]'
          }`}
        >
          <span className="material-symbols-outlined text-sm">grid_view</span>
          <span>ROI Boundaries</span>
        </button>
      </div>

      {/* Main Dual Viewer Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center Viewers (8 cols) */}
        <div className="lg:col-span-8 bg-[#05070a] rounded-xl border border-[#c3c6d4]/40 p-4 shadow-md flex flex-col items-center justify-center min-h-[540px] relative overflow-hidden select-none">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="bg-black/70 text-[#9deee5] font-data-mono text-xs px-2.5 py-1 rounded font-bold">
              {xaiMethod}
            </span>
            <span className="bg-black/70 text-white/70 font-data-mono text-xs px-2.5 py-1 rounded">
              {language === 'th' ? 'หลักฐานเฉพาะเคสสำหรับแพทย์ทบทวน' : 'Patient-specific evidence for clinical review'}
            </span>
          </div>

          {/* Main Stage with Layered Radiograph + Heatmap */}
          <div className="relative max-h-[480px] w-auto flex items-center justify-center">
            <AuthenticatedImage
              src={currentCase.xrayImageUrl}
              alt="Base Hand X-Ray"
              className="max-h-[460px] w-auto object-contain rounded-md"
              referrerPolicy="no-referrer"
            />
            {hasGeneratedXai && (
              <AuthenticatedImage
                src={activeHeatmapUrl}
                alt="Patient-specific attribution map"
                className="absolute inset-0 max-h-[460px] w-auto object-contain rounded-md pointer-events-none"
                style={{ opacity: heatmapOpacity / 100 }}
                referrerPolicy="no-referrer"
              />
            )}

            {/* ROI Boundaries */}
            {showRoiOverlays && (
              <div className="absolute inset-0 pointer-events-none">
                {currentCase.rois.filter((roi) => roi.status !== 'pending').map((roi) => (
                  <div
                    key={roi.id}
                    className="absolute border border-[#9deee5]/80 bg-[#006a63]/10 rounded-xs"
                    style={{
                      left: roi.bbox.left,
                      top: roi.bbox.top,
                      width: roi.bbox.width,
                      height: roi.bbox.height,
                    }}
                  >
                    <span className="absolute -top-4 left-0 bg-[#002e6f] text-[#9deee5] text-[9px] font-data-mono px-1 rounded font-bold">
                      {roi.name} ({((roi.xaiImportance ?? 0) * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Color Attribution Scale Bar */}
          <div className="w-full mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-white/80 text-xs font-data-mono">
            <span>{language === 'th' ? 'อิทธิพลต่ำ (0.0)' : 'Low Attribution (0.0)'}</span>
            <div className="flex-1 mx-4 h-3 rounded-full bg-gradient-to-r from-blue-600 via-emerald-400 via-yellow-400 to-red-600 shadow-inner"></div>
            <span>{language === 'th' ? 'อิทธิพลสูง (1.0)' : 'High Attribution (1.0)'}</span>
          </div>
        </div>

        {/* Right Panel: Safety & Regional Attribution (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Attention Safety Alert */}
          <div className="bg-[#9deee5]/20 border border-[#006a63]/30 rounded-xl p-4 shadow-xs">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#006a63] text-xl mt-0.5">
                verified
              </span>
              <div>
                <h4 className="font-headline-sm text-sm font-bold text-[#006a63]">
                  {language === 'th' ? 'การตรวจสอบความปลอดภัยของโมเดล' : 'Attention Safety Checked'}
                </h4>
                <p className="font-caption text-xs text-[#434752] mt-1 leading-relaxed">
                  {language === 'th'
                    ? 'แผนที่นี้คำนวณจากพิกเซลของเคสปัจจุบัน ผู้ทบทวนต้องตรวจว่าบริเวณเด่นสอดคล้องกับกายวิภาค และไม่ควรสรุปว่าไม่มี artifact โดยอัตโนมัติ'
                    : 'This map is calculated from the current case pixels. A reviewer must verify anatomical plausibility and artifact sensitivity.'}
                </p>
              </div>
            </div>
          </div>

          {/* Regional Contribution Breakdown */}
          <div className="bg-white rounded-xl p-5 border border-[#c3c6d4]/40 shadow-xs space-y-3">
            <h4 className="font-headline-sm text-sm font-bold text-[#1a1b21] border-b border-[#c3c6d4]/30 pb-2">
              {language === 'th' ? 'การมีส่วนร่วมของแต่ละส่วน' : 'Regional Attribution'}
            </h4>

            <div className="space-y-2.5">
              {currentCase.rois.map((roi) => (
                <div key={roi.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-label-caps">
                    <span className="text-[#1a1b21] font-bold">{roi.name}</span>
                    <span className="font-data-mono text-[#002e6f]">
                      {((roi.xaiImportance ?? 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#ededf5] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#002e6f]"
                      style={{ width: `${(roi.xaiImportance ?? 0) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Research Notes & Acknowledge */}
          <div className="bg-white rounded-xl p-5 border border-[#c3c6d4]/40 shadow-xs space-y-3">
            <label className="block font-headline-sm text-xs font-bold text-[#1a1b21]">
              {language === 'th' ? 'บันทึกการตรวจสอบ XAI' : 'Radiologist XAI Notes'}
            </label>
            <textarea
              value={researchNotes}
              onChange={(e) => setResearchNotes(e.target.value)}
              rows={3}
              className="w-full bg-[#f8f9ff] border border-[#c3c6d4] rounded-lg p-2.5 text-xs text-[#1a1b21] focus:border-[#002e6f] focus:outline-none resize-none font-body-md"
            />

            <button
              onClick={handleAcknowledge}
              disabled={!hasGeneratedXai}
              className="w-full py-2.5 bg-[#006a63] disabled:bg-[#aeb7b7] hover:bg-[#0c6f67] text-white rounded-lg font-label-caps text-xs font-bold transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">check</span>
              <span>{language === 'th' ? 'รับทราบและยืนยันผล XAI' : 'Acknowledge XAI Review'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Footer Bar */}
      <footer className="fixed bottom-0 left-0 md:left-[264px] right-0 h-16 z-30 flex items-center justify-between px-4 md:px-8 bg-white border-t border-[#c3c6d4]/50 shadow-xs">
        <div className="font-caption text-xs text-[#737784] hidden sm:block">
          {language === 'th' ? 'Skeleton Bone Age Research MVP | สีแสดงอิทธิพลต่อผลทำนาย ไม่ใช่ความมั่นใจของโมเดล' : 'Skeleton Bone Age Research MVP | Regional attribution, not confidence'}
        </div>

        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <button
            onClick={onBack}
            className="font-label-caps text-xs bg-[#e2e2ea] text-[#1a1b21] font-bold rounded-lg px-5 py-2 hover:bg-[#c3c6d4] transition-all cursor-pointer"
          >
            {language === 'th' ? 'ย้อนกลับ' : 'Back'}
          </button>
          <button
            onClick={onNavigateChecklist}
            className="font-label-caps text-xs bg-[#ededf5] text-[#002e6f] font-bold rounded-lg px-5 py-2 hover:bg-[#e2e2ea] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">fact_check</span>
            <span>{language === 'th' ? 'รายการตรวจสอบ' : 'Checklist'}</span>
          </button>
          <button
            onClick={onNavigateReport}
            className="font-label-caps text-xs bg-[#002e6f] text-white font-bold rounded-lg px-6 py-2 hover:bg-[#00439b] transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-98"
          >
            <span className="material-symbols-outlined text-base">description</span>
            <span>{language === 'th' ? 'จัดทำรายงานผล (Report)' : 'Generate Report'}</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
