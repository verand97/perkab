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
  | 'users';

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
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
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
      badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
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
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      description: 'Barang Rusak & Retur',
    },
    {
      id: 'users' as TabType,
      label: 'Manajemen User & Role',
      icon: Users,
      badge: isAdmin ? 'ADMIN' : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      description: 'Kelola Akun & Hak Akses',
    },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <nav className="glass-panel rounded-2xl p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Navigasi Utama
        </div>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all duration-150 ${
                isActive
                  ? 'bg-linear-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-700/25 ring-1 ring-emerald-400/30'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-lg ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold leading-none">{item.label}</div>
                  <div
                    className={`text-[10px] truncate mt-1 ${
                      isActive ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  className={`w-3.5 h-3.5 opacity-50 ${
                    isActive ? 'text-white' : 'text-slate-500'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
