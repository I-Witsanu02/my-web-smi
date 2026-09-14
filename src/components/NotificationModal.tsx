import React from 'react';
import { Language } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: language === 'th' ? 'ระบบวิเคราะห์และตัวตรวจตำแหน่งกายวิภาคพร้อมใช้งาน' : 'Analysis and anatomy-detection systems are ready',
      time: language === 'th' ? 'สถานะระบบ' : 'System status',
      unread: false,
      icon: 'science',
      iconColor: 'text-[#002e6f]',
      bg: 'bg-[#d9e2ff]',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-[#c3c6d4] overflow-hidden">
        <div className="p-4 border-b border-[#c3c6d4]/40 flex justify-between items-center bg-[#f3f3fb]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#002e6f]">notifications</span>
            <h3 className="font-headline-sm text-base text-[#002e6f] font-bold">
              {language === 'th' ? 'การแจ้งเตือน' : 'Notifications'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#434752] hover:bg-[#ededf5] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3 rounded-lg border flex gap-3 items-start transition-colors ${
                n.unread ? 'bg-[#f8f9ff] border-[#002e6f]/30' : 'bg-white border-[#c3c6d4]/30'
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${n.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                <span className={`material-symbols-outlined text-sm ${n.iconColor}`}>{n.icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-[#1a1b21]">{n.title}</p>
                <span className="text-[10px] text-[#737784] font-data-mono">{n.time}</span>
              </div>
              {n.unread && <span className="w-2 h-2 rounded-full bg-[#ba1a1a] mt-1 shrink-0"></span>}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-[#c3c6d4]/40 bg-[#f8f9ff] text-center">
          <button
            onClick={onClose}
            className="text-xs font-label-caps text-[#002e6f] hover:underline"
          >
            {language === 'th' ? 'รับทราบทั้งหมด' : 'Mark all as read'}
          </button>
        </div>
      </div>
    </div>
  );
};
