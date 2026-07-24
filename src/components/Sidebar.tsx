import React from 'react';
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

  const menuItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      description: 'Ringkasan & Aktivitas',
    },
    {
      id: 'inventory' as TabType,
      label: 'Pendataan Logistik',
      icon: PackageCheck,
      badge: badgeCounts.inventory,
      description: 'Katalog & Inventaris Barang',
    },
    {
      id: 'borrowings' as TabType,
      label: 'Peminjaman Alat',
      icon: Handshake,
      badge: badgeCounts.borrowingsPending > 0 ? badgeCounts.borrowingsPending : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: 'Pinjam Alat Warga/Kampus',
    },
    {
      id: 'posko' as TabType,
      label: 'Akomodasi & Posko',
      icon: Home,
      description: 'Listrik, Air, Kamar & Dapur',
    },
    {
      id: 'events' as TabType,
      label: 'Persiapan Tempat',
      icon: CalendarCheck,
      badge: badgeCounts.eventsUpcoming > 0 ? badgeCounts.eventsUpcoming : undefined,
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      description: 'Logistik Proker Acara',
    },
    {
      id: 'transport' as TabType,
      label: 'Pengaturan Transportasi',
      icon: Truck,
      description: 'Armada & Mobilisasi',
    },
    {
      id: 'maintenance' as TabType,
      label: 'Pemeliharaan Barang',
      icon: Wrench,
      badge: badgeCounts.maintenanceIssues > 0 ? badgeCounts.maintenanceIssues : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      description: 'Barang Rusak & Retur',
    },
    {
      id: 'users' as TabType,
      label: 'Manajemen User & Role',
      icon: Users,
      badge: isAdmin ? 'ADMIN' : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Kelola Akun & Hak Akses',
    },
    {
      id: 'personal-logistics' as TabType,
      label: 'Logistik Pribadi',
      icon: Backpack,
      description: 'Barang Bawaan & Kebutuhan',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-4">
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
  );
};
