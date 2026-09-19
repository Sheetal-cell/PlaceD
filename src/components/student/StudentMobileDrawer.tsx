import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Calendar as CalendarIcon,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Users,
  User,
  X
} from 'lucide-react';
import type { Student } from '../../mockData';
import type { StudentTabType } from './StudentSidebar';

interface StudentMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: StudentTabType;
  setActiveTab: (tab: StudentTabType) => void;
  currentStudent: Student;
}

export const StudentMobileDrawer: React.FC<StudentMobileDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  currentStudent
}) => {
  if (!isOpen) return null;

  const navSections = [
    {
      title: 'Main Menu',
      items: [
        { id: 'dashboard' as StudentTabType, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'drives' as StudentTabType, label: 'Placement Drives', icon: Briefcase },
        { id: 'calendar' as StudentTabType, label: 'Placement Calendar', icon: CalendarIcon },
      ],
    },
    {
      title: 'AI & Analytics',
      items: [
        { id: 'ats' as StudentTabType, label: 'ATS Resume Scorer', icon: Sparkles },
        { id: 'interview' as StudentTabType, label: 'Mock Interview', icon: MessageSquare },
        { id: 'visualizer' as StudentTabType, label: 'Stage Visualizer', icon: TrendingUp },
      ],
    },
    {
      title: 'Account',
      items: [
        { id: 'alumni' as StudentTabType, label: 'Alumni Network', icon: Users },
        { id: 'profile' as StudentTabType, label: 'My Profile', icon: User },
      ],
    },
  ];

  return (
    <>
      {/* Translucent Backdrop Overlay */}
      <div className="sp-drawer-backdrop md:hidden" onClick={onClose} />

      {/* Sliding Mobile Drawer Panel */}
      <div className="sp-drawer-panel md:hidden">
        {/* Top Header with Prominent Close Button (✕) */}
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

        {/* Student Profile Info Pill inside Drawer (Compact & Polished) */}
        <div className="mx-4 mt-3 mb-1 p-3 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            {currentStudent.name ? currentStudent.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-extrabold text-slate-900 font-display truncate" title={currentStudent.name}>
                {currentStudent.name}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100/90 text-emerald-800 text-[10px] font-extrabold shrink-0">
                Active
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
              {currentStudent.department} • {currentStudent.cgpa} CGPA
            </span>
          </div>
        </div>

        {/* Small Intentional Gap Before Navigation Starts */}
        <div className="h-2 shrink-0" />

        {/* Navigation List (Clean list without extra section titles) */}
        <nav className="flex-1 px-4 py-1 flex flex-col gap-1.5 overflow-y-auto min-h-0">
          {navSections.flatMap(s => s.items).map((item) => {
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

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
          <p className="text-[11px] font-semibold text-slate-400">PlaceD Campus Recruitment Suite</p>
        </div>
      </div>
    </>
  );
};
