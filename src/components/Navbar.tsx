import React from 'react';
import {
  Package,
  FileSpreadsheet,
  Settings,
  CloudCheck,
  HardDrive,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { usePerkab } from '../context/PerkabContext';

interface NavbarProps {
  onOpenExport: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenExport, onOpenSettings }) => {
  const { supabaseConfig, currentUser, logout } = usePerkab();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-linear-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                PERKAB KKN
              </h1>
              <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRO 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Perlengkapan, Akomodasi & Logistik Kelompok
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* User Profile Badge */}
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[11px]">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-100 capitalize text-[11px] leading-tight truncate max-w-35">
                  {currentUser.name}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{currentUser.role}</span>
                </div>
              </div>
            </div>
          )}

          {/* Database Connection Badge */}
          <button
            onClick={onOpenSettings}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              supabaseConfig.isConnected
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/60'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700/80'
            }`}
          >
            {supabaseConfig.isConnected ? (
              <>
                <CloudCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Supabase Cloud</span>
              </>
            ) : (
              <>
                <HardDrive className="w-4 h-4 text-amber-400" />
                <span>Mode Offline</span>
              </>
            )}
          </button>

          {/* Quick Export Excel/CSV Button */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Rekap Excel / CSV</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            title="Pengaturan Supabase & Database"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Logout Button */}
          {currentUser && (
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700/60 transition-colors"
              title="Keluar / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
