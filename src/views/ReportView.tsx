import React, { useState } from 'react';
import { PatientCase, Language } from '../types';
import { AuthenticatedImage } from '../components/AuthenticatedImage';

interface ReportViewProps {
  currentCase: PatientCase;
  language: Language;
  onBack: () => void;
  onFinalizeReport?: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  currentCase,
  language,
  onBack,
  onFinalizeReport,
}) => {
  const [reportLang, setReportLang] = useState<'th' | 'en' | 'bilingual'>(language === 'th' ? 'th' : 'en');
  const isThai = reportLang === 'th';
  const ageText = (months: number) => `${Math.floor(months / 12)} ${isThai ? 'ปี' : 'y'} ${Number((months % 12).toFixed(1))} ${isThai ? 'เดือน' : 'm'}`;
  const [isFinalized, setIsFinalized] = useState(
    currentCase.status === 'Complete' || currentCase.status === 'Finalized'
  );
  const topAttributions = [...currentCase.rois]
    .filter((roi) => typeof roi.xaiImportance === 'number' && roi.xaiImportance > 0)
    .sort((a, b) => (b.xaiImportance || 0) - (a.xaiImportance || 0))
    .slice(0, 3);

  const handlePrint = () => {
    window.print();
  };

  const handleFinalize = () => {
    setIsFinalized(true);
    if (onFinalizeReport) onFinalizeReport();
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-28">
      {/* Top Controls Bar (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="font-headline-md text-2xl md:text-3xl text-[#1a1b21] font-bold">
            {reportLang === 'th'
              ? 'รายงานการประเมินอายุกระดูก'
              : 'Clinical Bone Age Assessment Report'}
          </h2>
          <p className="font-body-md text-sm text-[#434752] mt-0.5">
            {isThai ? 'ผลจากระบบต้นแบบงานวิจัย • รูปแบบรายงานกุมารเวชศาสตร์' : 'Research prototype output • Pediatric report format'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Language toggle for report */}
          <div className="flex bg-[#ededf5] p-1 rounded-lg border border-[#c3c6d4]/50">
            <button
              onClick={() => setReportLang('th')}
              className={`px-3 py-1 text-xs font-label-caps rounded-md transition-all cursor-pointer ${
                reportLang === 'th' ? 'bg-white text-[#002e6f] font-bold shadow-xs' : 'text-[#434752]'
              }`}
            >
              ไทย
            </button>
            <button
              onClick={() => setReportLang('en')}
              className={`px-3 py-1 text-xs font-label-caps rounded-md transition-all cursor-pointer ${
                reportLang === 'en' ? 'bg-white text-[#002e6f] font-bold shadow-xs' : 'text-[#434752]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setReportLang('bilingual')}
              className={`px-3 py-1 text-xs font-label-caps rounded-md transition-all cursor-pointer ${
                reportLang === 'bilingual' ? 'bg-[#002e6f] text-white font-bold shadow-xs' : 'text-[#434752]'
              }`}
            >
              Bilingual (2 ภาษา)
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white hover:bg-[#f3f3fb] text-[#1a1b21] border border-[#c3c6d4] rounded-lg font-label-caps text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">print</span>
            <span>{isThai ? 'พิมพ์ / PDF' : 'Print / PDF'}</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet (A4 Styled Document) */}
      <div className="bg-white rounded-xl shadow-md border border-[#c3c6d4]/60 p-8 md:p-12 space-y-6 text-[#1a1b21]">
        {/* Document Header */}
        <div className="border-b-2 border-[#002e6f] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#002e6f] text-2xl">radiology</span>
              <h1 className="font-display-lg text-xl font-bold text-[#002e6f] tracking-tight">
                {isThai ? 'รายงานการประเมินอายุกระดูก' : 'Skeleton Bone Age Assessment Report'}
              </h1>
            </div>
            <p className="font-caption text-xs text-[#434752] mt-0.5">
              {isThai ? 'ระบบสนับสนุนการตัดสินใจด้านวุฒิภาวะกระดูกในเด็ก • แผนกรังสีวิทยา' : 'Pediatric Skeletal Maturity Clinical Decision Support • Department of Radiology'}
            </p>
          </div>

          <div className="bg-[#004e62]/10 border border-[#004e62]/30 px-3 py-1.5 rounded text-right">
            <div className="font-data-mono text-xs font-bold text-[#004e62]">
              {isThai ? 'เคส' : 'CASE'}: {currentCase.id}
            </div>
            <div className="font-caption text-[11px] text-[#737784]">
              {isThai ? 'วันที่ตรวจ' : 'Date'}: {currentCase.measurementDate}
            </div>
          </div>
        </div>

        {/* Patient Demographics Table */}
        <div className="bg-[#f8f9ff] rounded-lg border border-[#c3c6d4]/40 p-4">
          <h3 className="font-headline-sm text-xs font-bold text-[#002e6f] uppercase tracking-wider mb-3">
            {reportLang === 'th'
              ? 'ข้อมูลผู้ป่วย (Patient Demographics)'
              : 'Patient Demographics'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-body-md">
            <div>
              <span className="text-[#737784] block font-label-caps">{isThai ? 'ชื่อผู้ป่วย:' : 'Patient Name:'}</span>
              <span className="font-bold">{currentCase.name.first} {currentCase.name.last}</span>
            </div>
            <div>
              <span className="text-[#737784] block font-label-caps">{isThai ? 'วันเดือนปีเกิด:' : 'Date of Birth:'}</span>
              <span className="font-data-mono">{currentCase.dob}</span>
            </div>
            <div>
              <span className="text-[#737784] block font-label-caps">{isThai ? 'อายุตามปฏิทิน:' : 'Chronological Age:'}</span>
              <span className="font-data-mono font-bold text-[#002e6f]">
                {ageText(currentCase.chronologicalAgeMonths)} ({currentCase.chronologicalAgeMonths} {isThai ? 'เดือน' : 'months'})
              </span>
            </div>
            <div>
              <span className="text-[#737784] block font-label-caps">{isThai ? 'เพศกำเนิด:' : 'Biological Sex:'}</span>
              <span>{isThai ? (currentCase.sex === 'Male' ? 'ชาย' : 'หญิง') : currentCase.sex}</span>
            </div>
            <div>
              <span className="text-[#737784] block font-label-caps">{isThai ? 'ส่วนสูง / น้ำหนัก:' : 'Height / Weight:'}</span>
              <span className="font-data-mono">{currentCase.heightCm} cm / {currentCase.weightKg} kg</span>
            </div>
            <div>
              <span className="text-[#737784] block font-label-caps">{isThai ? 'เปอร์เซ็นไทล์ / BMI:' : 'Percentile / BMI:'}</span>
              <span>BMI {currentCase.bmi} ({currentCase.heightPercentile})</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-[#737784] block font-label-caps">{isThai ? 'ข้อบ่งชี้หลัก:' : 'Primary Indication:'}</span>
              <span>{currentCase.primaryIndication}</span>
            </div>
          </div>
        </div>

        {/* Primary Bone Age Finding Box */}
        <div className="border-2 border-[#002e6f] rounded-xl p-6 bg-[#f3f3fb] space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#002e6f]/20 pb-3">
            <h2 className="font-headline-sm text-lg font-bold text-[#002e6f]">
              {reportLang === 'th'
                ? 'ผลการประเมินอายุกระดูกด้วย AI (Skeletal Maturity Assessment)'
                : 'Skeletal Maturity Assessment Result'}
            </h2>
            <span
              className={`px-3 py-1 rounded-full font-label-caps text-xs font-bold ${
                currentCase.offsetType === 'Advanced'
                  ? 'bg-[#ffdad6] text-[#93000a]'
                  : 'bg-[#9deee5] text-[#0c6f67]'
              }`}
            >
              {isThai ? `ผลต่าง ${currentCase.offsetMonths > 0 ? '+' : ''}${currentCase.offsetMonths} เดือน` : `Difference from chronological age (${currentCase.offsetMonths > 0 ? '+' : ''}${currentCase.offsetMonths} months)`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-3.5 rounded-lg border border-[#c3c6d4]/40 text-center">
              <span className="text-xs text-[#737784] font-label-caps block">{isThai ? 'อายุกระดูกที่ AI ทำนาย' : 'AI Predicted Bone Age'}</span>
              <span className="font-headline-lg text-2xl font-bold text-[#002e6f] font-data-mono block mt-1">
                {ageText(currentCase.predictedAgeMonths)}
              </span>
              <span className="text-xs text-[#737784] font-data-mono">
                ({currentCase.predictedAgeMonths} {isThai ? 'เดือน' : 'months'})
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-[#c3c6d4]/40 text-center">
              <span className="text-xs text-[#737784] font-label-caps block">{isThai ? 'อายุตามปฏิทิน' : 'Chronological Age'}</span>
              <span className="font-headline-lg text-2xl font-bold text-[#1a1b21] font-data-mono block mt-1">
                {ageText(currentCase.chronologicalAgeMonths)}
              </span>
              <span className="text-xs text-[#737784] font-data-mono">
                ({currentCase.chronologicalAgeMonths} {isThai ? 'เดือน' : 'months'})
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-[#c3c6d4]/40 text-center">
              <span className="text-xs text-[#737784] font-label-caps block">{isThai ? 'ช่วงความไม่แน่นอนรายบุคคล' : 'Patient-level uncertainty'}</span>
              <span className="font-headline-lg text-2xl font-bold text-[#0c6f67] font-data-mono block mt-1">
                {currentCase.uncertaintyMonths > 0 ? `±${currentCase.uncertaintyMonths} ${isThai ? 'เดือน' : 'mo'}` : (isThai ? 'ยังไม่ได้ประเมิน' : 'Not estimated')}
              </span>
              <span className="text-xs text-[#006a63] font-data-mono">
                {currentCase.uncertaintyMonths > 0 ? (isThai ? 'ช่วงค่าจากโมเดล' : 'Model interval') : (isThai ? 'ค่า Validation ไม่ใช่ช่วงความเชื่อมั่นของผู้ป่วยรายนี้' : 'Validation metric is not a patient interval')}
              </span>
            </div>
          </div>

          <p className="font-body-md text-xs text-[#434752] leading-relaxed pt-1">
            {isThai ? <><strong>ผลจากโมเดลวิจัย:</strong> โมเดลประเมินอายุกระดูก {ageText(currentCase.predictedAgeMonths)} ({currentCase.predictedAgeMonths} เดือน) ซึ่ง{Math.abs(currentCase.offsetMonths) < 3 ? 'ใกล้เคียงกับ' : currentCase.offsetMonths > 0 ? `มากกว่า ${Math.abs(currentCase.offsetMonths)} เดือนเมื่อเทียบกับ` : `น้อยกว่า ${Math.abs(currentCase.offsetMonths)} เดือนเมื่อเทียบกับ`}อายุตามปฏิทิน {ageText(currentCase.chronologicalAgeMonths)} แพทย์ต้องตรวจภาพ ตำแหน่ง ROI และ XAI ก่อนบันทึกผล</> : <><strong>Research result:</strong> The model estimated {ageText(currentCase.predictedAgeMonths)} ({currentCase.predictedAgeMonths} months). This is {Math.abs(currentCase.offsetMonths) < 3 ? 'close to' : currentCase.offsetMonths > 0 ? `${Math.abs(currentCase.offsetMonths)} months above` : `${Math.abs(currentCase.offsetMonths)} months below`} chronological age. A clinician must review the radiograph, ROI boxes, and XAI before recording an assessment.</>}
          </p>
        </div>

        {/* Visual Evidence Thumbnails & XAI */}
        <div className="border border-[#c3c6d4]/40 rounded-xl p-5 space-y-4">
          <h3 className="font-headline-sm text-sm font-bold text-[#002e6f]">
            {reportLang === 'th' ? 'หลักฐานภาพถ่ายและการวิเคราะห์ XAI' : 'Imaging & XAI Evidence'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#05070a] p-3 rounded-lg flex flex-col items-center">
              <span className="text-white/60 font-data-mono text-[10px] mb-2">{isThai ? 'ภาพรังสีต้นฉบับ' : 'Original Radiograph'}</span>
              <AuthenticatedImage
                src={currentCase.xrayImageUrl}
                alt="Radiograph Evidence"
                className="max-h-40 object-contain rounded"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="bg-[#05070a] p-3 rounded-lg flex flex-col items-center justify-center min-h-44">
              <span className="text-[#9deee5] font-data-mono text-[10px] mb-2">{currentCase.xaiMethod || 'Patient-specific XAI'}</span>
              {currentCase.xaiHeatmapUrl ? (
                <AuthenticatedImage src={currentCase.xaiHeatmapUrl} alt="Patient-specific XAI evidence" className="max-h-40 object-contain rounded" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-white/60 text-xs">{isThai ? 'ยังไม่ได้สร้าง XAI' : 'XAI not generated'}</span>
              )}
            </div>
          </div>

          <div className="text-xs space-y-1 text-[#434752]">
            <p><strong>{isThai ? 'ค่าน้ำหนักส่วนสำคัญสูงสุด:' : 'Primary regional gate weights:'}</strong> {topAttributions.length ? topAttributions.map((roi) => `${roi.code} ${((roi.xaiImportance || 0) * 100).toFixed(1)}%`).join(', ') : (isThai ? 'ยังไม่ได้คำนวณ' : 'Not calculated')}.</p>
            <p><strong>{isThai ? 'การประกันคุณภาพ:' : 'Quality assurance:'}</strong> {isThai ? `ยอมรับ ROI ${currentCase.roisAccepted}/${currentCase.roisTotal} จุด; สถานะภาพ ${currentCase.imageQualityCheck}` : `${currentCase.roisAccepted}/${currentCase.roisTotal} required ROI detections accepted; image gate ${currentCase.imageQualityCheck.toLowerCase()}`}.</p>
          </div>
        </div>

        {/* Provenance & Signatures */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#c3c6d4]/40 text-xs">
          <div className="space-y-1 font-data-mono text-[#737784]">
            <p><strong>{isThai ? 'โมเดล:' : 'Model:'}</strong> {currentCase.modelId} ({currentCase.modelArchitecture})</p>
            <p><strong>{isThai ? 'มาตรฐาน:' : 'Standard:'}</strong> {currentCase.growthStandard}</p>
            <p><strong>{isThai ? 'รหัสการทดลอง:' : 'Experiment ID:'}</strong> {currentCase.experimentId}</p>
            <p><strong>{isThai ? 'ซอฟต์แวร์:' : 'Software:'}</strong> Skeleton Bone Age Clinical Prototype v2.1</p>
          </div>

          <div className="space-y-4 sm:text-right">
            <div>
              <p className="font-bold text-[#1a1b21]">{isThai ? 'รังสีแพทย์ผู้ทบทวน' : 'Attending Pediatric Radiologist'}</p>
              <div className="h-10 border-b border-[#c3c6d4] max-w-[200px] ml-auto"></div>
              <p className="text-[11px] text-[#737784] mt-1">{isThai ? 'ชื่อผู้ทบทวนและเลขที่ใบอนุญาตวิชาชีพ' : 'Reviewer name and professional identification'}</p>
              <p className="text-[10px] text-[#737784] font-data-mono">{isThai ? 'ยืนยันเมื่อ' : 'Verified'}: {new Date().toLocaleDateString(isThai ? 'th-TH' : 'en-US')}</p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-3 bg-[#ededf5] rounded-lg text-[10px] text-[#737784] leading-relaxed text-center">
          {isThai ? <><strong>ข้อจำกัดของระบบต้นแบบงานวิจัย:</strong> เอกสารนี้สร้างโดยระบบ Skeleton Bone Age เพื่อช่วยคำนวณเท่านั้น แพทย์ผู้มีใบอนุญาตต้องประเมินและยืนยันผลอย่างอิสระ</> : <><strong>Research Prototype Disclaimer:</strong> This document was generated by the Skeleton Bone Age research system. It provides computational assistance and must be independently evaluated by a licensed medical practitioner.</>}
        </div>
      </div>

      {/* Floating Bottom Footer Bar */}
      <footer className="fixed bottom-0 left-0 md:left-[264px] right-0 h-16 z-30 flex items-center justify-between px-4 md:px-8 bg-white border-t border-[#c3c6d4]/50 shadow-xs print:hidden">
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
            onClick={handlePrint}
            className="font-label-caps text-xs bg-[#9deee5] text-[#0c6f67] font-bold rounded-lg px-5 py-2 hover:brightness-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            <span>{language === 'th' ? 'ส่งออก PDF' : 'Export PDF'}</span>
          </button>
          <button
            onClick={handleFinalize}
            className={`font-label-caps text-xs px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
              isFinalized
                ? 'bg-[#006a63] text-white'
                : 'bg-[#002e6f] hover:bg-[#00439b] text-white active:scale-98'
            }`}
          >
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{isFinalized ? (isThai ? 'ยืนยันรายงานแล้ว ✓' : 'Report Finalized ✓') : (isThai ? 'ยืนยันและลงนามรายงาน' : 'Finalize & Sign Report')}</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
