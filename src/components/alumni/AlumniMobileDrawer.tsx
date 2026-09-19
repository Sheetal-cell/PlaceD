import React from 'react';
import {
  X,
  LayoutDashboard,
  FileText,
  BookOpen,
  Briefcase,
  Users,
  User,
  LogOut
} from 'lucide-react';
import type { Alumni } from '../../api/alumniApi';
import type { AlumniTabType } from './AlumniSidebar';

interface AlumniMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AlumniTabType;
  setActiveTab: (tab: AlumniTabType) => void;
  alumni: Alumni;
  onLogout: () => void;
}

export const AlumniMobileDrawer: React.FC<AlumniMobileDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  alumni,
  onLogout
}) => {
  if (!isOpen) return null;

  const navItems = [
    { id: 'dashboard' as AlumniTabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'blogs' as AlumniTabType, label: 'Write Blog', icon: FileText },
    { id: 'myBlogs' as AlumniTabType, label: 'My Blogs', icon: BookOpen },
    { id: 'referral' as AlumniTabType, label: 'Offer Referral', icon: Briefcase },
    { id: 'directory' as AlumniTabType, label: 'Alumni Directory', icon: Users },
    { id: 'settings' as AlumniTabType, label: 'Profile Settings', icon: User }
  ];

  const initials = alumni.name
    ? alumni.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AL';

  return (
    <>
      {/* Translucent Backdrop Overlay */}
      <div className="alp-mobile-overlay md:hidden" onClick={onClose} />

      {/* Sliding Mobile Drawer Panel */}
      <div className="alp-mobile-drawer md:hidden">
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

        {/* Alumni Profile Info Pill (Compact & Polished) */}
        <div className="mx-4 mt-3 mb-1 p-3 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            {initials}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-extrabold text-slate-900 font-display truncate">
              {alumni.name}
            </span>
            <span className="text-[11px] text-blue-600 font-extrabold uppercase tracking-wider truncate mt-0.5">
              {alumni.currentCompany || alumni.department || 'Alumni Member'}
            </span>
          </div>
        </div>

        {/* Small Intentional Gap Before Navigation Starts */}
        <div className="h-2 shrink-0" />

        {/* Navigation Items (Clean list without extra headings) */}
        <nav className="px-4 py-1 flex-1 overflow-y-auto flex flex-col gap-1.5">
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
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold min-h-[46px] transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-extrabold'
                    : 'text-slate-600 hover:bg-blue-50/80 hover:text-blue-700'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};
