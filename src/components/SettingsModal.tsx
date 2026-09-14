import React, { useEffect, useState } from 'react';
import { Language, UserProfile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  user: UserProfile;
  onSignOut: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  user,
  onSignOut,
}) => {
  const [defaultGrowthStandard, setDefaultGrowthStandard] = useState(
    () => window.localStorage.getItem('boneage-xai:default-growth-standard') || 'Thai Department of Health (2020)'
  );
  const [defaultXaiMethod, setDefaultXaiMethod] = useState(
    () => window.localStorage.getItem('boneage-xai:default-xai-method') || 'Input × Gradient'
  );
  const [highContrast, setHighContrast] = useState(
    () => window.localStorage.getItem('boneage-xai:high-contrast') === 'true'
  );

  useEffect(() => {
    window.localStorage.setItem('boneage-xai:default-growth-standard', defaultGrowthStandard);
    window.localStorage.setItem('boneage-xai:default-xai-method', defaultXaiMethod);
    window.localStorage.setItem('boneage-xai:high-contrast', String(highContrast));
    document.documentElement.classList.toggle('high-contrast-xray', highContrast);
  }, [defaultGrowthStandard, defaultXaiMethod, highContrast]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-[#c3c6d4] overflow-hidden">
        <div className="p-4 border-b border-[#c3c6d4]/40 flex justify-between items-center bg-[#f3f3fb]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#002e6f]">settings</span>
            <h3 className="font-headline-sm text-base text-[#002e6f] font-bold">
              {language === 'th' ? 'การตั้งค่าระบบ Skeleton Bone Age' : 'Skeleton Bone Age Preferences'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#434752] hover:bg-[#ededf5] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* User Account summary */}
          <div className="flex items-center gap-4 p-3 bg-[#f8f9ff] rounded-lg border border-[#c3c6d4]/40">
            {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover border border-[#002e6f]/30" referrerPolicy="no-referrer" /> : <span className="material-symbols-outlined w-12 h-12 rounded-full border border-[#002e6f]/30 flex items-center justify-center text-[#002e6f]">person</span>}
            <div>
              <h4 className="font-headline-sm text-sm text-[#002e6f] font-bold">{user.name}</h4>
              <p className="font-caption text-xs text-[#434752]">{user.role}{user.email ? ` • ${user.email}` : ''}</p>
              <span className="inline-block mt-1 font-data-mono text-[10px] bg-[#004e62]/10 text-[#004e62] px-2 py-0.5 rounded font-bold">
                Research Sandbox Account
              </span>
            </div>
          </div>

          {/* Language selection */}
          <div>
            <label className="block font-label-caps text-xs text-[#434752] mb-1">
              {language === 'th' ? 'ภาษาเริ่มต้น (Display Language)' : 'Display Language'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onLanguageChange('th')}
                className={`py-2 px-3 rounded-lg border text-xs font-label-caps transition-all ${
                  language === 'th'
                    ? 'border-[#002e6f] bg-[#002e6f]/10 text-[#002e6f] font-bold'
                    : 'border-[#c3c6d4] text-[#434752]'
                }`}
              >
                ภาษาไทย (Thai)
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`py-2 px-3 rounded-lg border text-xs font-label-caps transition-all ${
                  language === 'en'
                    ? 'border-[#002e6f] bg-[#002e6f]/10 text-[#002e6f] font-bold'
                    : 'border-[#c3c6d4] text-[#434752]'
                }`}
              >
                English (US)
              </button>
            </div>
          </div>

          {/* Growth standard */}
          <div>
            <label className="block font-label-caps text-xs text-[#434752] mb-1">
              {language === 'th' ? 'เกณฑ์มาตรฐานการเจริญเติบโตเริ่มต้น' : 'Default Growth Standard'}
            </label>
            <select
              value={defaultGrowthStandard}
              onChange={(e) => setDefaultGrowthStandard(e.target.value)}
              className="w-full bg-[#f8f9ff] border border-[#c3c6d4] rounded-lg px-3 py-2 text-xs text-[#1a1b21] focus:border-[#002e6f] focus:outline-none"
            >
              <option>Thai Department of Health (2020)</option>
              <option>WHO Child Growth Standards</option>
              <option>CDC Pediatric Growth Charts</option>
            </select>
          </div>

          {/* Default XAI Method */}
          <div>
            <label className="block font-label-caps text-xs text-[#434752] mb-1">
              {language === 'th' ? 'อัลกอริทึม XAI เริ่มต้น' : 'Default XAI Method'}
            </label>
            <select
              value={defaultXaiMethod}
              onChange={(e) => setDefaultXaiMethod(e.target.value)}
              className="w-full bg-[#f8f9ff] border border-[#c3c6d4] rounded-lg px-3 py-2 text-xs text-[#1a1b21] focus:border-[#002e6f] focus:outline-none"
            >
              <option>Input × Gradient</option>
              <option>Score-CAM</option>
              <option>Eigen-CAM</option>
            </select>
          </div>

          {/* Toggle for high contrast view */}
          <div className="flex items-center justify-between pt-2 border-t border-[#c3c6d4]/40">
            <div>
              <div className="font-label-caps text-xs text-[#1a1b21]">
                {language === 'th' ? 'เพิ่มความคมชัด X-Ray อัตโนมัติ' : 'Auto Bone Contrast Enhancement'}
              </div>
              <div className="font-caption text-[11px] text-[#737784]">
                {language === 'th' ? 'ช่วยให้มองเห็นขอบรอยต่อกระดูกได้ชัดเจนยิ่งขึ้น' : 'Improves epiphyseal edge definition in viewer'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              className="w-4 h-4 rounded text-[#002e6f] focus:ring-[#002e6f]"
            />
          </div>
        </div>

        <div className="p-4 border-t border-[#c3c6d4]/40 bg-[#f8f9ff] flex justify-between items-center">
          <button
            onClick={onSignOut}
            className="text-xs font-label-caps text-[#ba1a1a] hover:bg-[#ffdad6] px-3 py-1.5 rounded transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            {language === 'th' ? 'ออกจากระบบ' : 'Sign Out'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#002e6f] text-white rounded-lg font-label-caps text-xs font-bold hover:bg-[#00439b] transition-colors"
          >
            {language === 'th' ? 'บันทึกการตั้งค่า' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
