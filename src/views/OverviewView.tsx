import React from 'react';
import { PatientCase, Language } from '../types';

interface OverviewViewProps {
  cases: PatientCase[];
  onSelectCase: (caseItem: PatientCase) => void;
  onNewAssessment: () => void;
  onNavigateCases: () => void;
  onNavigateReviewQueue: () => void;
  language: Language;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  cases,
  onSelectCase,
  onNewAssessment,
  onNavigateCases,
  onNavigateReviewQueue,
  language,
}) => {
  const countSteps = (...steps: string[]) => cases.filter((item) => steps.includes(item.currentStep)).length;
  const pendingCount = cases.filter(
    (item) => item.status === 'Review Required' || item.status === 'Review Req'
  ).length;
  const roiTotal = cases.reduce((sum, item) => sum + item.roisTotal, 0);
  const roiAccepted = cases.reduce((sum, item) => sum + item.roisAccepted, 0);
  const roiSuccessRate = roiTotal > 0 ? (roiAccepted / roiTotal) * 100 : 0;
  const chartData = [
    { stage: language === 'th' ? 'บันทึกข้อมูล' : 'Intake', count: countSteps('Screening', 'Intake'), color: '#e2e2ea' },
    { stage: language === 'th' ? 'ภาพถ่าย' : 'Imaging', count: countSteps('Imaging'), color: '#96b5ff' },
    { stage: language === 'th' ? 'ตรวจจับ ROI' : 'ROI', count: countSteps('ROI', 'ROI Selection', 'ROI Extraction'), color: '#004e62' },
    { stage: language === 'th' ? 'ทำนายผล' : 'Prediction', count: countSteps('Prediction', 'XAI', 'XAI Gen', 'Checklist'), color: '#002e6f' },
    { stage: language === 'th' ? 'รายงาน' : 'Report', count: countSteps('Report', 'Report Generation', 'Completed'), color: '#9deee5' },
  ];

  const maxCount = Math.max(1, ...chartData.map((item) => item.count));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-2xl md:text-3xl text-[#1a1b21] font-bold">
            {language === 'th' ? 'ยินดีต้อนรับ, Doctor 1' : 'Welcome, Doctor 1'}
          </h1>
          <p className="font-body-lg text-sm text-[#434752] mt-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#002e6f] text-base">badge</span>
            <span>{language === 'th' ? 'บทบาท: แพทย์ผู้ทบทวน' : 'Role: Clinical Reviewer'}</span>
          </p>
        </div>

        <div className="bg-[#004e62] text-[#9ee4ff] font-data-mono text-xs px-4 py-2 rounded-lg border border-[#004e62]/20 flex items-center gap-2 self-start sm:self-auto shadow-2xs font-semibold">
          <span className="material-symbols-outlined text-sm">info</span>
          <span>Research MVP | Human Review</span>
        </div>
      </div>

      {/* Bento Grid: Metrics + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Metric Cards (Cols 1-8) */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {/* Card 1 */}
          <div className="bg-white rounded-xl p-4 md:p-5 border border-[#c3c6d4]/40 shadow-xs hover:shadow-sm transition-shadow">
            <div className="text-[#434752] flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#002e6f] text-xl">folder_open</span>
              <span className="font-label-caps text-xs text-[#737784]">
                {language === 'th' ? 'เคสทั้งหมด' : 'Total Cases'}
              </span>
            </div>
            <div className="numeric font-headline-md text-2xl font-bold text-[#1a1b21]">{cases.length}</div>
            <div className="font-caption text-xs text-[#006a63] font-semibold mt-1 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-xs">arrow_upward</span>
              <span>{language === 'th' ? 'เก็บถาวรในระบบ' : 'Persisted in workspace'}</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl p-4 md:p-5 border border-[#c3c6d4]/40 shadow-xs hover:shadow-sm transition-shadow">
            <div className="text-[#434752] flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#ba1a1a] text-xl">pending_actions</span>
              <span className="font-label-caps text-xs text-[#737784]">
                {language === 'th' ? 'รอการตรวจ' : 'Pending Review'}
              </span>
            </div>
            <div className="numeric font-headline-md text-2xl font-bold text-[#1a1b21]">{pendingCount}</div>
            <div className="font-caption text-xs text-[#ba1a1a] font-semibold mt-1 flex items-center gap-0.5">
              <span>{language === 'th' ? 'ต้องการตรวจสอบ' : 'Requires Attention'}</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl p-4 md:p-5 border border-[#c3c6d4]/40 shadow-xs hover:shadow-sm transition-shadow">
            <div className="text-[#434752] flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#006a63] text-xl">center_focus_strong</span>
              <span className="font-label-caps text-xs text-[#737784]">
                {language === 'th' ? 'สัดส่วน ROI ที่ผ่านการตรวจ' : 'Accepted ROI Rate'}
              </span>
            </div>
            <div className="numeric font-headline-md text-2xl font-bold text-[#1a1b21]">{roiSuccessRate.toFixed(1)}%</div>
            <div className="font-caption text-xs text-[#434752] mt-1">Automated extraction</div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-xl p-4 md:p-5 border border-[#c3c6d4]/40 shadow-xs hover:shadow-sm transition-shadow">
            <div className="text-[#434752] flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#004e62] text-xl">timer</span>
              <span className="font-label-caps text-xs text-[#737784]">
                {language === 'th' ? 'ทำนายแล้ว' : 'Predicted Cases'}
              </span>
            </div>
            <div className="font-headline-md text-2xl font-bold text-[#1a1b21]">{cases.filter((item) => item.rawPredictedAgeMonths != null).length}</div>
            <div className="font-caption text-xs text-[#006a63] font-semibold mt-1">Calculated by active model</div>
            <div className="mt-2 text-[10px] font-label-caps text-[#737784] bg-[#e2e2ea]/60 px-2 py-0.5 rounded w-fit">
              Live local data
            </div>
          </div>
        </div>

        {/* Quick Actions (Cols 9-12) */}
        <div className="col-span-12 lg:col-span-4 bg-[#f3f3fb] rounded-xl p-5 md:p-6 border border-[#c3c6d4]/40 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="font-headline-sm text-base text-[#1a1b21] font-bold mb-4">
              {language === 'th' ? 'การทำงานด่วน' : 'Quick Actions'}
            </h3>
            <div className="space-y-3">
              <button
                onClick={onNewAssessment}
                className="w-full bg-[#002e6f] text-white hover:bg-[#00439b] transition-all py-3 px-4 rounded-lg font-label-caps text-xs font-bold flex items-center justify-between shadow-xs cursor-pointer active:scale-98"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">add_box</span>
                  <span>{language === 'th' ? 'สร้างการประเมินใหม่' : 'New Assessment'}</span>
                </span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>

              <button
                onClick={onNavigateCases}
                className="w-full bg-white text-[#1a1b21] border border-[#c3c6d4] hover:bg-[#ededf5] transition-colors py-3 px-4 rounded-lg font-label-caps text-xs font-bold flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-[#002e6f]">folder</span>
                  <span>{language === 'th' ? 'เปิดรายการเคสทั้งหมด' : 'Open Cases'}</span>
                </span>
              </button>

              <button
                onClick={onNavigateReviewQueue}
                className="w-full bg-white text-[#1a1b21] border border-[#c3c6d4] hover:bg-[#ededf5] transition-colors py-3 px-4 rounded-lg font-label-caps text-xs font-bold flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-[#006a63]">inventory_2</span>
                  <span>{language === 'th' ? 'คิวรอตรวจสอบ (Review Queue)' : 'Review Queue'}</span>
                </span>
                <span className="bg-[#ba1a1a] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {pendingCount}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Recent Cases + Workflow Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Cases Table (Cols 1-8) */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-[#c3c6d4]/40 overflow-hidden flex flex-col shadow-xs">
          <div className="p-4 md:p-5 border-b border-[#c3c6d4]/40 flex justify-between items-center bg-[#faf8ff]">
            <h3 className="font-headline-sm text-base text-[#1a1b21] font-bold">
              {language === 'th' ? 'เคสการตรวจล่าสุด' : 'Recent Cases'}
            </h3>
            <button
              onClick={onNavigateCases}
              className="text-[#002e6f] hover:underline font-label-caps text-xs font-bold cursor-pointer"
            >
              {language === 'th' ? 'ดูทั้งหมด' : 'View All'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f3f3fb] border-b border-[#c3c6d4]/40">
                  <th className="p-4 font-label-caps text-xs text-[#737784]">Case ID</th>
                  <th className="p-4 font-label-caps text-xs text-[#737784]">Age/Sex</th>
                  <th className="p-4 font-label-caps text-xs text-[#737784]">Last Step</th>
                  <th className="p-4 font-label-caps text-xs text-[#737784]">Status</th>
                  <th className="p-4 font-label-caps text-xs text-[#737784]">Date</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6d4]/20 text-sm">
                {cases.slice(0, 4).map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectCase(item)}
                    className="hover:bg-[#f3f3fb] transition-colors cursor-pointer group"
                  >
                    <td className="p-4 font-data-mono font-bold text-[#002e6f]">{item.id}</td>
                    <td className="p-4 text-[#1a1b21]">{item.chronologicalAgeDisplay} / {item.sex === 'Male' ? 'M' : 'F'}</td>
                    <td className="p-4 text-[#434752]">{item.lastStep}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded font-label-caps text-[10px] font-bold ${
                          item.status === 'Complete' || item.status === 'Finalized'
                            ? 'bg-[#9deee5] text-[#0c6f67]'
                            : item.status === 'Review Required' || item.status === 'Review Req'
                            ? 'bg-[#ffdad6] text-[#93000a]'
                            : 'bg-[#e2e2ea] text-[#1a1b21]'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-[#434752] text-xs font-data-mono">{item.updatedAt}</td>
                    <td className="p-4 text-right">
                      <span className="material-symbols-outlined text-[#737784] opacity-0 group-hover:opacity-100 transition-opacity">
                        chevron_right
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Workflow Progress Bar Chart (Cols 9-12) */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-[#c3c6d4]/40 p-5 flex flex-col shadow-xs justify-between">
          <div>
            <h3 className="font-headline-sm text-base text-[#1a1b21] font-bold mb-1">
              {language === 'th' ? 'ความคืบหน้าของงาน' : 'Workflow Progress'}
            </h3>
            <p className="font-caption text-xs text-[#434752] mb-6">
              {language === 'th'
                ? 'การกระจายของเคสตามขั้นตอน (7 วันล่าสุด)'
                : 'Distribution of cases by current stage (Last 7 Days)'}
            </p>

            {/* Custom SVG / Bar Chart Representation */}
            <div className="space-y-4 pt-2">
              {chartData.map((item) => {
                const percentage = (item.count / maxCount) * 100;
                return (
                  <div key={item.stage} className="space-y-1">
                    <div className="flex justify-between text-xs font-label-caps">
                      <span className="text-[#434752]">{item.stage}</span>
                      <span className="font-data-mono text-[#002e6f] font-bold">{item.count} cases</span>
                    </div>
                    <div className="w-full bg-[#ededf5] h-3.5 rounded-full overflow-hidden flex">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#c3c6d4]/30 flex justify-between text-xs text-[#737784] font-data-mono">
            <span>Total In-Flight: {cases.filter((item) => item.currentStep !== 'Completed').length} cases</span>
            <span className="text-[#006a63] font-bold">Completed: {cases.filter((item) => item.currentStep === 'Completed').length}</span>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="mt-8 pt-6 border-t border-[#c3c6d4]/30 pb-6">
        <p className="font-caption text-xs text-[#737784] text-center max-w-3xl mx-auto leading-relaxed">
          {language === 'th'
            ? 'ข้อจำกัดความรับผิดชอบ: ระบบนี้มีวัตถุประสงค์เพื่อการวิจัยเป็นโปรแกรมต้นแบบทางคลินิกเท่านั้น ผลการทำนายและ Region of Interest (ROI) จาก Skeleton Bone Age ไม่สามารถใช้เป็นข้อสรุปเดี่ยวในการวินิจฉัยทางการแพทย์ การประเมินทั้งหมดต้องได้รับการตรวจทานและยืนยันโดยกุมารรังสีแพทย์หรือแพทย์ผู้เชี่ยวชาญ'
            : 'Disclaimer: This system is intended for research purposes only as a Clinical Prototype. The Skeleton Bone Age predictions and extracted Regions of Interest (ROI) should not be used as the sole basis for clinical diagnosis or treatment decisions. All automated assessments must be reviewed and verified by a qualified pediatric radiologist or attending physician.'}
        </p>
      </div>
    </div>
  );
};
