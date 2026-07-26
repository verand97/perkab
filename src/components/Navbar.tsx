import React from 'react';
import {
  Package,
  FileSpreadsheet,
  Settings,
  CloudCheck,
  HardDrive,
  LogOut,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { usePerkab } from '../context/PerkabContext';

interface NavbarProps {
  onOpenExport: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenExport, onOpenSettings }) => {
  const { supabaseConfig, currentUser, logout, themeMode, toggleTheme } = usePerkab();
  const isAdmin = currentUser?.role === 'Admin';

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 dark:bg-slate-950/80 light:bg-white/80 backdrop-blur-xl border-b border-slate-800/80 light:border-slate-200 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-emerald-500 via-teal-600 to-slate-900 p-0.5 shadow-lg shadow-emerald-500/15">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white dark:text-white light:text-slate-900 font-heading">
                PERKAB<span className="text-emerald-400">.KKN</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 light:text-slate-500 font-medium hidden sm:block">
              Perlengkapan, Akomodasi & Logistik KKN Desa Sumanding
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* User Profile Tag */}
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 text-xs">
              <div className="w-7 h-7 rounded-xl bg-linear-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-sm uppercase font-heading">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-100 dark:text-slate-100 light:text-slate-800 capitalize text-xs leading-tight truncate max-w-35">
                  {currentUser.name}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{currentUser.role}</span>
                </div>
              </div>
            </div>
          )}

          {/* Database Status Chip */}
          {isAdmin ? (
            <button
              onClick={onOpenSettings}
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                supabaseConfig.isConnected
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/50'
                  : 'bg-slate-900 dark:bg-slate-900 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700 border-slate-800 dark:border-slate-800 light:border-slate-300 hover:bg-slate-800'
              }`}
              title="Pengaturan Database & Sync (Khusus Admin)"
            >
              {supabaseConfig.isConnected ? (
                <>
                  <CloudCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Supabase Online</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-4 h-4 text-amber-400" />
                  <span>Mode Local</span>
                </>
              )}
            </button>
          ) : (
            <div
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                supabaseConfig.isConnected
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-900 dark:bg-slate-900 light:bg-slate-100 text-slate-300 border-slate-800'
              }`}
            >
              {supabaseConfig.isConnected ? (
                <>
                  <CloudCheck className="w-4 h-4 text-emerald-400" />
                  <span>Supabase Online</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-4 h-4 text-amber-400" />
                  <span>Mode Local</span>
                </>
              )}
            </div>
          )}

          {/* Theme Toggle Button (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-amber-600 border border-slate-800 dark:border-slate-800 light:border-slate-300 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200 transition-all cursor-pointer"
            title={themeMode === 'dark' ? 'Ganti ke Mode Terang (Light)' : 'Ganti ke Mode Gelap (Dark)'}
          >
            {themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-600" />
            )}
          </button>

          {/* Export Excel Button */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 active:scale-95 transition-all border border-emerald-400/40 font-heading cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Rekap Excel / CSV</span>
          </button>

          {/* Settings Trigger - Admin Only */}
          {isAdmin && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700 border border-slate-800 dark:border-slate-800 light:border-slate-300 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200 transition-colors cursor-pointer"
              title="Pengaturan Database & Backend (Admin)"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Logout Button */}
          {currentUser && (
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-slate-100 text-slate-400 hover:text-rose-400 border border-slate-800 dark:border-slate-800 light:border-slate-300 transition-colors"
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
