import React, { useEffect, useState } from 'react';
import { PatientCase, Language } from '../types';

interface CasesViewProps {
  cases: PatientCase[];
  onSelectCase: (caseItem: PatientCase) => void;
  onCreateNewCase: () => void;
  onDeleteCase: (caseItem: PatientCase) => void;
  language: Language;
  initialSearchTerm?: string;
}

export const CasesView: React.FC<CasesViewProps> = ({
  cases,
  onSelectCase,
  onCreateNewCase,
  onDeleteCase,
  language,
  initialSearchTerm = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [timeFilter, setTimeFilter] = useState('Last 7 Days');

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.first.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.last.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All Statuses' ||
      (statusFilter === 'Draft' && c.status === 'Draft') ||
      (statusFilter === 'Review Required' &&
        (c.status === 'Review Required' || c.status === 'Review Req')) ||
      (statusFilter === 'Completed' &&
        (c.status === 'Complete' || c.status === 'Finalized'));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-md text-2xl md:text-3xl text-[#1a1b21] font-bold">
            {language === 'th' ? 'ศูนย์จัดการเคส (Cases Workspace)' : 'Cases Workspace'}
          </h2>
          <p className="font-body-md text-sm text-[#434752] mt-1">
            {language === 'th'
              ? 'จัดการและติดตามผลการประเมินการเจริญเติบโตของกระดูก'
              : 'Manage and track skeletal maturity assessments.'}
          </p>
        </div>

        <button
          onClick={onCreateNewCase}
          className="bg-[#002e6f] hover:bg-[#00439b] text-white font-label-caps text-xs font-bold px-5 py-3 rounded-lg transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-98 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span>{language === 'th' ? 'สร้างเคสใหม่' : 'Create New Case'}</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-[#c3c6d4]/40 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-1 min-w-[280px] items-center bg-[#ededf5] rounded-lg px-4 py-2.5 border border-[#c3c6d4]/60 focus-within:border-[#002e6f] focus-within:bg-white transition-all">
          <span className="material-symbols-outlined text-[#434752] mr-3 text-xl">search</span>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:ring-0 w-full text-sm text-[#1a1b21] placeholder-[#434752]/60 p-0 outline-none font-body-md"
            placeholder={
              language === 'th'
                ? 'ค้นหา Case ID หรือชื่อผู้ป่วย...'
                : 'Search Case ID or Patient...'
            }
            type="text"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-[#434752] hover:text-[#002e6f]"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-[#ededf5] border border-[#c3c6d4]/60 rounded-lg px-4 py-2.5 pr-10 text-xs font-label-caps text-[#1a1b21] focus:border-[#002e6f] focus:ring-0 cursor-pointer"
            >
              <option>All Statuses</option>
              <option>Draft</option>
              <option>Review Required</option>
              <option>Completed</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-3 text-[#434752] pointer-events-none text-base">
              expand_more
            </span>
          </div>

          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="appearance-none bg-[#ededf5] border border-[#c3c6d4]/60 rounded-lg px-4 py-2.5 pr-10 text-xs font-label-caps text-[#1a1b21] focus:border-[#002e6f] focus:ring-0 cursor-pointer"
            >
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>All Time</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-3 text-[#434752] pointer-events-none text-base">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-[#c3c6d4]/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f3f3fb] border-b border-[#c3c6d4]/40">
              <tr>
                <th className="py-4 px-6 font-label-caps text-xs text-[#737784]">Case ID</th>
                <th className="py-4 px-6 font-label-caps text-xs text-[#737784]">Age / Sex</th>
                <th className="py-4 px-6 font-label-caps text-xs text-[#737784]">Current Step</th>
                <th className="py-4 px-6 font-label-caps text-xs text-[#737784]">Status</th>
                <th className="py-4 px-6 font-label-caps text-xs text-[#737784]">Updated</th>
                <th className="py-4 px-6 font-label-caps text-xs text-[#737784] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6d4]/20 text-sm">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#737784]">
                    {language === 'th'
                      ? 'ไม่พบเคสที่ตรงกับเงื่อนไขการค้นหา'
                      : 'No cases found matching your filters.'}
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onSelectCase(c)}
                    className="hover:bg-[#f3f3fb] transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6 font-data-mono font-bold text-[#002e6f]">
                      <div>{c.id}</div>
                      {c.isTestCase && (
                        <span className="inline-flex mt-1 bg-[#ffebc4] text-[#784d00] px-2 py-0.5 rounded text-[10px] font-bold">
                          {language === 'th' ? 'เคสทดสอบ' : 'TEST CASE'}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-[#1a1b21]">
                      {c.isTestCase && c.groundTruthBoneAgeMonths != null
                        ? `${Math.floor(c.groundTruthBoneAgeMonths / 12)}y ${c.groundTruthBoneAgeMonths % 12}m ${language === 'th' ? '(อายุกระดูกจริง)' : '(ground truth)'}`
                        : c.chronologicalAgeDisplay} / {c.sex === 'Male' ? 'M' : 'F'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            c.currentStep === 'Completed'
                              ? 'bg-[#737784]'
                              : c.currentStep === 'Report' || c.currentStep === 'Report Generation'
                              ? 'bg-[#2b5bb3]'
                              : 'bg-[#006a63]'
                          }`}
                        ></span>
                        <span className="text-[#1a1b21]">{c.currentStep}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full font-label-caps text-xs font-bold ${
                          c.status === 'Review Required' || c.status === 'Review Req'
                            ? 'bg-[#ffdad6] text-[#93000a]'
                            : c.status === 'Draft'
                            ? 'bg-[#9deee5] text-[#0c6f67]'
                            : c.status === 'Complete' || c.status === 'Finalized'
                            ? 'bg-[#e2e2ea] text-[#434752]'
                            : 'bg-[#ededf5] text-[#1a1b21]'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#434752] text-xs font-data-mono">{c.updatedAt}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCase(c);
                        }}
                        className="text-[#002e6f] hover:text-[#00439b] p-1.5 rounded-lg hover:bg-[#ededf5] transition-colors"
                        title="Open Case"
                      >
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(language === 'th' ? `ลบเคส ${c.id} และข้อมูลที่บันทึกไว้หรือไม่` : `Delete case ${c.id} and its stored record?`)) onDeleteCase(c);
                        }}
                        className="text-[#93000a] hover:bg-[#ffdad6] p-1.5 rounded-lg transition-colors"
                        title="Delete Case"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
