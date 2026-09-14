import React from 'react';
import { Language } from '../types';

interface ReferencesViewProps {
  language: Language;
}

export const ReferencesView: React.FC<ReferencesViewProps> = ({ language }) => {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-20">
      <div>
        <h2 className="font-headline-md text-2xl md:text-3xl text-[#1a1b21] font-bold">
          {language === 'th' ? 'เอกสารอ้างอิงและเกณฑ์มาตรฐาน' : 'Clinical References & Standards'}
        </h2>
        <p className="font-body-md text-sm text-[#434752] mt-0.5">
          Standard pediatric growth atlases, radiographic guidelines, and XAI research documentation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ref 1: Thai Standard */}
        <div className="bg-white rounded-xl p-6 border border-[#c3c6d4]/40 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006a63] text-2xl">verified_user</span>
            <h3 className="font-headline-sm text-base font-bold text-[#006a63]">
              Thai Department of Health (2020)
            </h3>
          </div>
          <p className="font-body-md text-xs text-[#434752] leading-relaxed">
            National standard reference curves for weight, height, and body mass index of Thai children and adolescents aged 5–19 years.
          </p>
          <div className="pt-2 text-xs font-data-mono text-[#737784]">
            Bureau of Nutrition, Department of Health, Ministry of Public Health, Thailand.
          </div>
        </div>

        {/* Ref 2: Greulich and Pyle */}
        <div className="bg-white rounded-xl p-6 border border-[#c3c6d4]/40 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#002e6f] text-2xl">menu_book</span>
            <h3 className="font-headline-sm text-base font-bold text-[#002e6f]">
              Greulich & Pyle Atlas (1959)
            </h3>
          </div>
          <p className="font-body-md text-xs text-[#434752] leading-relaxed">
            Radiographic Atlas of Skeletal Development of the Hand and Wrist. Standardized reference photographs for pediatric skeletal maturation.
          </p>
          <div className="pt-2 text-xs font-data-mono text-[#737784]">
            Stanford University Press, 2nd Edition.
          </div>
        </div>

        {/* Ref 3: Tanner-Whitehouse (TW3) */}
        <div className="bg-white rounded-xl p-6 border border-[#c3c6d4]/40 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004e62] text-2xl">straighten</span>
            <h3 className="font-headline-sm text-base font-bold text-[#004e62]">
              Tanner-Whitehouse 3 (TW3) System
            </h3>
          </div>
          <p className="font-body-md text-xs text-[#434752] leading-relaxed">
            Quantitative bone scoring methodology analyzing 13 individual regions of interest (Radius, Ulna, Short Bones, and Carpal bones).
          </p>
          <div className="pt-2 text-xs font-data-mono text-[#737784]">
            Assessment of Skeletal Maturity and Prediction of Adult Height, WB Saunders.
          </div>
        </div>

        {/* Ref 4: deployed explainability method */}
        <div className="bg-white rounded-xl p-6 border border-[#c3c6d4]/40 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2b5bb3] text-2xl">science</span>
            <h3 className="font-headline-sm text-base font-bold text-[#2b5bb3]">
              {language === 'th' ? 'ระบบวิเคราะห์ 9 ตำแหน่งและหลักฐาน AI' : 'Nine-region analysis with AI evidence'}
            </h3>
          </div>
          <p className="font-body-md text-xs text-[#434752] leading-relaxed">
            Explainable AI deep learning framework with hierarchical ROI attention pooling, validated against pediatric cohort datasets.
          </p>
          <div className="pt-2 text-xs font-data-mono text-[#737784]">
            {language === 'th' ? 'รายละเอียดสถาปัตยกรรมและรุ่นทดลองเก็บไว้ในบันทึก provenance สำหรับผู้วิจัย' : 'Architecture and experiment identifiers are retained in the researcher provenance record.'}
          </div>
        </div>
      </div>
    </div>
  );
};
