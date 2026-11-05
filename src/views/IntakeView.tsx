import React, { useEffect, useState } from 'react';
import { PatientCase, Language } from '../types';
import { calculateAgeMonths, formatAge } from '../utils/age';
import { DayMonthYearInput } from '../components/DayMonthYearInput';

interface IntakeViewProps {
  currentCase: PatientCase;
  onUpdateCase: (updated: Partial<PatientCase>) => void;
  onContinue: () => void;
  onBack: () => void;
  language: Language;
}

export const IntakeView: React.FC<IntakeViewProps> = ({
  currentCase,
  onUpdateCase,
  onContinue,
  onBack,
  language,
}) => {
  const [firstName, setFirstName] = useState(currentCase.name.first);
  const [lastName, setLastName] = useState(currentCase.name.last);
  const [dob, setDob] = useState(currentCase.dob);
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other'>(currentCase.sex);
  const [height, setHeight] = useState(currentCase.heightCm.toString());
  const [weight, setWeight] = useState(currentCase.weightKg.toString());
  const [indication, setIndication] = useState(currentCase.primaryIndication);
  const [notes, setNotes] = useState(currentCase.clinicalNotes);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isImported, setIsImported] = useState(false);
  const calculatedAgeMonths = calculateAgeMonths(dob, currentCase.measurementDate);

  useEffect(() => {
    setFirstName(currentCase.name.first);
    setLastName(currentCase.name.last);
    setDob(currentCase.dob);
    setSex(currentCase.sex);
    setHeight(currentCase.heightCm ? String(currentCase.heightCm) : '');
    setWeight(currentCase.weightKg ? String(currentCase.weightKg) : '');
    setIndication(currentCase.primaryIndication);
    setNotes(currentCase.clinicalNotes);
  }, [currentCase.id, currentCase.dob, currentCase.measurementDate]);

  const handleDobChange = (nextDob: string) => {
    setDob(nextDob);
    const months = calculateAgeMonths(nextDob, currentCase.measurementDate);
    onUpdateCase({
      dob: nextDob,
      chronologicalAgeMonths: months,
      chronologicalAgeDisplay: formatAge(months, 'en'),
    });
  };

  // Auto BMI computation
  const heightM = (parseFloat(height) || 0) / 100;
  const weightNum = parseFloat(weight) || 0;
  const computedBmi =
    heightM > 0 && weightNum > 0 ? (weightNum / (heightM * heightM)).toFixed(1) : '--';

  // Completeness computation
  let completeness = 20;
  if (firstName && lastName) completeness += 20;
  if (dob) completeness += 20;
  if (parseFloat(height) > 0 && parseFloat(weight) > 0) completeness += 20;
  if (indication && indication !== 'Select Indication...') completeness += 20;

  const handleImportScreening = () => {
    setFirstName(currentCase.name.first);
    setLastName(currentCase.name.last);
    setDob(currentCase.dob);
    setSex(currentCase.sex || 'Male');
    setHeight(currentCase.heightCm ? currentCase.heightCm.toString() : '');
    setWeight(currentCase.weightKg ? currentCase.weightKg.toString() : '');
    setIsImported(true);
  };

  const handleSave = () => {
    onUpdateCase({
      name: { first: firstName, last: lastName },
      dob,
      chronologicalAgeMonths: calculatedAgeMonths,
      chronologicalAgeDisplay: formatAge(calculatedAgeMonths, 'en'),
      sex,
      heightCm: parseFloat(height) || 0,
      weightKg: parseFloat(weight) || 0,
      bmi: parseFloat(computedBmi) || 0,
      primaryIndication: indication,
      clinicalNotes: notes,
    });
  };

  const handleNext = () => {
    handleSave();
    onUpdateCase({ currentStep: 'Imaging', lastStep: 'Intake' });
    onContinue();
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-28">
      {/* Title & Import Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-md text-2xl md:text-3xl text-[#1a1b21] font-bold">
            {language === 'th' ? 'การบันทึกข้อมูลผู้ป่วย (Patient Intake)' : 'Patient Intake'}
          </h2>
          <p className="font-body-md text-sm text-[#434752] mt-0.5">
            {language === 'th'
              ? 'กรอกข้อมูลสัดส่วนร่างกาย ประวัติการเจริญเติบโต และข้อบ่งชี้ทางคลินิก'
              : 'Enter patient anthropometry, clinical history, and indication.'}
          </p>
        </div>

        <button
          onClick={handleImportScreening}
          className="flex items-center gap-2 bg-[#9deee5] text-[#0c6f67] font-bold px-4 py-2.5 rounded-lg font-label-caps text-xs hover:brightness-95 transition-all shadow-xs cursor-pointer active:scale-98 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-lg">download</span>
          <span>
            {isImported
              ? language === 'th'
                ? 'นำเข้าข้อมูลแล้ว ✓'
                : 'Imported from Screening ✓'
              : language === 'th'
              ? 'นำเข้าจากขั้นตอนคัดกรอง'
              : 'Import from Screening'}
          </span>
        </button>
      </div>

      {/* Main Split Layout: Left Form / Right Assistant */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Form Cards */}
        <div className="flex-1 space-y-6">
          {/* Demographics Card */}
          <div className="bg-white rounded-xl p-6 shadow-xs border border-[#c3c6d4]/40 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#002e6f]"></div>
            <h3 className="font-headline-sm text-base font-bold text-[#1a1b21] mb-5 flex items-center gap-2 border-b border-[#c3c6d4]/30 pb-3">
              <span className="material-symbols-outlined text-[#002e6f]">badge</span>
              <span>{language === 'th' ? 'ข้อมูลส่วนบุคคล (Demographics)' : 'Demographics'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-label-caps text-xs text-[#737784] mb-1 font-bold">
                  {language === 'th' ? 'ชื่อจริง (Given Name)' : 'Given Name'}
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Given Name"
                  className="w-full bg-white border border-[#c3c6d4] rounded-lg px-3 py-2 text-sm text-[#1a1b21] focus:border-[#002e6f] focus:ring-1 focus:ring-[#002e6f] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-label-caps text-xs text-[#737784] mb-1 font-bold">
                  {language === 'th' ? 'นามสกุล (Family Name)' : 'Family Name'}
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Family Name"
                  className="w-full bg-white border border-[#c3c6d4] rounded-lg px-3 py-2 text-sm text-[#1a1b21] focus:border-[#002e6f] focus:ring-1 focus:ring-[#002e6f] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-label-caps text-xs text-[#737784] mb-1 font-bold">
                  {language === 'th' ? 'วันเดือนปีเกิด' : 'Date of Birth'}
                </label>
                <DayMonthYearInput
                  value={dob}
                  onChange={handleDobChange}
                  className="w-full bg-white border border-[#c3c6d4] rounded-lg px-3 py-2 text-sm text-[#1a1b21] font-data-mono focus:border-[#002e6f] focus:ring-1 focus:ring-[#002e6f] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-label-caps text-xs text-[#737784] mb-1 font-bold">
                  {language === 'th' ? 'อายุจริง (คำนวณอัตโนมัติ)' : 'Chronological Age (Auto)'}
                </label>
                <input
                  disabled
                  value={dob ? formatAge(calculatedAgeMonths, language) : '—'}
                  className="w-full bg-[#ededf5] border border-[#c3c6d4] rounded-lg px-3 py-2 text-sm text-[#434752] font-data-mono cursor-not-allowed font-bold"
                />
              </div>

              <div className="sm:col-span-2 pt-1">
                <label className="block font-label-caps text-xs text-[#737784] mb-1.5 font-bold">
                  {language === 'th' ? 'เพศกำเนิด (Biological Sex)' : 'Biological Sex'}
                </label>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bioSex"
                      checked={sex === 'Male'}
                      onChange={() => setSex('Male')}
                      className="text-[#002e6f] focus:ring-[#002e6f] w-4 h-4"
                    />
                    <span className="text-sm font-body-md text-[#1a1b21]">Male</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bioSex"
                      checked={sex === 'Female'}
                      onChange={() => setSex('Female')}
                      className="text-[#002e6f] focus:ring-[#002e6f] w-4 h-4"
                    />
                    <span className="text-sm font-body-md text-[#1a1b21]">Female</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bioSex"
                      checked={sex === 'Other'}
                      onChange={() => setSex('Other')}
                      className="text-[#002e6f] focus:ring-[#002e6f] w-4 h-4"
                    />
                    <span className="text-sm font-body-md text-[#1a1b21]">Undisclosed / Other</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Anthropometry & Growth History Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Anthropometry Card */}
            <div className="bg-white rounded-xl p-6 shadow-xs border border-[#c3c6d4]/40 flex flex-col justify-between">
              <h3 className="font-headline-sm text-base font-bold text-[#1a1b21] mb-5 flex items-center gap-2 border-b border-[#c3c6d4]/30 pb-3">
                <span className="material-symbols-outlined text-[#006a63]">straighten</span>
                <span>{language === 'th' ? 'การวัดสัดส่วนร่างกาย' : 'Anthropometry'}</span>
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-caps text-xs text-[#737784] mb-1 font-bold">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-white border border-[#c3c6d4] rounded-lg px-3 py-2 text-sm text-[#1a1b21] font-data-mono text-right focus:border-[#002e6f] focus:ring-1 focus:ring-[#002e6f] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-label-caps text-xs text-[#737784] mb-1 font-bold">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-white border border-[#c3c6d4] rounded-lg px-3 py-2 text-sm text-[#1a1b21] font-data-mono text-right focus:border-[#002e6f] focus:ring-1 focus:ring-[#002e6f] outline-none"
                    />
                  </div>
                </div>

                <div className="bg-[#f3f3fb] p-3.5 rounded-lg border border-[#c3c6d4]/50 flex justify-between items-center">
                  <span className="font-label-caps text-xs text-[#434752]">
                    BMI (Auto-calculated)
                  </span>
                  <span className="font-data-mono text-base font-bold text-[#002e6f]">
                    {computedBmi}
                  </span>
                </div>
              </div>
            </div>

            {/* Growth History Upload Card */}
            <div className="bg-white rounded-xl p-6 shadow-xs border border-[#c3c6d4]/40 flex flex-col justify-between">
              <h3 className="font-headline-sm text-base font-bold text-[#1a1b21] mb-4 flex items-center gap-2 border-b border-[#c3c6d4]/30 pb-3">
                <span className="material-symbols-outlined text-[#004e62]">show_chart</span>
                <span>{language === 'th' ? 'ประวัติการเจริญเติบโต' : 'Growth History'}</span>
              </h3>

              <div className="h-full min-h-[140px] flex flex-col justify-center items-center text-center p-4 border-2 border-dashed border-[#c3c6d4] rounded-lg bg-[#f3f3fb] hover:bg-[#ededf5] transition-colors">
                <span className="material-symbols-outlined text-[#737784] text-3xl mb-1">
                  upload_file
                </span>
                <p className="font-body-md text-xs text-[#434752] max-w-[240px]">
                  {language === 'th'
                    ? 'อัปโหลดกราฟการเจริญเติบโตหรือผลตรวจเดิม'
                    : 'Upload historical growth charts or previous clinical assessments.'}
                </p>
                <label className="mt-2 text-xs font-label-caps text-[#002e6f] font-bold hover:underline cursor-pointer">
                  Browse Files
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadedFiles([...uploadedFiles, e.target.files[0].name]);
                      }
                    }}
                  />
                </label>
                {uploadedFiles.length > 0 && (
                  <div className="mt-2 text-[11px] text-[#006a63] font-data-mono">
                    ✓ {uploadedFiles[uploadedFiles.length - 1]} attached
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Clinical History Card */}
          <div className="bg-white rounded-xl p-6 shadow-xs border border-[#c3c6d4]/40 space-y-4">
            <h3 className="font-headline-sm text-base font-bold text-[#1a1b21] flex items-center gap-2 border-b border-[#c3c6d4]/30 pb-3">
              <span className="material-symbols-outlined text-[#002e6f]">medical_information</span>
              <span>{language === 'th' ? 'ประวัติทางคลินิก' : 'Clinical History'}</span>
            </h3>

            <div>
              <label className="block font-label-caps text-xs text-[#737784] mb-1 font-bold">
                {language === 'th'
                  ? 'ข้อบ่งชี้หลักในการประเมินอายุกระดูก'
                  : 'Primary Indication for Bone Age Assessment'}
              </label>
              <select
                value={indication}
                onChange={(e) => setIndication(e.target.value)}
                className="w-full bg-white border border-[#c3c6d4] rounded-lg px-3 py-2.5 text-sm text-[#1a1b21] focus:border-[#002e6f] focus:ring-1 focus:ring-[#002e6f] outline-none"
              >
                <option>Select Indication...</option>
                <option>Short Stature Evaluation</option>
                <option>Precocious Puberty</option>
                <option>Delayed Puberty</option>
                <option>Endocrine Disorder Monitoring</option>
                <option>Orthopedic Planning</option>
                <option>Other (Specify in notes)</option>
              </select>
            </div>

            <div>
              <label className="block font-label-caps text-xs text-[#737784] mb-1 font-bold">
                {language === 'th' ? 'อาการสำคัญ / บันทึกเพิ่มเติม' : 'Relevant Medical Conditions / Notes'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder={
                  language === 'th'
                    ? 'ระบุรายละเอียดทางคลินิก ยาที่รับประทาน หรือกลุ่มอาการทางพันธุกรรม...'
                    : 'Enter relevant clinical details, known syndromes, or current medications...'
                }
                className="w-full bg-white border border-[#c3c6d4] rounded-lg px-3 py-2 text-sm text-[#1a1b21] focus:border-[#002e6f] focus:ring-1 focus:ring-[#002e6f] outline-none resize-none"
              />
            </div>
          </div>

          {/* Research Data Use Notice */}
          <div className="bg-[#f3f3fb] rounded-xl p-4 border border-[#c3c6d4]/50 flex items-start gap-3">
            <span className="material-symbols-outlined text-[#004e62] text-xl mt-0.5">info</span>
            <div>
              <h4 className="font-label-caps text-xs text-[#1a1b21] font-bold mb-0.5">
                {language === 'th' ? 'ข้อกำหนดการใช้ข้อมูลการวิจัย' : 'Research Data Use Notice'}
              </h4>
              <p className="font-caption text-xs text-[#434752] leading-relaxed">
                {language === 'th'
                  ? 'ข้อมูลที่ป้อนลงในโปรแกรมต้นแบบนี้จะใช้เพื่อการทดสอบความแม่นยำของโมเดล Skeleton Bone Age เท่านั้น กรุณาลดการระบุตัวตนผู้ป่วยตามระเบียบจริยธรรมการวิจัย'
                  : 'Data entered into this prototype will be used solely for validating the Skeleton Bone Age model. Ensure patient identifiers are minimized according to institutional IRB protocols before submission.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Intake Assistant Panel */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-xl shadow-xs border border-[#c3c6d4]/40 flex flex-col sticky top-32 overflow-hidden">
            {/* Assistant Header */}
            <div className="bg-[#2b5bb3] text-white p-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">psychology</span>
              <h3 className="font-headline-sm text-base font-bold">
                {language === 'th' ? 'ผู้ช่วย Intake' : 'Intake Assistant'}
              </h3>
            </div>

            <div className="p-5 space-y-6">
              {/* Completeness Tracker */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <h4 className="font-label-caps text-xs text-[#1a1b21] font-bold">
                    {language === 'th' ? 'ความสมบูรณ์ของข้อมูล' : 'Data Completeness'}
                  </h4>
                  <span className="font-data-mono text-sm font-bold text-[#002e6f]">
                    {completeness}%
                  </span>
                </div>
                <div className="w-full bg-[#ededf5] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#002e6f] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </div>

              {/* Validation Flags */}
              <div className="space-y-3">
                <h4 className="font-label-caps text-xs text-[#737784] border-b border-[#c3c6d4]/30 pb-1 font-bold">
                  {language === 'th' ? 'การตรวจสอบความถูกต้อง' : 'Validation Flags'}
                </h4>

                {!dob ? (
                  <div className="bg-[#ffdad6] text-[#93000a] p-3 rounded-lg flex items-start gap-2 border border-[#ba1a1a]/20">
                    <span className="material-symbols-outlined text-base mt-0.5">error</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">Missing DOB</span>
                      <span className="font-caption text-[11px] leading-tight opacity-90">
                        {language === 'th' ? 'ต้องระบุอายุจริงเพื่อใช้เปรียบเทียบกับผลทำนายและ XAI' : 'Chronological age is required for prediction and XAI comparison.'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#9deee5]/30 text-[#0c6f67] p-3 rounded-lg flex items-start gap-2 border border-[#006a63]/20">
                    <span className="material-symbols-outlined text-base mt-0.5">check_circle</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{language === 'th' ? 'ยืนยันวันเดือนปีเกิดแล้ว' : 'Date of birth verified'}</span>
                      <span className="font-caption text-[11px] leading-tight">
                        {language === 'th' ? 'อายุตามปฏิทิน' : 'Chronological age'}: {language === 'th'
                          ? formatAge(calculatedAgeMonths, 'th')
                          : formatAge(calculatedAgeMonths, 'en')}
                      </span>
                    </div>
                  </div>
                )}

                {(!indication || indication === 'Select Indication...') && (
                  <div className="bg-[#ededf5] p-3 rounded-lg flex items-start gap-2 border border-[#c3c6d4]/50">
                    <span className="material-symbols-outlined text-base text-[#737784] mt-0.5">
                      help_center
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#1a1b21]">Indication Not Set</span>
                      <span className="font-caption text-[11px] text-[#434752] leading-tight">
                        {language === 'th' ? 'ใช้ประกอบการตีความผลการประเมิน ไม่ใช่ช่วงความเชื่อมั่นรายบุคคล' : 'Used to contextualize the assessment; it is not a patient-level confidence interval.'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Insights Card */}
              <div className="bg-[#004e62]/10 border border-[#004e62]/20 rounded-lg p-4 text-center">
                <span className="material-symbols-outlined text-[#004e62] text-3xl mb-1">
                  auto_awesome
                </span>
                <p className="font-caption text-xs text-[#434752]">
                  {language === 'th'
                    ? 'ข้อมูลครบถ้วนจะช่วยเปิดใช้งานการถ่วงน้ำหนักทางคลินิกก่อนประเมิน'
                    : 'Complete intake to activate pre-assessment clinical weighting.'}
                </p>
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
            className="font-label-caps text-xs bg-[#9deee5] text-[#0c6f67] font-bold rounded-lg px-5 py-2 hover:brightness-95 transition-all cursor-pointer"
          >
            {language === 'th' ? 'บันทึกแบบร่าง' : 'Save Draft'}
          </button>
          <button
            onClick={onBack}
            className="font-label-caps text-xs bg-[#e2e2ea] text-[#1a1b21] font-bold rounded-lg px-5 py-2 hover:bg-[#c3c6d4] transition-all cursor-pointer"
          >
            {language === 'th' ? 'ย้อนกลับ' : 'Back'}
          </button>
          <button
            onClick={handleNext}
            className="font-label-caps text-xs bg-[#002e6f] text-white font-bold rounded-lg px-6 py-2 hover:bg-[#00439b] transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-98"
          >
            <span>{language === 'th' ? 'ไปยังหน้าภาพ X-Ray' : 'Continue'}</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
