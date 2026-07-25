import React, { useState } from 'react';
import {
  LayoutDashboard,
  PackageCheck,
  Handshake,
  Home,
  CalendarCheck,
  Truck,
  Wrench,
  ChevronRight,
  Users,
  ShieldCheck,
  Backpack,
  Menu,
  X,
  Layers,
} from 'lucide-react';
import { usePerkab } from '../context/PerkabContext';

export type TabType =
  | 'dashboard'
  | 'inventory'
  | 'borrowings'
  | 'posko'
  | 'events'
  | 'transport'
  | 'maintenance'
  | 'users'
  | 'personal-logistics';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  badgeCounts: {
    inventory: number;
    borrowingsPending: number;
    eventsUpcoming: number;
    maintenanceIssues: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  badgeCounts,
}) => {
  const { currentUser } = usePerkab();
  const isAdmin = currentUser?.role === 'Admin';
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isAnggota = currentUser?.role === 'Anggota';

  const allMenuItems = [
    {
      id: 'dashboard' as TabType,
      label: isAnggota ? 'Dashboard Personal' : 'Dashboard Overview',
      shortLabel: 'Dashboard',
      icon: LayoutDashboard,
      description: isAnggota ? 'Ringkasan Logistik Pribadi & Posko' : 'Ringkasan & Aktivitas',
    },
    {
      id: 'personal-logistics' as TabType,
      label: isAnggota ? 'Logistik Pribadi Saya' : 'Logistik Pribadi',
      shortLabel: 'Barang Saya',
      icon: Backpack,
      description: 'Pendataan Barang Bawaan & Kebutuhan',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    },
    {
      id: 'inventory' as TabType,
      label: 'Pendataan Logistik',
      shortLabel: 'Logistik',
      icon: PackageCheck,
      badge: badgeCounts.inventory,
      description: 'Katalog & Inventaris Barang',
    },
    {
      id: 'borrowings' as TabType,
      label: 'Peminjaman Alat',
      shortLabel: 'Peminjaman',
      icon: Handshake,
      badge: badgeCounts.borrowingsPending > 0 ? badgeCounts.borrowingsPending : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: 'Pinjam Alat Warga/Kampus',
    },
    {
      id: 'posko' as TabType,
      label: 'Akomodasi & Posko',
      shortLabel: 'Posko',
      icon: Home,
      description: 'Listrik, Air, Kamar & Dapur',
    },
    {
      id: 'events' as TabType,
      label: 'Persiapan Tempat',
      shortLabel: 'Proker Acara',
      icon: CalendarCheck,
      badge: badgeCounts.eventsUpcoming > 0 ? badgeCounts.eventsUpcoming : undefined,
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      description: 'Logistik Proker Acara',
    },
    {
      id: 'transport' as TabType,
      label: 'Pengaturan Transportasi',
      shortLabel: 'Transportasi',
      icon: Truck,
      description: 'Armada & Mobilisasi',
    },
    {
      id: 'maintenance' as TabType,
      label: 'Pemeliharaan Barang',
      shortLabel: 'Pemeliharaan',
      icon: Wrench,
      badge: badgeCounts.maintenanceIssues > 0 ? badgeCounts.maintenanceIssues : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      description: 'Barang Rusak & Retur',
    },
    {
      id: 'users' as TabType,
      label: 'Manajemen User & Role',
      shortLabel: 'Users & Role',
      icon: Users,
      badge: isAdmin ? 'ADMIN' : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Kelola Akun & Hak Akses',
    },
  ];

  const menuItems = isAnggota
    ? allMenuItems.filter(item => item.id === 'dashboard' || item.id === 'personal-logistics')
    : allMenuItems;

  const activeItem = menuItems.find(i => i.id === activeTab) || menuItems[0];
  const ActiveIcon = activeItem.icon;

  const handleSelectTab = (id: TabType) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* ── MOBILE NAVIGATION BAR (< lg) ────────────────────────── */}
      <div className="block lg:hidden w-full space-y-2 mb-2">
        {/* Mobile Header Bar */}
        <div className="glass-card rounded-2xl p-3 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
              <ActiveIcon className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-slate-100 truncate">{activeItem.label}</div>
              <div className="text-[10px] text-slate-400 truncate">{activeItem.description}</div>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 shadow-md transition-all active:scale-95"
          >
            <Menu className="w-4 h-4" />
            <span>Pilih Modul</span>
          </button>
        </div>

        {/* Mobile Scrollable Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white border border-emerald-400/40 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.shortLabel}</span>
                {item.badge !== undefined && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-black">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MOBILE MENU DRAWER MODAL ────────────────────────────── */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md lg:hidden"
          onClick={e => { if (e.target === e.currentTarget) setIsMobileOpen(false); }}
        >
          <div className="glass-card w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-bottom-6 duration-300">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between glass-card">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Pilih Modul Perkab KKN</h3>
                  <p className="text-[10px] text-slate-400">Pindah ke halaman modul langsung</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items List */}
            <div className="p-3 overflow-y-auto space-y-1.5">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-lg border border-emerald-400/40 font-semibold'
                        : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 border border-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2.5 rounded-xl ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold">{item.label}</div>
                        <div className={`text-[10px] ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {item.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge !== undefined && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-800 text-center text-[10px] text-slate-500">
              Tim Perlengkapan &amp; Akomodasi Kelompok KKN 2026
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP SIDEBAR (lg:block hidden) ────────────────────── */}
      <aside className="hidden lg:block w-64 shrink-0 space-y-4">
        <nav className="glass-card rounded-2xl p-2.5 space-y-1">
          <div className="px-3 py-2 text-[10px] font-extrabold tracking-widest text-slate-400 uppercase font-heading">
            MODUL PERKAB KKN
          </div>

          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 border border-emerald-400/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-900 text-slate-400 group-hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold leading-tight font-heading">{item.label}</div>
                    <div
                      className={`text-[10px] truncate mt-0.5 ${
                        isActive ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-2">
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isActive ? 'text-white translate-x-0.5' : 'text-slate-600'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>

        {/* User Role Card at Bottom */}
        {currentUser && (
          <div className="glass-card rounded-2xl p-4 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Role Akses Terverifikasi</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Anda terhubung sebagai <strong className="text-slate-200 capitalize">{currentUser.name}</strong> dengan hak akses <span className="text-emerald-400 font-semibold">{currentUser.role}</span>.
            </p>
          </div>
        )}
      </aside>
    </>
  );
};

