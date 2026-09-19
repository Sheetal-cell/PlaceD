import React from 'react';
import {
  X,
  LayoutDashboard,
  Briefcase,
  GitMerge
} from 'lucide-react';
import type { RecruiterTabType } from './RecruiterSidebar';
import type { Recruiter } from '../../mockData';

interface RecruiterMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: RecruiterTabType;
  setActiveTab: (tab: RecruiterTabType) => void;
  recruiter: Recruiter;
}

export const RecruiterMobileDrawer: React.FC<RecruiterMobileDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  recruiter
}) => {
  if (!isOpen) return null;

  const navItems = [
    { id: 'dashboard' as RecruiterTabType, label: 'Hiring Dashboard', icon: LayoutDashboard },
    { id: 'drives' as RecruiterTabType, label: 'Company Drives', icon: Briefcase },
    { id: 'tracker' as RecruiterTabType, label: 'Applicant Tracker', icon: GitMerge }
  ];

  return (
    <>
      <div className="rp-mobile-overlay md:hidden" onClick={onClose} />
      <div className="rp-mobile-drawer md:hidden">
        {/* Drawer Header with Prominent Close Button (✕) */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 font-display">Navigation</span>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center shrink-0 min-w-[40px] min-h-[40px]"
            title="Close Drawer (✕)"
            aria-label="Close Drawer"
          >
            <X size={24} className="shrink-0 text-slate-700" />
          </button>
        </div>

        {/* Recruiter Profile Info Pill (Compact & Polished) */}
        <div className="mx-4 mt-3 mb-1 p-3 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            {recruiter.companyName ? recruiter.companyName.charAt(0).toUpperCase() : 'R'}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-extrabold text-slate-900 font-display truncate">
              {recruiter.name}
            </span>
            <span className="text-[11px] text-sky-600 font-extrabold uppercase tracking-wider truncate mt-0.5">
              {recruiter.companyName}
            </span>
          </div>
        </div>

        {/* Small Intentional Gap Before Navigation Starts */}
        <div className="h-2 shrink-0" />

        {/* Navigation List (Clean list without extra headings) */}
        <nav className="flex-1 px-4 py-1 flex flex-col gap-1.5 overflow-y-auto min-h-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`group flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all cursor-pointer text-xs sm:text-sm min-h-[46px] ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 border border-sky-200/80 font-extrabold shadow-2xs'
                    : 'text-slate-600 font-bold hover:bg-slate-100/80 hover:text-slate-900 border border-transparent'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                  }`}
                >
                  <Icon size={17} />
                </div>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
          <p className="text-[11px] font-semibold text-slate-400">PlaceD Corporate Partner Console</p>
        </div>
      </div>
    </>
  );
};
