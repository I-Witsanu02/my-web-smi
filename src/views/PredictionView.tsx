import React, { useState } from 'react';
import { PatientCase, Language } from '../types';
import { ModelInfo } from '../api';
import { publicModelLabel } from '../utils/modelLabels';
import { AuthenticatedImage } from '../components/AuthenticatedImage';

interface PredictionViewProps {
  currentCase: PatientCase;
  onNavigateXAI: () => void;
  onNavigateReport: () => void;
  onNavigateChecklist: () => void;
  onBack: () => void;
  language: Language;
  models: ModelInfo[];
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  onRunPrediction: () => void | Promise<void>;
  isPredicting: boolean;
  predictionError: string;
  backendConnected: boolean;
  reviewedMonths: number | '';
  onReviewedMonthsChange: (months: number | '') => void;
  onSaveReview: () => void | Promise<void>;
  reviewSaved: boolean;
  feedbackStatus: string;
}

export const PredictionView: React.FC<PredictionViewProps> = ({
  currentCase,
  onNavigateXAI,
  onNavigateReport,
  onNavigateChecklist,
  onBack,
  language,
  models,
  selectedModelId,
  onModelChange,
  onRunPrediction,
  isPredicting,
  predictionError,
  backendConnected,
  reviewedMonths,
  onReviewedMonthsChange,
  onSaveReview,
  reviewSaved,
  feedbackStatus,
}) => {
  const [reviewUnit, setReviewUnit] = useState<'months' | 'years'>('months');
  const reviewDisplayValue = reviewedMonths === '' ? '' : reviewUnit === 'years' ? Number((reviewedMonths / 12).toFixed(2)) : reviewedMonths;
  const ageText = (months: number) => {
    const years = Math.floor(months / 12);
    const remaining = Number((months - years * 12).toFixed(1));
    return language === 'th' ? `${years} ปี ${remaining} เดือน` : `${years}y ${remaining}m`;
  };
  const comparisonAgeMonths = currentCase.reviewedPredictedAgeMonths
    ?? (currentCase.isTestCase && currentCase.groundTruthBoneAgeMonths != null
      ? currentCase.groundTruthBoneAgeMonths
      : currentCase.chronologicalAgeMonths);
  const comparisonOffset = Number((currentCase.predictedAgeMonths - comparisonAgeMonths).toFixed(1));
  const comparisonOffsetType = Math.abs(comparisonOffset) < 3 ? 'Normal' : comparisonOffset > 0 ? 'Advanced' : 'Delayed';
  const comparisonLabel = currentCase.reviewedPredictedAgeMonths != null
    ? (language === 'th' ? 'อายุกระดูกที่แพทย์ยืนยัน' : 'Expert-reviewed bone age')
    : currentCase.isTestCase
      ? (language === 'th' ? 'อายุกระดูกจริง' : 'Ground truth')
      : (language === 'th' ? 'อายุจริง' : 'Chronological age');
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-md text-2xl md:text-3xl text-[#1a1b21] font-bold">
            {language === 'th'
              ? 'ผลการประเมินอายุกระดูก (Prediction Dashboard)'
              : 'Prediction Dashboard'}
          </h2>
          <p className="font-body-md text-sm text-[#434752] mt-0.5">
            {language === 'th'
              ? 'สรุปผลการประเมินวุฒิภาวะของกระดูกด้วยโมเดลวิจัยโครงข่ายประสาทเทียม'
              : 'Skeletal Maturity Assessment Result & Model Inferences'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onNavigateXAI}
            className="bg-[#002e6f] hover:bg-[#00439b] text-white px-4 py-2.5 rounded-lg font-label-caps text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
          >
            <span className="material-symbols-outlined text-base">visibility</span>
            <span>{language === 'th' ? 'ดูหลักฐาน AI (XAI)' : 'Explainable AI Evidence'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Results & Graphs (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Skeletal Maturity Result Card */}
          <div className="bg-white rounded-xl p-6 border border-[#c3c6d4]/40 shadow-xs space-y-6">
            <div className="flex justify-between items-start border-b border-[#c3c6d4]/30 pb-4">
              <div>
                <span className="font-label-caps text-xs text-[#737784] font-bold uppercase tracking-wider">
                  {language === 'th' ? 'ผลการประเมินหลัก' : 'Primary Assessment'}
                </span>
                <h3 className="font-headline-sm text-xl font-bold text-[#002e6f] mt-0.5">
                  {language === 'th'
                    ? 'วุฒิภาวะของโครงร่างกระดูก (Skeletal Maturity)'
                    : 'Skeletal Maturity'}
                </h3>
              </div>

              <span
                className={`px-3 py-1 rounded-full font-label-caps text-xs font-bold ${
                  comparisonOffsetType === 'Advanced'
                    ? 'bg-[#ffdad6] text-[#93000a]'
                    : comparisonOffsetType === 'Delayed'
                    ? 'bg-[#ffebc4] text-[#784d00]'
                    : 'bg-[#9deee5] text-[#0c6f67]'
                }`}
              >
                {comparisonOffsetType} ({comparisonOffset > 0 ? '+' : ''}{comparisonOffset} mo)
              </span>
            </div>

            {/* Big Numbers Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Chronological Age */}
              <div className="bg-[#f3f3fb] p-4 rounded-xl border border-[#c3c6d4]/50">
                <span className="font-label-caps text-xs text-[#737784] block font-bold">
                  {currentCase.reviewedPredictedAgeMonths != null
                    ? (language === 'th' ? 'อายุกระดูกที่แพทย์ยืนยัน' : 'Expert-reviewed Bone Age')
                    : currentCase.isTestCase
                    ? (language === 'th' ? 'อายุกระดูกจริงของภาพทดสอบ' : 'Ground-truth bone age')
                    : (language === 'th' ? 'อายุจริง (ตามสูติบัตร)' : 'Chronological Age')}
                </span>
                <div className="font-headline-lg text-2xl font-bold text-[#1a1b21] mt-1 font-data-mono">
                  {ageText(comparisonAgeMonths)}
                </div>
                <span className="font-data-mono text-xs text-[#434752]">
                  ({comparisonAgeMonths} {language === 'th' ? 'เดือน' : 'months'})
                </span>
              </div>

              {/* AI Predicted Skeletal Age */}
              <div className="bg-[#002e6f]/5 p-4 rounded-xl border border-[#002e6f]/30">
                <span className="font-label-caps text-xs text-[#002e6f] block font-bold">
                  {language === 'th' ? 'อายุกระดูก (AI ทำนาย)' : 'AI Predicted Bone Age'}
                </span>
                <div className="font-headline-lg text-2xl font-bold text-[#002e6f] mt-1 font-data-mono">
                  {ageText(currentCase.predictedAgeMonths)}
                </div>
                <span className="font-data-mono text-xs text-[#002e6f]">
                  ({currentCase.predictedAgeMonths} {language === 'th' ? 'เดือน' : 'months'})
                </span>
              </div>

              {/* Uncertainty / Confidence */}
              <div className="bg-[#9deee5]/20 p-4 rounded-xl border border-[#9deee5]">
                <span className="font-label-caps text-xs text-[#006a63] block font-bold">
                  {language === 'th' ? 'MAE ชุด Validation' : 'Validation MAE'}
                </span>
                <div className="font-headline-lg text-2xl font-bold text-[#0c6f67] mt-1 font-data-mono">
                  {currentCase.validationMaeMonths?.toFixed(2) ?? '—'} mo
                </div>
                <span className="font-data-mono text-xs text-[#006a63]">
                  {language === 'th' ? 'ค่าความคลาดเคลื่อนของชุดข้อมูล ไม่ใช่ช่วงความเชื่อมั่นรายบุคคล' : 'Dataset metric, not patient uncertainty'}
                </span>
              </div>
            </div>

            {/* Offset Gauge Comparison */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-label-caps">
                <span className="text-[#737784]">{comparisonLabel}: {comparisonAgeMonths}m</span>
                <span className="text-[#002e6f] font-bold">
                  {language === 'th' ? 'ผลต่าง' : 'Difference'}: {comparisonOffset > 0 ? `+${comparisonOffset}` : comparisonOffset} {language === 'th' ? 'เดือน' : 'months'}
                </span>
                <span className="text-[#737784]">{language === 'th' ? 'ค่าทำนาย' : 'Predicted'}: {currentCase.predictedAgeMonths}m</span>
              </div>

              <div className="relative w-full bg-[#ededf5] h-6 rounded-lg overflow-hidden flex items-center px-2">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#434752]/40 z-10"></div>
                {/* Visual marker */}
                <div
                  className="h-3.5 rounded bg-[#002e6f] transition-all"
                  style={{
                    marginLeft: '45%',
                    width: `${Math.min(Math.abs(comparisonOffset) * 5 + 20, 100)}px`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between text-[11px] font-caption text-[#737784]">
                <span>{language === 'th' ? '-24 เดือน (ช้ากว่า)' : '-24 mo (Delayed)'}</span>
                <span>{language === 'th' ? '0 เดือน (สอดคล้อง)' : '0 mo (Synchronous)'}</span>
                <span>{language === 'th' ? '+24 เดือน (เร็วกว่า)' : '+24 mo (Advanced)'}</span>
              </div>
            </div>
          </div>

          {/* Growth Context & Clinical Notes */}
          <div className="bg-white rounded-xl p-6 border border-[#c3c6d4]/40 shadow-xs space-y-4">
            <h3 className="font-headline-sm text-base font-bold text-[#1a1b21] flex items-center gap-2 border-b border-[#c3c6d4]/30 pb-3">
              <span className="material-symbols-outlined text-[#006a63]">analytics</span>
              <span>{language === 'th' ? 'บริบทการเจริญเติบโตทางคลินิก' : 'Clinical Growth Context'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-[#f8f9ff] rounded-lg border border-[#c3c6d4]/40">
                <span className="text-xs text-[#737784] block font-label-caps">{language === 'th' ? 'ส่วนสูง' : 'Height'}</span>
                <span className="font-data-mono font-bold text-sm text-[#1a1b21]">
                  {currentCase.heightCm} cm
                </span>
                <span className="text-[11px] text-[#434752] block mt-0.5">
                  {currentCase.heightPercentile}
                </span>
              </div>

              <div className="p-3 bg-[#f8f9ff] rounded-lg border border-[#c3c6d4]/40">
                <span className="text-xs text-[#737784] block font-label-caps">{language === 'th' ? 'น้ำหนักและ BMI' : 'Weight & BMI'}</span>
                <span className="font-data-mono font-bold text-sm text-[#1a1b21]">
                  {currentCase.weightKg} kg (BMI {currentCase.bmi})
                </span>
                <span className="text-[11px] text-[#434752] block mt-0.5">{language === 'th' ? 'ช่วงอ้างอิงทั่วไป' : 'General reference range'}</span>
              </div>

              <div className="p-3 bg-[#f8f9ff] rounded-lg border border-[#c3c6d4]/40">
                <span className="text-xs text-[#737784] block font-label-caps">{language === 'th' ? 'ส่วนสูงเป้าหมาย' : 'Target Height'}</span>
                <span className="font-data-mono font-bold text-sm text-[#1a1b21]">
                  {currentCase.midParentalHeightCm} cm
                </span>
                <span className="text-[11px] text-[#434752] block mt-0.5">{language === 'th' ? 'คำนวณจากส่วนสูงบิดามารดา' : 'Mid-parental calculation'}</span>
              </div>
            </div>

            <div className="p-4 bg-[#f3f3fb] rounded-lg border border-[#c3c6d4]/40">
              <span className="font-label-caps text-xs text-[#002e6f] font-bold block mb-1">
                {language === 'th' ? 'การแปลผลเบื้องต้น' : 'Interpretation'}
              </span>
              <p className="font-body-md text-xs text-[#434752] leading-relaxed">
                {language === 'th'
                  ? `อายุกระดูกที่ทำนายได้ (${currentCase.predictedAgeDisplay}) มีผลต่างจาก${comparisonLabel} ${comparisonOffset > 0 ? '+' : ''}${comparisonOffset} เดือน`
                  : `The predicted bone age (${currentCase.predictedAgeDisplay}) differs from ${comparisonLabel} by ${comparisonOffset > 0 ? '+' : ''}${comparisonOffset} months.`}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Research Provenance & Action (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl p-5 border border-[#00439b]/30 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#c3c6d4]/30 pb-3">
              <div>
                <h3 className="font-headline-sm text-base font-bold text-[#002e6f]">{language === 'th' ? 'การเชื่อมต่อโมเดลจริง' : 'Real Model Connection'}</h3>
                <p className="text-[11px] text-[#737784] mt-0.5">{language === 'th' ? 'ROI 9 จุด + เพศ • รองรับการทบทวนโดยผู้เชี่ยวชาญ' : '9 ROIs + sex • expert-review workflow'}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${backendConnected ? 'bg-[#9deee5] text-[#006a63]' : 'bg-[#ffdad6] text-[#93000a]'}`}>
                {backendConnected ? (language === 'th' ? 'เชื่อมต่อแล้ว' : 'CONNECTED') : (language === 'th' ? 'ออฟไลน์' : 'OFFLINE')}
              </span>
            </div>

            <label className="block text-xs font-bold text-[#434752]">
              {language === 'th' ? 'เวอร์ชันระบบวิเคราะห์' : 'Analysis system version'}
              <select
                value={selectedModelId}
                onChange={(event) => onModelChange(event.target.value)}
                className="mt-1.5 w-full border border-[#c3c6d4] rounded-lg px-3 py-2.5 bg-[#f8f9ff] text-[#1a1b21] font-data-mono text-xs"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id} disabled={model.status === 'legacy_not_served'}>
                    {publicModelLabel(model, language)}
                  </option>
                ))}
              </select>
            </label>

            <button
              onClick={onRunPrediction}
              disabled={!backendConnected || isPredicting}
              className="w-full py-2.5 bg-[#002e6f] disabled:bg-[#9aa5b8] text-white rounded-lg font-label-caps text-xs font-bold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">neurology</span>
              {isPredicting
                ? (language === 'th' ? 'กำลังโหลดโมเดลและคำนวณ...' : 'Loading model and predicting…')
                : (language === 'th' ? 'ประมวลผลเคสปัจจุบันอีกครั้ง' : 'Re-run current case')}
            </button>
            {predictionError && <p className="text-xs text-[#93000a] bg-[#ffdad6] rounded-lg p-2.5">{predictionError}</p>}

            <div className="pt-3 border-t border-[#c3c6d4]/30 space-y-2">
              <p className="text-xs font-bold text-[#1a1b21]">{language === 'th' ? 'อายุกระดูกที่ผู้เชี่ยวชาญทบทวน' : 'Expert-reviewed bone age'}</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max={reviewUnit === 'years' ? 20 : 240}
                  step="0.1"
                  value={reviewDisplayValue}
                  onChange={(event) => onReviewedMonthsChange(event.target.value === '' ? '' : Number(event.target.value) * (reviewUnit === 'years' ? 12 : 1))}
                  className="min-w-0 flex-1 border border-[#c3c6d4] rounded-lg px-3 py-2 font-data-mono text-sm"
                />
                <select value={reviewUnit} onChange={(event) => setReviewUnit(event.target.value as 'months' | 'years')} className="border border-[#c3c6d4] rounded-lg px-2 bg-white text-xs font-bold">
                  <option value="months">{language === 'th' ? 'เดือน' : 'months'}</option>
                  <option value="years">{language === 'th' ? 'ปี' : 'years'}</option>
                </select>
                <button
                  onClick={onSaveReview}
                  disabled={reviewedMonths === '' || currentCase.rawPredictedAgeMonths == null}
                  className="px-3 py-2 rounded-lg bg-[#006a63] disabled:bg-[#aeb7b7] text-white text-xs font-bold"
                >
                  {language === 'th' ? 'บันทึกผลทบทวน' : 'Save review'}
                </button>
              </div>
              {reviewedMonths !== '' && <p className="text-[11px] text-[#434752]">{ageText(Number(reviewedMonths))} ({Number(reviewedMonths).toFixed(1)} {language === 'th' ? 'เดือน' : 'months'})</p>}
              <p className="text-[11px] text-[#737784]">{language === 'th' ? 'ค่าดิบจากโมเดลจะไม่ถูกแก้ไข เพื่อให้ตรวจสอบย้อนหลังได้' : 'The raw model value remains unchanged for auditability.'}</p>
              {reviewSaved && <p className="text-xs font-bold text-[#006a63]">✓ {language === 'th' ? 'บันทึกผลทบทวนแยกจากค่าดิบแล้ว' : 'Expert review saved separately'}</p>}
              {reviewSaved && <div className="rounded-lg bg-[#e7f7f4] border border-[#79d7cd] p-2.5 text-[11px] text-[#005049]">
                <strong>{language === 'th' ? 'Feedback Dataset:' : 'Feedback Dataset:'}</strong>{' '}
                {feedbackStatus === 'blocked_locked_test'
                  ? (language === 'th' ? 'เก็บหลักฐานแล้ว แต่ปิดกั้นไม่ให้นำไปฝึกเพราะเป็น Locked Test' : 'Recorded, but blocked from training because this is a locked-test case.')
                  : (language === 'th' ? 'สร้าง candidate แล้ว ต้องผ่านการตรวจยืนยันอีกครั้งก่อนอนุมัติใช้ฝึก' : 'Candidate created; independent adjudication is required before training approval.')}
              </div>}
            </div>
          </div>

          {/* Provenance Card */}
          <div className="bg-white rounded-xl p-5 border border-[#c3c6d4]/40 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#c3c6d4]/30 pb-3">
              <span className="material-symbols-outlined text-[#002e6f]">science</span>
              <h3 className="font-headline-sm text-base font-bold text-[#1a1b21]">
                {language === 'th' ? 'ข้อมูลโมเดลและการทดลอง' : 'Research Provenance'}
              </h3>
            </div>

            <div className="space-y-3 font-data-mono text-xs">
              <div className="flex justify-between py-1 border-b border-[#c3c6d4]/20">
                <span className="text-[#737784]">Model ID:</span>
                <span className="text-[#002e6f] font-bold">{currentCase.modelDisplayName || currentCase.modelId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#c3c6d4]/20">
                <span className="text-[#737784]">Architecture:</span>
                <span className="text-[#1a1b21]">{currentCase.modelArchitecture}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#c3c6d4]/20">
                <span className="text-[#737784]">Preprocessing:</span>
                <span className="text-[#1a1b21]">{currentCase.preprocessingVersion}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#c3c6d4]/20">
                <span className="text-[#737784]">Experiment:</span>
                <span className="text-[#004e62] font-bold">{currentCase.experimentId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#c3c6d4]/20">
                <span className="text-[#737784]">Quality Check:</span>
                <span className="text-[#006a63] font-bold">✓ {currentCase.imageQualityCheck}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#737784]">ROIs Accepted:</span>
                <span className="text-[#1a1b21] font-bold">
                  {currentCase.roisAccepted} / {currentCase.roisTotal}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onNavigateChecklist}
                className="w-full py-2.5 px-3 bg-[#ededf5] hover:bg-[#e2e2ea] text-[#002e6f] rounded-lg font-label-caps text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">fact_check</span>
                <span>{language === 'th' ? 'รายการตรวจสอบความถูกต้อง' : 'Clinical Checklist'}</span>
              </button>
            </div>
          </div>

          {/* Quick Radiograph Preview Box */}
          <div className="bg-[#05070a] rounded-xl p-3 border border-[#c3c6d4]/40 shadow-xs flex flex-col items-center">
            <div className="text-white/60 font-data-mono text-[10px] uppercase mb-2">
              Assessed Radiograph
            </div>
            <AuthenticatedImage
              src={currentCase.xrayImageUrl}
              alt="Assessed Radiograph Preview"
              className="max-h-48 object-contain rounded-md"
              referrerPolicy="no-referrer"
            />
          </div>
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
            onClick={onNavigateXAI}
            className="font-label-caps text-xs bg-[#9deee5] text-[#0c6f67] font-bold rounded-lg px-5 py-2 hover:brightness-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">visibility</span>
            <span>{language === 'th' ? 'ดูคำอธิบาย AI (XAI)' : 'Explainable AI'}</span>
          </button>
          <button
            onClick={onNavigateReport}
            className="font-label-caps text-xs bg-[#002e6f] text-white font-bold rounded-lg px-6 py-2 hover:bg-[#00439b] transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-98"
          >
            <span className="material-symbols-outlined text-base">description</span>
            <span>{language === 'th' ? 'สร้างรายงานผล' : 'Generate Report Draft'}</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
