import React from 'react';
import { AppView, Language } from '../types';

interface SideNavBarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  language: Language;
  pendingReviewCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: AppView;
  labelEn: string;
  labelTh: string;
  icon: string;
  badge?: number | string;
}

const mainNavItems: NavItem[] = [
  { id: 'overview', labelEn: 'Overview', labelTh: 'ภาพรวม', icon: 'dashboard' },
  { id: 'cases', labelEn: 'Cases', labelTh: 'รายการเคส', icon: 'folder_shared' },
  { id: 'screening', labelEn: 'Screening', labelTh: 'คัดกรองเบื้องต้น', icon: 'clinical_notes' },
  { id: 'intake', labelEn: 'Intake', labelTh: 'บันทึกข้อมูลผู้ป่วย', icon: 'person_add' },
  { id: 'imaging', labelEn: 'Imaging', labelTh: 'ประมวลผลภาพ', icon: 'radiology' },
  { id: 'prediction', labelEn: 'Prediction', labelTh: 'ผลการทำนาย', icon: 'analytics' },
  { id: 'xai', labelEn: 'XAI', labelTh: 'คำอธิบาย AI', icon: 'visibility' },
  { id: 'report', labelEn: 'Report', labelTh: 'รายงานผล', icon: 'description' },
  { id: 'checklist', labelEn: 'Checklist', labelTh: 'รายการตรวจสอบ', icon: 'fact_check' },
  { id: 'review-queue', labelEn: 'Review Queue', labelTh: 'คิวรอตรวจสอบ', icon: 'inventory_2', badge: 34 },
  { id: 'references', labelEn: 'References', labelTh: 'เอกสารอ้างอิง', icon: 'menu_book' },
];

const secondaryNavItems: NavItem[] = [
  { id: 'help', labelEn: 'Help', labelTh: 'คู่มือใช้งาน', icon: 'help' },
  { id: 'support', labelEn: 'Support', labelTh: 'ฝ่ายสนับสนุน', icon: 'contact_support' },
  { id: 'logs', labelEn: 'Logs', labelTh: 'บันทึกการทำงาน', icon: 'history' },
  { id: 'settings', labelEn: 'Settings', labelTh: 'การตั้งค่า', icon: 'settings' },
];

export const SideNavBar: React.FC<SideNavBarProps> = ({
  currentView,
  onNavigate,
  language,
  pendingReviewCount = 34,
  isOpenMobile,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-[264px] z-40 flex flex-col py-6 overflow-y-auto bg-[#ededf5] border-r border-[#c3c6d4]/40 pt-20 transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header Prototype Branding */}
        <div className="px-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#002e6f]/10 flex items-center justify-center text-[#002e6f] shadow-xs">
              <span className="material-symbols-outlined text-2xl">science</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-lg text-[#002e6f] font-bold leading-tight">
                Skeleton Bone Age
              </h2>
              <p className="font-caption text-xs text-[#434752]">
                {language === 'th' ? 'โปรแกรมต้นแบบทางคลินิก' : 'Clinical Prototype'}
              </p>
            </div>
          </div>

          <div className="mt-3 bg-[#004e62]/10 border border-[#004e62]/20 rounded-md p-2">
            <p className="font-data-mono text-[#004e62] text-[11px] text-center uppercase tracking-wider font-bold">
              Research Prototype
            </p>
          </div>
        </div>

        {/* Primary Navigation List */}
        <div className="flex-1 px-3 space-y-1">
          {mainNavItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all duration-150 text-left ${
                  isActive
                    ? 'text-[#002e6f] font-bold border-r-4 border-[#002e6f] bg-[#002e6f]/10 translate-x-1 shadow-xs'
                    : 'text-[#434752] hover:bg-[#e2e2ea] opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-xl ${
                      isActive ? 'fill text-[#002e6f]' : 'text-[#434752]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="font-label-caps tracking-wide">
                    {language === 'th' ? item.labelTh : item.labelEn}
                  </span>
                </div>

                {item.id === 'review-queue' && pendingReviewCount > 0 && (
                  <span className="bg-[#ba1a1a] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {pendingReviewCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Navigation List */}
        <div className="px-3 mt-auto space-y-1 border-t border-[#c3c6d4]/40 pt-4">
          {secondaryNavItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors text-left ${
                  isActive
                    ? 'text-[#002e6f] font-bold bg-[#002e6f]/10'
                    : 'text-[#434752] opacity-75 hover:bg-[#e2e2ea] hover:opacity-100'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                <span className="font-label-caps text-xs">
                  {language === 'th' ? item.labelTh : item.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
};
