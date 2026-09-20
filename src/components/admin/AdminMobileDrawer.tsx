import React from 'react';
import {
  X,
  LayoutDashboard,
  Briefcase,
  Calendar as CalendarIcon,
  Users,
  GitMerge,
  Mail,
  Plus
} from 'lucide-react';
import type { AdminTabType } from './AdminSidebar';

interface AdminMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AdminTabType;
  setActiveTab: (tab: AdminTabType) => void;
  onSeedData?: () => void;
}

export const AdminMobileDrawer: React.FC<AdminMobileDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onSeedData
}) => {
  if (!isOpen) return null;

  const navItems = [
    { id: 'dashboard' as AdminTabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'drives' as AdminTabType, label: 'Placement Drives', icon: Briefcase },
    { id: 'calendar' as AdminTabType, label: 'Calendar', icon: CalendarIcon },
    { id: 'students' as AdminTabType, label: 'Student Database', icon: Users },
    { id: 'recruiters' as AdminTabType, label: 'Recruiter Management', icon: Users },
    { id: 'alumni' as AdminTabType, label: 'Alumni Directory', icon: Users },
    { id: 'tracker' as AdminTabType, label: 'Live Round Tracker', icon: GitMerge },
    { id: 'hr' as AdminTabType, label: 'HR Outreach', icon: Mail }
  ];

  return (
    <>
      <div className="ap-mobile-overlay md:hidden" onClick={onClose} />
      <div className="ap-mobile-drawer md:hidden">
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

        {/* TPO Admin Profile Info Pill (Compact & Polished) */}
        <div className="mx-4 mt-3 mb-1 p-3 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            TP
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-extrabold text-slate-900 font-display truncate">
              TPO Administrator
            </span>
            <span className="text-[11px] text-blue-600 font-extrabold uppercase tracking-wider truncate mt-0.5">
              Placement Cell Admin
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
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/80 font-extrabold shadow-2xs'
                    : 'text-slate-600 font-bold hover:bg-slate-100/80 hover:text-slate-900 border border-transparent'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-2xs'
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

        {onSeedData && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={() => {
                onClose();
                onSeedData();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200/80 transition-all cursor-pointer shadow-2xs"
            >
              <Plus size={16} />
              <span>Seed Sample Data</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};
