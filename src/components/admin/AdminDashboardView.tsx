import React from 'react';
import { Users, CheckCircle2, Briefcase, TrendingUp } from 'lucide-react';
import type { DriveWithCompany } from '../../api/types';
import type { PlacementDrive } from '../../mockData';

interface AdminDashboardViewProps {
  totalStudentsCount: number;
  placedCount: number;
  placementRate: number;
  activeDrivesCount: number;
  averagePackage: string;
  effectiveDrives: (DriveWithCompany | PlacementDrive)[];
  branchData: { name: string; pct: number; total: number; placed: number }[];
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  totalStudentsCount,
  placedCount,
  placementRate,
  activeDrivesCount,
  averagePackage,
  effectiveDrives,
  branchData
}) => {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Analytics Hero Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="sp-badge sp-badge-success font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System Operational
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono font-bold text-xs">
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-blue-700 shadow-xs">
              {activeDrivesCount} Active Drives
            </span>
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-emerald-700 shadow-xs">
              {placedCount} Students Placed
            </span>
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-amber-700 shadow-xs">
              Avg Package {averagePackage} LPA
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight mt-1">
          📊 TPO Dashboard Analytics
        </h1>

        <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
          Track recruitment drives, oversee student application cycles, update stage transitions, and generate cohort placement graphs.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="sp-kpi-grid">
        <div className="sp-kpi-card" style={{ '--kpi-accent': '#2563EB' } as React.CSSProperties}>
          <div className="sp-kpi-header">
            <span className="sp-kpi-label">Total Student Roster</span>
            <div className="sp-kpi-icon bg-blue-50 text-blue-600">
              <Users size={22} />
            </div>
          </div>
          <div className="sp-kpi-value">{totalStudentsCount}</div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Registered Candidates</p>
        </div>

        <div className="sp-kpi-card" style={{ '--kpi-accent': '#10B981' } as React.CSSProperties}>
          <div className="sp-kpi-header">
            <span className="sp-kpi-label">Placed Students ({placementRate}%)</span>
            <div className="sp-kpi-icon bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div className="sp-kpi-value">{placedCount}</div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Secured Offers</p>
        </div>

        <div className="sp-kpi-card" style={{ '--kpi-accent': '#4F46E5' } as React.CSSProperties}>
          <div className="sp-kpi-header">
            <span className="sp-kpi-label">Active Drives Running</span>
            <div className="sp-kpi-icon bg-indigo-50 text-indigo-600">
              <Briefcase size={22} />
            </div>
          </div>
          <div className="sp-kpi-value">{activeDrivesCount}</div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Open Campaigns</p>
        </div>

        <div className="sp-kpi-card" style={{ '--kpi-accent': '#D97706' } as React.CSSProperties}>
          <div className="sp-kpi-header">
            <span className="sp-kpi-label">Average CTC Offered</span>
            <div className="sp-kpi-icon bg-amber-50 text-amber-600">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="sp-kpi-value">{averagePackage} LPA</div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Mean Salary CTC</p>
        </div>
      </div>

      {/* Analytics Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        {/* Chart 1: Drives package distribution */}
        <div className="ap-card flex flex-col gap-5 p-6 sm:p-7 min-w-0 max-w-full overflow-hidden">
          <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2.5">
            <TrendingUp size={20} className="text-blue-600" />
            Salary Package Distribution (LPA)
          </h3>

          <div className="w-full overflow-x-auto pb-4 pt-2">
            <div className="flex items-end justify-start sm:justify-around gap-6 pt-10 border-b border-l border-slate-200 pb-3 min-h-[240px] min-w-max px-2">
              {effectiveDrives.map((drive) => {
                const maxHeight = 150;
                const pkgNum = typeof drive.numericPackage === 'number' && !isNaN(drive.numericPackage) ? drive.numericPackage : 0;
                const maxPackage = Math.max(
                  ...effectiveDrives.map((d) => (typeof d.numericPackage === 'number' && !isNaN(d.numericPackage) ? d.numericPackage : 0)),
                  35
                );
                const barHeight = maxPackage > 0 ? (pkgNum / maxPackage) * maxHeight : 0;

                return (
                  <div key={drive.id} className="flex flex-col items-center group w-14 shrink-0 relative">
                    <span className="absolute -top-8 bg-slate-900 text-white text-[11px] px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity font-mono z-10 whitespace-nowrap shadow-xs pointer-events-none">
                      {drive.package}
                    </span>

                    <div
                      className="w-9 rounded-t-md transition-all duration-300 shadow-2xs"
                      style={{
                        height: `${Math.max(barHeight, 12)}px`,
                        background: `linear-gradient(to top, #2563EB, #4F46E5)`
                      }}
                    />

                    <p className="text-xs text-slate-700 font-extrabold mt-2.5 truncate w-full text-center" title={drive.companyName}>
                      {drive.companyName}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart 2: Department Placement Rates */}
        <div className="ap-card flex flex-col gap-5 p-6 sm:p-7 min-w-0 max-w-full overflow-hidden">
          <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2.5">
            <Users size={20} className="text-indigo-600" />
            Placement Rates by Department
          </h3>

          <div className="flex flex-col gap-5 justify-center py-2">
            {branchData.map((data) => (
              <div key={data.name} className="flex flex-col gap-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-700 font-bold">{data.name}</span>
                  <span className="text-blue-700 font-bold font-mono">
                    {data.pct}% ({data.placed}/{data.total})
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${data.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
