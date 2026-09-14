import React from 'react';
import { Language, UserProfile } from '../types';

interface TopAppBarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  user: UserProfile;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onToggleMobileMenu?: () => void;
  onNavigateHome: () => void;
  onSearchSubmit: () => void;
  storageStatus: 'saved' | 'saving' | 'local';
  lastSavedAt?: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  language,
  onLanguageChange,
  user,
  searchQuery,
  onSearchChange,
  onOpenNotifications,
  onOpenSettings,
  onToggleMobileMenu,
  onNavigateHome,
  onSearchSubmit,
  storageStatus,
  lastSavedAt,
}) => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-16 bg-white border-b border-[#c3c6d4]/40 shadow-xs">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-[#002e6f] hover:bg-[#f4f7fb] transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        )}
        <button
          onClick={onNavigateHome}
          className="font-display-lg text-2xl md:text-3xl text-[#002e6f] hover:opacity-90 transition-opacity tracking-tight text-left cursor-pointer"
        >
          Skeleton Bone Age
        </button>
      </div>

      {/* Center Search Bar */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSearchSubmit();
        }}
        className="flex-1 max-w-md mx-4 md:mx-8 hidden sm:flex items-center bg-[#ededf5] rounded-full px-4 py-2 border border-[#c3c6d4]/60 focus-within:border-[#002e6f] focus-within:bg-white transition-all"
      >
        <span className="material-symbols-outlined text-[#434752] mr-2 text-xl">search</span>
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={language === 'th' ? 'ค้นหา Case ID หรือชื่อผู้ป่วย...' : 'Search Case ID or Patient...'}
          className="bg-transparent border-none outline-none w-full text-sm text-[#1a1b21] placeholder-[#434752]/60 p-0 focus:ring-0"
          type="text"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="text-[#434752] hover:text-[#002e6f] text-sm ml-1"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        )}
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3 md:gap-5">
        <div
          className="hidden xl:flex items-center gap-1.5 text-[11px] text-[#61718a] whitespace-nowrap"
          title={lastSavedAt || undefined}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              storageStatus === 'saved'
                ? 'bg-[#006a63]'
                : storageStatus === 'saving'
                ? 'bg-[#784d00] animate-pulse'
                : 'bg-[#737784]'
            }`}
          />
          <span>
            {storageStatus === 'saved'
              ? language === 'th' ? 'บันทึกแล้ว' : 'Saved'
              : storageStatus === 'saving'
              ? language === 'th' ? 'กำลังบันทึก' : 'Saving'
              : language === 'th' ? 'บันทึกในเครื่อง' : 'Saved locally'}
          </span>
        </div>
        {/* Language Switcher */}
        <div className="flex items-center gap-1 bg-[#f3f3fb] border border-[#c3c6d4]/50 rounded-lg p-1">
          <button
            onClick={() => onLanguageChange('th')}
            className={`font-label-caps text-xs px-2.5 py-1 rounded transition-all ${
              language === 'th'
                ? 'bg-white text-[#002e6f] font-bold shadow-xs'
                : 'text-[#434752] hover:text-[#002e6f]'
            }`}
          >
            ไทย
          </button>
          <button
            onClick={() => onLanguageChange('en')}
            className={`font-label-caps text-xs px-2.5 py-1 rounded transition-all ${
              language === 'en'
                ? 'bg-white text-[#002e6f] font-bold shadow-xs'
                : 'text-[#434752] hover:text-[#002e6f]'
            }`}
          >
            EN
          </button>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenNotifications}
            className="text-[#434752] hover:bg-[#ededf5] hover:text-[#002e6f] transition-colors p-2 rounded-full flex items-center justify-center relative cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
          </button>

          <button
            onClick={onOpenSettings}
            className="text-[#434752] hover:bg-[#ededf5] hover:text-[#002e6f] transition-colors p-2 rounded-full flex items-center justify-center cursor-pointer"
            title="Settings"
          >
            <span className="material-symbols-outlined text-xl">settings</span>
          </button>
        </div>

        {/* Profile Avatar */}
        <div
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-full overflow-hidden bg-[#e2e2ea] border border-[#c3c6d4] shadow-xs cursor-pointer hover:ring-2 hover:ring-[#002e6f]/30 transition-all shrink-0"
          title={`${user.name} (${user.role})`}
        >
          {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <span className="material-symbols-outlined w-full h-full flex items-center justify-center text-[#002e6f]">person</span>}
        </div>
      </div>
    </header>
  );
};
