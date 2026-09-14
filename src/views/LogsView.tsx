import React from 'react';
import { AuditEvent, Language } from '../types';

interface LogsViewProps {
  language: Language;
  logs: AuditEvent[];
}

export const LogsView: React.FC<LogsViewProps> = ({ language, logs }) => {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-20">
      <div>
        <h2 className="font-headline-md text-2xl md:text-3xl text-[#1a1b21] font-bold">
          {language === 'th' ? 'บันทึกการทำงานของระบบ (System & Audit Logs)' : 'System & Audit Logs'}
        </h2>
        <p className="font-body-md text-sm text-[#434752] mt-0.5">
          Real-time execution telemetry, inference checkpoints, and user action audit trail.
        </p>
      </div>

      <div className="bg-[#05070a] text-white/90 rounded-xl p-5 font-data-mono text-xs border border-[#c3c6d4]/40 shadow-md space-y-2 overflow-x-auto">
        <div className="text-white/40 pb-2 border-b border-white/10 flex justify-between">
          <span>TIMESTAMP</span>
          <span>LEVEL • MODULE • MESSAGE</span>
        </div>
        {logs.length === 0 && (
          <div className="py-8 text-center text-white/50">
            {language === 'th' ? 'ยังไม่มีเหตุการณ์ที่บันทึกไว้' : 'No saved audit events yet.'}
          </div>
        )}
        {logs.map((l) => (
          <div key={l.id} className="flex gap-4 items-start hover:bg-white/5 p-1 rounded transition-colors">
            <span className="text-[#737784] shrink-0">
              {new Date(l.timestamp).toLocaleString(language === 'th' ? 'th-TH' : 'en-US')}
            </span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                l.level === 'WARN'
                  ? 'bg-[#ba1a1a] text-white'
                  : l.level === 'AUDIT'
                  ? 'bg-[#006a63] text-white'
                  : 'bg-[#002e6f] text-[#9deee5]'
              }`}
            >
              {l.level}
            </span>
            <span className="text-[#96b5ff] shrink-0">[{l.module}]</span>
            <span className="text-white/80">{l.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
