import React, { useState } from 'react';
import { PatientCase, Language } from '../types';
import { defaultROIs } from '../data/mockData';
import { calculateAgeMonths, formatAge, localDateString } from '../utils/age';
import { DayMonthYearInput } from './DayMonthYearInput';

interface NewAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCase: (newCase: PatientCase) => void;
  language: Language;
}

export const NewAssessmentModal: React.FC<NewAssessmentModalProps> = ({
  isOpen,
  onClose,
  onCreateCase,
  language,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [indication, setIndication] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const caseNum = Date.now().toString().slice(-8);
    const newCaseId = `BA-${caseNum}`;
    const newPatientId = `P-${caseNum}`;
    const measurementDate = localDateString();
    const chronologicalAgeMonths = calculateAgeMonths(dob, measurementDate);
    const heightValue = parseFloat(height) || 0;
    const weightValue = parseFloat(weight) || 0;
    const bmi = heightValue > 0 ? weightValue / ((heightValue / 100) ** 2) : 0;

    const created: PatientCase = {
      id: newCaseId,
      patientId: newPatientId,
      name: {
        first: firstName.trim() || 'New',
        last: lastName.trim() || 'Patient',
      },
      dob,
      measurementDate,
      chronologicalAgeMonths,
      chronologicalAgeDisplay: formatAge(chronologicalAgeMonths, 'en'),
      sex,
      currentStep: 'Screening',
      status: 'Draft',
      updatedAt: 'Just now',
      lastStep: 'Screening',
      heightCm: heightValue,
      weightKg: weightValue,
      bmi: Math.round(bmi * 10) / 10,
      heightPercentile: 'Not calculated',
      fatherHeightCm: 0,
      motherHeightCm: 0,
      midParentalHeightCm: 0,
      primaryIndication: indication,
      clinicalNotes: '',
      growthStandard: 'Thai Department of Health (2020)',
      predictedAgeMonths: 0,
      predictedAgeDisplay: 'Not predicted',
      offsetMonths: 0,
      offsetType: 'Normal',
      uncertaintyMonths: 0,
      confidenceInterval: 'Not available',
      xrayImageUrl: '',
      xaiHeatmapUrl: '',
      xaiEvidenceStatus: 'unavailable',
      rois: defaultROIs.map((roi) => ({
        ...roi,
        thumbnailUrl: '',
        status: 'pending',
      })),
      modelId: 'full18_focalnet_b8',
      modelDisplayName: 'ระบบวิเคราะห์อายุกระดูก อายุ 1–18 ปี',
      modelArchitecture: 'ระบบวิเคราะห์ภาพ 9 ตำแหน่งร่วมกับข้อมูลเพศ',
      preprocessingVersion: '9 ROI + sex | aspect-pad224 | original intensity',
      experimentId: 'FULL18_AUG200_V6_A1_SLOW_PLATEAU_E50',
      imageQualityCheck: 'Flagged',
      roisAccepted: 0,
      roisTotal: 9,
      xaiAcknowledged: false,
      checklistComplete: false,
    };

    onCreateCase(created);
    setFirstName('');
    setLastName('');
    setDob('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-[#c3c6d4]">
        <div className="p-5 border-b border-[#c3c6d4]/40 flex justify-between items-center bg-[#f3f3fb]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#002e6f]">add_box</span>
            <h3 className="font-headline-sm text-lg text-[#002e6f] font-bold">
              {language === 'th' ? 'สร้างเคสการประเมินใหม่' : 'Create New Assessment Case'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#434752] hover:bg-[#ededf5] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label-caps text-xs text-[#434752] mb-1">
                {language === 'th' ? 'ชื่อ' : 'First Name'}
              </label>
              <input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Tanawat"
                className="w-full bg-[#f8f9ff] border border-[#c3c6d4] rounded-lg px-3 py-2 text-sm text-[#1a1b21] focus:border-[#002e6f] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-label-caps text-xs text-[#434752] mb-1">
                {language === 'th' ? 'นามสกุล' : 'Last Name'}
              </label>
              <input
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Srisuwan"
                className="w-full bg-[#f8f9ff] border border-[#c3c6d4] rounded-lg px-3 py-2 text-sm text-[#1a1b21] focus:border-[#002e6f] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label-caps text-xs text-[#434752] mb-1">
                {language === 'th' ? 'วันเกิด' : 'Date of Birth'}
              </label>
              <DayMonthYearInput
                required
                value={dob}
                onChange={setDob}
                className="w-full bg-[#f8f9ff] border border-[#c3c6d4] rounded-lg px-3 py-2 text-sm text-[#1a1b21] font-data-mono focus:border-[#002e6f] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-label-caps text-xs text-[#434752] mb-1">
                {language === 'th' ? 'เพศ' : 'Biological Sex'}
              </label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as any)}
                className="w-full bg-[#f8f9ff] border border-[#c3c6d4] rounded-lg px-3 py-2 text-sm text-[#1a1b21] focus:border-[#002e6f] focus:outline-none"
              >
                <option value="Male">{language === 'th' ? 'ชาย (Male)' : 'Male'}</option>
                <option value="Female">{language === 'th' ? 'หญิง (Female)' : 'Female'}</option>
                <option value="Other">{language === 'th' ? 'อื่นๆ (Other)' : 'Other'}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label-caps text-xs text-[#434752] mb-1">
                {language === 'th' ? 'ส่วนสูง (cm)' : 'Height (cm)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-[#f8f9ff] border border-[#c3c6d4] rounded-lg px-3 py-2 text-sm text-[#1a1b21] font-data-mono focus:border-[#002e6f] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-label-caps text-xs text-[#434752] mb-1">
                {language === 'th' ? 'น้ำหนัก (kg)' : 'Weight (kg)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-[#f8f9ff] border border-[#c3c6d4] rounded-lg px-3 py-2 text-sm text-[#1a1b21] font-data-mono focus:border-[#002e6f] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-caps text-xs text-[#434752] mb-1">
              {language === 'th' ? 'ข้อบ่งชี้ทางคลินิก' : 'Primary Clinical Indication'}
            </label>
            <select
              value={indication}
              onChange={(e) => setIndication(e.target.value)}
              className="w-full bg-[#f8f9ff] border border-[#c3c6d4] rounded-lg px-3 py-2 text-sm text-[#1a1b21] focus:border-[#002e6f] focus:outline-none"
            >
              <option>Short Stature Evaluation</option>
              <option>Precocious Puberty</option>
              <option>Delayed Puberty</option>
              <option>Endocrine Disorder Monitoring</option>
              <option>Orthopedic Planning</option>
            </select>
          </div>

          <div className="pt-4 border-t border-[#c3c6d4]/40 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#ededf5] hover:bg-[#e2e2ea] text-[#1a1b21] rounded-lg font-label-caps text-xs transition-colors"
            >
              {language === 'th' ? 'ยกเลิก' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#002e6f] hover:bg-[#00439b] text-white rounded-lg font-label-caps text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">arrow_forward</span>
              {language === 'th' ? 'สร้างเคสและเริ่มการตรวจ' : 'Create & Begin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
