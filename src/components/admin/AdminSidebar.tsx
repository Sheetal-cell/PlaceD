import React, { useState } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  Briefcase,
  Calendar as CalendarIcon,
  Users,
  GitMerge,
  Mail,
  Plus,
  GraduationCap
} from 'lucide-react';
import placedLogo from '../../assets/placed_logo.png';

export type AdminTabType =
  | 'dashboard'
  | 'drives'
  | 'scraped'
  | 'calendar'
  | 'students'
  | 'tracker'
  | 'hr'
  | 'alumni';

interface AdminSidebarProps {
  activeTab: AdminTabType;
  setActiveTab: (tab: AdminTabType) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSeedData?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  isExpanded,
  onToggleExpand,
  onSeedData
}) => {
  const [hoveredItem, setHoveredItem] = useState<{ id: string; label: string; y: number } | null>(null);

  const navItems = [
    { id: 'dashboard' as AdminTabType, label: 'Analytics Dashboard', icon: LayoutDashboard },
    { id: 'drives' as AdminTabType, label: 'Recruitment Drives', icon: Briefcase },
    { id: 'calendar' as AdminTabType, label: 'Placement Calendar', icon: CalendarIcon },
    { id: 'students' as AdminTabType, label: 'Student Database', icon: Users },
    {
  id: 'alumni' as AdminTabType,
  label: 'Alumni Management',
  icon: GraduationCap
},
    { id: 'tracker' as AdminTabType, label: 'Live Round Tracker', icon: GitMerge },
    { id: 'hr' as AdminTabType, label: 'HR Outreach', icon: Mail }
  ];

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>, id: string, label: string) => {
    if (isExpanded) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    setHoveredItem({ id, label, y: centerY });
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  return (
    <>
      <aside
        className={`ap-sidebar hidden md:flex ${
          isExpanded ? 'ap-sidebar-expanded' : 'ap-sidebar-collapsed'
        }`}
      >
        {/* Top Header: Menu Button (☰) when Collapsed OR Close Button (✕) when Expanded */}
        <div className="ap-sidebar-brand">
          {isExpanded ? (
            <div className="ap-brand-logo">
              <div className="ap-brand-icon-box flex items-center justify-center p-0.5">
                <img src={placedLogo} alt="PlaceD Logo" className="w-7 h-7 object-contain rounded-md shrink-0" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="ap-brand-text leading-none">PlaceD Admin</span>
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">
                  TPO Console
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <button
                onClick={onToggleExpand}
                onMouseEnter={(e) => handleMouseEnter(e, 'expand-btn', 'Expand Navigation')}
                onMouseLeave={handleMouseLeave}
                className="ap-sidebar-toggle-btn"
                aria-label="Expand Sidebar (☰)"
                title="Expand Sidebar"
              >
                <Menu size={20} />
              </button>
            </div>
          )}

          {isExpanded && (
            <button
              onClick={onToggleExpand}
              className="ap-sidebar-toggle-btn"
              aria-label="Collapse Sidebar (✕)"
              title="Collapse Sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* TPO Admin Profile Card (Rendered when Expanded) */}
        {isExpanded && (
          <div className="ap-sidebar-profile-card">
            <div className="ap-avatar-circle">
              TA
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-900 truncate">
                TPO Coordinator
              </span>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider truncate">
                Administrator
              </span>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="ap-sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                onMouseEnter={(e) => handleMouseEnter(e, item.id, item.label)}
                onMouseLeave={handleMouseLeave}
                className={`ap-nav-item ${isActive ? 'active' : ''}`}
                aria-label={item.label}
              >
                <Icon size={20} className="ap-nav-icon" />
                {isExpanded && <span className="ap-nav-label">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Seed Data Button when expanded */}
        {onSeedData && isExpanded && (
          <div className="p-3 border-t border-slate-100">
            <button
              onClick={onSeedData}
              className="ap-nav-item text-blue-600 hover:bg-blue-50"
            >
              <Plus size={18} className="ap-nav-icon text-blue-600" />
              <span className="ap-nav-label font-semibold text-blue-600">Seed Sample Data</span>
            </button>
          </div>
        )}
      </aside>

      {/* Floating Hover Tooltip (Rendered outside overflow bounds when Collapsed) */}
      {!isExpanded && hoveredItem && (
        <div
          className="ap-fixed-tooltip"
          style={{ top: `${hoveredItem.y}px` }}
        >
          {hoveredItem.label}
        </div>
      )}
    </>
  );
};
