import React from 'react';
import { Language } from '../types';

interface HelpSupportViewProps {
  type: 'help' | 'support';
  language: Language;
}

export const HelpSupportView: React.FC<HelpSupportViewProps> = ({ type, language }) => {
  if (type === 'help') {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-20">
        <div>
          <h2 className="font-headline-md text-2xl md:text-3xl text-[#1a1b21] font-bold">
            {language === 'th' ? 'คู่มือการใช้งานระบบ Skeleton Bone Age' : 'User Manual & Workflow Guide'}
          </h2>
          <p className="font-body-md text-sm text-[#434752] mt-0.5">
            Step-by-step guidance for radiograph evaluation, ROI validation, and XAI interpretation.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 border border-[#c3c6d4]/40 shadow-xs">
            <h3 className="font-headline-sm text-base font-bold text-[#002e6f] mb-2">
              1. Preliminary Screening & Demographics
            </h3>
            <p className="text-xs text-[#434752] leading-relaxed">
              Verify exact patient Date of Birth and biological sex. The calculated chronological age establishes the baseline benchmark for developmental deviation calculations.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#c3c6d4]/40 shadow-xs">
            <h3 className="font-headline-sm text-base font-bold text-[#002e6f] mb-2">
              2. Imaging & Region of Interest (ROI) Extraction
            </h3>
            <p className="text-xs text-[#434752] leading-relaxed">
              Examine the automatically segmented ossification centers (Radius, Ulna, Carpal bones, Metacarpals, and Phalanges). Toggle the bounding boxes, zoom in to inspect epiphyseal borders, and flag any misaligned areas.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#c3c6d4]/40 shadow-xs">
            <h3 className="font-headline-sm text-base font-bold text-[#002e6f] mb-2">
              3. Explainable AI (XAI) Attribution Maps
            </h3>
            <p className="text-xs text-[#434752] leading-relaxed">
              Use the attribution opacity slider to inspect patient-specific Input × Gradient evidence and verify that highlighted pixels are anatomically plausible.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#c3c6d4]/40 shadow-xs">
            <h3 className="font-headline-sm text-base font-bold text-[#002e6f] mb-2">
              4. Clinical Verification & Finalization
            </h3>
            <p className="text-xs text-[#434752] leading-relaxed">
              Complete the safety checklist and generate bilingual clinical reports formatted for medical record archiving.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h2 className="font-headline-md text-2xl md:text-3xl text-[#1a1b21] font-bold">
          {language === 'th' ? 'ติดต่อฝ่ายสนับสนุนและทีมวิจัย' : 'Research Team & Support Contact'}
        </h2>
        <p className="font-body-md text-sm text-[#434752] mt-0.5">
          For technical issues, dataset feedback, or clinical trial collaboration.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-[#c3c6d4]/40 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#002e6f] text-3xl">contact_support</span>
          <div>
            <h3 className="font-headline-sm text-base font-bold text-[#002e6f]">
              Skeleton Bone Age Research Consortium
            </h3>
            <p className="text-xs text-[#737784]">Pediatric Radiology AI Decision Support Initiative</p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#c3c6d4]/30 space-y-2 text-xs font-body-md text-[#434752]">
          <p><strong>Support:</strong> Configure the responsible research unit's verified contact before deployment.</p>
          <p><strong>{language === 'th' ? 'ระบบที่ใช้งาน:' : 'Active system:'}</strong> {language === 'th' ? 'ระบบวิเคราะห์อายุกระดูกและตัวตรวจตำแหน่งกายวิภาค 9 จุด' : 'Bone-age analysis with nine-region anatomy detection'}</p>
          <p><strong>Status:</strong> Local Research MVP — physician review required</p>
        </div>
      </div>
    </div>
  );
};
