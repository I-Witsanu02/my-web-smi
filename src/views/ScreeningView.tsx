import React, { useEffect, useState } from 'react';
import { PatientCase, Language } from '../types';
import { calculateAgeMonths, formatAge } from '../utils/age';

interface ScreeningViewProps {
  currentCase: PatientCase;
  onUpdateCase: (updated: Partial<PatientCase>) => void;
  onContinue: () => void;
  onBack: () => void;
  language: Language;
}

export const ScreeningView: React.FC<ScreeningViewProps> = ({
  currentCase,
  onUpdateCase,
  onContinue,
  onBack,
  language,
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [dob, setDob] = useState(currentCase.dob);
  const [measurementDate, setMeasurementDate] = useState(currentCase.measurementDate);
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other'>(currentCase.sex);
  const [growthStandard, setGrowthStandard] = useState(currentCase.growthStandard);
  const calculatedAgeMonths = calculateAgeMonths(dob, measurementDate);

  useEffect(() => {
    setDob(currentCase.dob);
    setMeasurementDate(currentCase.measurementDate);
    setSex(currentCase.sex);
    setGrowthStandard(currentCase.growthStandard);
  }, [currentCase.id, currentCase.dob, currentCase.measurementDate]);

  const updateDates = (nextDob: string, nextMeasurementDate: string) => {
    setDob(nextDob);
    setMeasurementDate(nextMeasurementDate);
    const months = calculateAgeMonths(nextDob, nextMeasurementDate);
    onUpdateCase({
      dob: nextDob,
      measurementDate: nextMeasurementDate,
      chronologicalAgeMonths: months,
      chronologicalAgeDisplay: formatAge(months, 'en'),
    });
  };

  const steps = [
    { id: 1, label: language === 'th' ? '1. ข้อมูลพื้นฐาน' : '1. Basic Info' },
    { id: 2, label: language === 'th' ? '2. การวัดร่างกาย' : '2. Measurements' },
    { id: 3, label: language === 'th' ? '3. ประวัติต่อเนื่อง' : '3. Longitudinal' },
    { id: 4, label: language === 'th' ? '4. บริบททางคลินิก' : '4. Clinical Context' },
    { id: 5, label: language === 'th' ? '5. วัยเจริญพันธุ์' : '5. Puberty' },
  ];

  const handleSave = () => {
    onUpdateCase({
      dob,
      measurementDate,
      chronologicalAgeMonths: calculatedAgeMonths,
      chronologicalAgeDisplay: formatAge(calculatedAgeMonths, 'en'),
      sex,
      growthStandard,
    });
  };

  const handleNext = () => {
    handleSave();
    onUpdateCase({ currentStep: 'Intake', lastStep: 'Screening' });
    onContinue();
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 pb-24">
      {/* Title & Info */}
      <div>
        <h1 className="font-headline-md text-2xl md:text-3xl text-[#1a1b21] font-bold mb-1">
          {language === 'th'
            ? 'การคัดกรองการเจริญเติบโตเบื้องต้น'
            : 'Preliminary Growth Screening'}
        </h1>
        <p className="font-body-md text-sm text-[#434752] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base text-[#004e62]">info</span>
          <span>{language === 'th' ? 'ข้อมูลสำหรับงานวิจัย - ต้องผ่านการตรวจสอบโดยแพทย์' : 'Research data - physician review required'}</span>
        </p>
      </div>

      {/* Stepper Header */}
      <div className="overflow-x-auto rounded-lg bg-white border border-[#c3c6d4]/50 p-1 shadow-2xs">
        <div className="flex min-w-[600px]">
          {steps.map((s) => {
            const isActive = activeStep === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveStep(s.id)}
                className={`flex-1 text-center py-2.5 px-3 rounded-md font-label-caps text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#00439b] text-white font-bold shadow-xs border border-[#002e6f]/30'
                    : 'text-[#434752] opacity-70 hover:opacity-100 hover:bg-[#ededf5]'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Demographics */}
        <div className="bg-white rounded-xl border border-[#c3c6d4]/40 p-6 shadow-xs space-y-5">
          <h3 className="font-headline-sm text-lg font-bold text-[#002e6f] flex items-center gap-2 border-b border-[#c3c6d4]/30 pb-3">
            <span className="material-symbols-outlined text-[#002e6f]">person</span>
            <span>{language === 'th' ? 'ข้อมูลประชากรศาสตร์' : 'Demographics'}</span>
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-label-caps text-xs text-[#434752] mb-1 font-bold">
                  {language === 'th' ? 'วันเดือนปีเกิด' : 'Date of Birth'}
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => updateDates(e.target.value, measurementDate)}
                  className="w-full bg-white border border-[#c3c6d4] rounded-md px-3 py-2 text-sm text-[#1a1b21] font-data-mono focus:border-[#002e6f] focus:ring-1 focus:ring-[#002e6f] outline-none"
                />
              </div>

              <div>
                <label className="block font-label-caps text-xs text-[#434752] mb-1 font-bold">
                  {language === 'th' ? 'วันที่ทำการวัด' : 'Measurement Date'}
                </label>
                <input
                  type="date"
                  value={measurementDate}
                  onChange={(e) => updateDates(dob, e.target.value)}
                  className="w-full bg-white border border-[#c3c6d4] rounded-md px-3 py-2 text-sm text-[#1a1b21] font-data-mono focus:border-[#002e6f] focus:ring-1 focus:ring-[#002e6f] outline-none"
                />
              </div>
            </div>

            {/* Calculated Age highlight box */}
            <div className="bg-[#f3f3fb] p-4 rounded-lg flex items-center justify-between border border-[#c3c6d4]/50">
              <span className="font-label-caps text-xs text-[#434752] font-bold">
                {language === 'th' ? 'คำนวณอายุจริง (Calculated Age)' : 'Calculated Age'}
              </span>
              <span className="font-data-mono text-[#002e6f] font-bold text-lg">
                {dob && measurementDate ? formatAge(calculatedAgeMonths, language) : '—'}
              </span>
            </div>

            {/* Sex assignment */}
            <div>
              <label className="block font-label-caps text-xs text-[#434752] mb-2 font-bold">
                {language === 'th' ? 'เพศกำเนิด (Sex assigned at birth)' : 'Sex assigned at birth'}
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sex"
                    checked={sex === 'Male'}
                    onChange={() => setSex('Male')}
                    className="text-[#002e6f] focus:ring-[#002e6f] h-4 w-4 border-[#c3c6d4]"
                  />
                  <span className="text-sm font-body-md text-[#1a1b21]">
                    {language === 'th' ? 'ชาย (Male)' : 'Male'}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sex"
                    checked={sex === 'Female'}
                    onChange={() => setSex('Female')}
                    className="text-[#002e6f] focus:ring-[#002e6f] h-4 w-4 border-[#c3c6d4]"
                  />
                  <span className="text-sm font-body-md text-[#1a1b21]">
                    {language === 'th' ? 'หญิง (Female)' : 'Female'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Reference Setup */}
        <div className="bg-white rounded-xl border border-[#c3c6d4]/40 p-6 shadow-xs space-y-5">
          <h3 className="font-headline-sm text-lg font-bold text-[#006a63] flex items-center gap-2 border-b border-[#c3c6d4]/30 pb-3">
            <span className="material-symbols-outlined text-[#006a63]">tune</span>
            <span>{language === 'th' ? 'การตั้งค่าเกณฑ์อ้างอิง' : 'Reference Setup'}</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block font-label-caps text-xs text-[#434752] mb-1.5 font-bold">
                {language === 'th' ? 'เกณฑ์มาตรฐานการเจริญเติบโต' : 'Growth Reference Standard'}
              </label>
              <select
                value={growthStandard}
                onChange={(e) => setGrowthStandard(e.target.value)}
                className="w-full bg-white border border-[#c3c6d4] rounded-md px-3 py-2.5 text-sm text-[#1a1b21] focus:border-[#002e6f] focus:ring-1 focus:ring-[#002e6f] outline-none"
              >
                <option>Thai Department of Health (2020)</option>
                <option>WHO Child Growth Standards</option>
                <option>CDC Growth Charts</option>
              </select>
            </div>

            <div className="p-4 bg-[#9deee5]/20 border border-[#9deee5] rounded-lg mt-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#006a63] mt-0.5 text-xl">
                  verified_user
                </span>
                <div>
                  <h4 className="font-label-caps text-xs text-[#006a63] font-bold mb-1">
                    {language === 'th' ? 'รายละเอียดเกณฑ์ที่เลือก' : 'Selected Standard Details'}
                  </h4>
                  <p className="font-body-md text-xs text-[#434752] leading-relaxed">
                    {language === 'th'
                      ? 'เกณฑ์อ้างอิงมาตรฐานการเจริญเติบโตของเด็กและวัยรุ่นไทย กรมอนามัย (อายุ 5-19 ปี) เหมาะสมกับประชากรเอเชียตะวันออกเฉียงใต้'
                      : 'Thai national standard reference for children and adolescents. Applicable for ages 5-19 years.'}
                  </p>
                </div>
              </div>
            </div>
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
            onClick={handleSave}
            className="font-label-caps text-xs text-[#434752] hover:bg-[#ededf5] transition-colors px-4 py-2 rounded-lg border border-[#c3c6d4] cursor-pointer"
          >
            {language === 'th' ? 'บันทึกแบบร่าง' : 'Save Draft'}
          </button>
          <button
            onClick={onBack}
            className="font-label-caps text-xs bg-[#9deee5] text-[#0c6f67] font-bold rounded-lg px-5 py-2 hover:brightness-95 transition-all cursor-pointer"
          >
            {language === 'th' ? 'ย้อนกลับ' : 'Back'}
          </button>
          <button
            onClick={handleNext}
            className="font-label-caps text-xs bg-[#002e6f] text-white font-bold rounded-lg px-6 py-2 hover:bg-[#00439b] transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-98"
          >
            <span>{language === 'th' ? 'ดำเนินการต่อ' : 'Continue'}</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
