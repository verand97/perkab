import React, { useState, useMemo } from 'react';
import {
  Package,
  PackageCheck,
  Handshake,
  Home,
  CalendarCheck,
  Truck,
  Wrench,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp,
  Users,
  Activity,
  ArrowRight,
  Zap,
  Shield,
  LogIn,
  Star,
  X,
  Search,
  ChevronRight,
  Clock,
  MapPin,
  User,
  StickyNote,
} from 'lucide-react';
import { usePerkab } from '../context/PerkabContext';

interface PublicLandingPageProps {
  onLoginClick: () => void;
}

type ModuleKey = 'inventory' | 'borrowings' | 'posko' | 'events' | 'transport' | 'maintenance';

// ── SVG Ring Chart ──────────────────────────────────────────────────────────
const RingChart: React.FC<{ value: number; total: number; color: string; size?: number }> = ({
  value, total, color, size = 52,
}) => {
  const pct  = total > 0 ? value / total : 0;
  const r    = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const cx   = size / 2;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }} />
    </svg>
  );
};

// ── Progress Bar ────────────────────────────────────────────────────────────
const Bar: React.FC<{ value: number; total: number; color: string }> = ({ value, total, color }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
      <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
};

// ── Component ───────────────────────────────────────────────────────────────
export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({ onLoginClick }) => {
  const {
    inventory, borrowings, facilities, rooms,
    eventSetups, transports, maintenanceLogs, users,
  } = usePerkab();

  const [selectedModule, setSelectedModule] = useState<ModuleKey | null>(null);
  const [modalSearch, setModalSearch]       = useState('');
  const [selectedItemModal, setSelectedItemModal] = useState<{ type: string; title: string; item: any } | null>(null);

  const stats = useMemo(() => ({
    inventory:   {
      total:     inventory.length,
      available: inventory.filter(i => i.availableQty > 0).length,
      rusak:     inventory.filter(i => i.condition === 'Rusak').length,
    },
    borrowings:  {
      total:     borrowings.length,
      active:    borrowings.filter(b => b.status === 'Dipinjam').length,
      terlambat: borrowings.filter(b => b.status === 'Terlambat').length,
      returned:  borrowings.filter(b => b.status === 'Dikembalikan').length,
    },
    facilities:  {
      total:     facilities.length,
      baik:      facilities.filter(f => f.status === 'Sangat Baik').length,
      issue:     facilities.filter(f => f.status !== 'Sangat Baik').length,
    },
    rooms:       { total: rooms.length },
    events:      {
      total:     eventSetups.length,
      active:    eventSetups.filter(e => e.setupStatus !== 'Selesai').length,
      done:      eventSetups.filter(e => e.setupStatus === 'Selesai').length,
    },
    transports:  {
      total:     transports.length,
      berjalan:  transports.filter(t => t.status === 'Berjalan').length,
      jadwal:    transports.filter(t => t.status === 'Jadwal').length,
    },
    maintenance: {
      total:     maintenanceLogs.length,
      pending:   maintenanceLogs.filter(m => m.status !== 'Selesai Perbaikan').length,
      done:      maintenanceLogs.filter(m => m.status === 'Selesai Perbaikan').length,
    },
    users:       { total: users.length },
  }), [inventory, borrowings, facilities, rooms, eventSetups, transports, maintenanceLogs, users]);

  const totalItems    = stats.inventory.total + stats.borrowings.total + stats.events.total + stats.transports.total;
  const totalIssues   = stats.borrowings.terlambat + stats.facilities.issue + stats.maintenance.pending;
  const healthPct     = totalItems > 0 ? Math.max(0, Math.round(100 - (totalIssues / Math.max(totalItems, 1)) * 100)) : 100;
  const healthColor   = healthPct >= 80 ? '#10b981' : healthPct >= 60 ? '#f59e0b' : '#f43f5e';
  const healthLabel   = healthPct >= 80 ? 'Sangat Baik' : healthPct >= 60 ? 'Perlu Perhatian' : 'Kritis';
  const HealthIcon    = healthPct >= 80 ? CheckCircle2 : healthPct >= 60 ? AlertCircle : XCircle;

  const modules: {
    id: ModuleKey;
    label: string;
    desc: string;
    icon: React.FC<{ className?: string }>;
    iconBg: string;
    border: string;
    gradient: string;
    accentColor: string;
    primary: { label: string; value: number };
    secondary: { label: string; value: number; color: string }[];
    ring: { value: number; total: number };
    alert: { msg: string; danger: boolean } | null;
  }[] = [
    {
      id: 'inventory',
      label: 'Pendataan Logistik', desc: 'Katalog & Inventaris Barang Kelompok',
      icon: PackageCheck, iconBg: 'bg-emerald-500/15 text-emerald-400',
      border: 'border-emerald-500/20 hover:border-emerald-500/50', gradient: 'from-emerald-500/10 to-transparent',
      accentColor: '#10b981',
      primary: { label: 'Total Barang', value: stats.inventory.total },
      secondary: [
        { label: 'Tersedia', value: stats.inventory.available, color: 'text-emerald-400' },
        { label: 'Rusak',    value: stats.inventory.rusak,     color: 'text-rose-400' },
      ],
      ring: { value: stats.inventory.available, total: stats.inventory.total },
      alert: stats.inventory.rusak > 0 ? { msg: `${stats.inventory.rusak} barang rusak`, danger: false } : null,
    },
    {
      id: 'borrowings',
      label: 'Peminjaman Alat', desc: 'Pinjam Alat Warga/Kampus',
      icon: Handshake, iconBg: 'bg-amber-500/15 text-amber-400',
      border: 'border-amber-500/20 hover:border-amber-500/50', gradient: 'from-amber-500/10 to-transparent',
      accentColor: '#f59e0b',
      primary: { label: 'Total Peminjaman', value: stats.borrowings.total },
      secondary: [
        { label: 'Aktif',        value: stats.borrowings.active,    color: 'text-amber-400' },
        { label: 'Terlambat',    value: stats.borrowings.terlambat, color: 'text-rose-400' },
        { label: 'Dikembalikan', value: stats.borrowings.returned,  color: 'text-emerald-400' },
      ],
      ring: { value: stats.borrowings.returned, total: stats.borrowings.total },
      alert: stats.borrowings.terlambat > 0 ? { msg: `${stats.borrowings.terlambat} terlambat!`, danger: true } : null,
    },
    {
      id: 'posko',
      label: 'Akomodasi & Posko', desc: 'Listrik, Air, Kamar & Dapur',
      icon: Home, iconBg: 'bg-sky-500/15 text-sky-400',
      border: 'border-sky-500/20 hover:border-sky-500/50', gradient: 'from-sky-500/10 to-transparent',
      accentColor: '#0ea5e9',
      primary: { label: 'Fasilitas Terpantau', value: stats.facilities.total },
      secondary: [
        { label: 'Kondisi Baik',    value: stats.facilities.baik,  color: 'text-emerald-400' },
        { label: 'Perlu Perhatian', value: stats.facilities.issue, color: 'text-amber-400' },
        { label: 'Kamar',           value: stats.rooms.total,      color: 'text-sky-400' },
      ],
      ring: { value: stats.facilities.baik, total: stats.facilities.total },
      alert: stats.facilities.issue > 0 ? { msg: `${stats.facilities.issue} perlu perhatian`, danger: false } : null,
    },
    {
      id: 'events',
      label: 'Persiapan Tempat', desc: 'Logistik Proker Acara',
      icon: CalendarCheck, iconBg: 'bg-teal-500/15 text-teal-400',
      border: 'border-teal-500/20 hover:border-teal-500/50', gradient: 'from-teal-500/10 to-transparent',
      accentColor: '#14b8a6',
      primary: { label: 'Total Proker', value: stats.events.total },
      secondary: [
        { label: 'Berlangsung', value: stats.events.active, color: 'text-teal-400' },
        { label: 'Selesai',     value: stats.events.done,   color: 'text-emerald-400' },
      ],
      ring: { value: stats.events.done, total: stats.events.total },
      alert: null,
    },
    {
      id: 'transport',
      label: 'Pengaturan Transportasi', desc: 'Armada & Mobilisasi',
      icon: Truck, iconBg: 'bg-violet-500/15 text-violet-400',
      border: 'border-violet-500/20 hover:border-violet-500/50', gradient: 'from-violet-500/10 to-transparent',
      accentColor: '#8b5cf6',
      primary: { label: 'Total Armada', value: stats.transports.total },
      secondary: [
        { label: 'Berjalan',  value: stats.transports.berjalan, color: 'text-violet-400' },
        { label: 'Terjadwal', value: stats.transports.jadwal,   color: 'text-sky-400' },
      ],
      ring: { value: stats.transports.berjalan + stats.transports.jadwal, total: stats.transports.total },
      alert: null,
    },
    {
      id: 'maintenance',
      label: 'Pemeliharaan Barang', desc: 'Barang Rusak & Retur',
      icon: Wrench, iconBg: 'bg-rose-500/15 text-rose-400',
      border: 'border-rose-500/20 hover:border-rose-500/50', gradient: 'from-rose-500/10 to-transparent',
      accentColor: '#f43f5e',
      primary: { label: 'Total Laporan', value: stats.maintenance.total },
      secondary: [
        { label: 'Pending', value: stats.maintenance.pending, color: 'text-rose-400' },
        { label: 'Selesai', value: stats.maintenance.done,    color: 'text-emerald-400' },
      ],
      ring: { value: stats.maintenance.done, total: stats.maintenance.total },
      alert: stats.maintenance.pending > 0 ? { msg: `${stats.maintenance.pending} laporan pending`, danger: false } : null,
    },
  ];

  const quickStatus = [
    { label: 'Ketersediaan Barang',    value: stats.inventory.available,   total: stats.inventory.total,     color: '#10b981', note: stats.inventory.rusak > 0 ? `⚠ ${stats.inventory.rusak} barang rusak` : '✓ Semua barang kondisi baik' },
    { label: 'Tingkat Pengembalian',   value: stats.borrowings.returned,   total: stats.borrowings.total,    color: '#f59e0b', note: stats.borrowings.terlambat > 0 ? `🔴 ${stats.borrowings.terlambat} terlambat` : `🟢 ${stats.borrowings.active} aktif dipinjam` },
    { label: 'Kondisi Fasilitas Posko',value: stats.facilities.baik,       total: stats.facilities.total,    color: '#0ea5e9', note: stats.facilities.issue > 0 ? `⚠ ${stats.facilities.issue} perlu pengecekan` : '✓ Semua fasilitas baik' },
    { label: 'Selesai Persiapan Tempat',value: stats.events.done,          total: stats.events.total,        color: '#14b8a6', note: stats.events.active > 0 ? `⏳ ${stats.events.active} proker dipersiapkan` : '✓ Semua proker siap' },
    { label: 'Transportasi Aktif',     value: stats.transports.berjalan + stats.transports.jadwal, total: stats.transports.total, color: '#8b5cf6', note: stats.transports.berjalan > 0 ? `🚛 ${stats.transports.berjalan} armada berjalan` : `📅 ${stats.transports.jadwal} terjadwal` },
    { label: 'Selesai Pemeliharaan',   value: stats.maintenance.done,      total: stats.maintenance.total,   color: '#f43f5e', note: stats.maintenance.pending > 0 ? `🔧 ${stats.maintenance.pending} belum selesai` : '✓ Semua laporan teratasi' },
  ];

  const activeModuleObj = modules.find(m => m.id === selectedModule);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">

      {/* ── NAVBAR ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 backdrop-blur-xl bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-linear-to-br from-emerald-500 via-teal-600 to-slate-900 shadow-lg shadow-emerald-500/20 ring-1 ring-white/10">
              <Package className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-white leading-none">
                PERKAB<span className="text-emerald-400">.KKN</span>
              </div>
              <div className="text-[10px] text-slate-400 leading-none mt-0.5 hidden sm:block">
                Perlengkapan, Akomodasi &amp; Logistik
              </div>
            </div>
          </div>

          {/* Center tag */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              Papan Informasi Publik
            </span>
          </div>

          {/* Login CTA */}
          <button
            id="btn-login-landing"
            onClick={onLoginClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/25"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:block">Masuk ke Dashboard</span>
            <span className="sm:hidden">Masuk</span>
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden glass-card rounded-2xl p-6 lg:p-8 border border-emerald-500/20">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-violet-500/10  rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-24 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Title */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest">
                  KKN 2026
                </span>
                <span className="text-xs font-bold text-slate-500 bg-slate-800/60 border border-slate-700/40 px-2.5 py-1 rounded-full">
                  Data Real-time
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight">
                Status Logistik &amp;<br />
                <span className="text-emerald-400">Operasional KKN</span>
              </h1>
              <p className="text-slate-400 mt-3 max-w-md leading-relaxed text-sm">
                Pantau seluruh modul perlengkapan, akomodasi, dan logistik kelompok KKN. <strong className="text-slate-200">Klik modul mana saja di bawah ini untuk melihat detail data publik.</strong>
              </p>
            </div>

            {/* Health Meter */}
            <div className="flex items-center gap-5 shrink-0 glass-card rounded-2xl p-5 border border-slate-700/50">
              <div className="relative">
                <RingChart value={healthPct} total={100} color={healthColor} size={80} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-black" style={{ color: healthColor }}>{healthPct}%</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold mb-1">Kesehatan Sistem</div>
                <div className="flex items-center gap-1.5 font-black text-sm" style={{ color: healthColor }}>
                  <HealthIcon className="w-4 h-4" />
                  {healthLabel}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{totalIssues} isu aktif ditemukan</div>
                <div className="text-[10px] text-slate-500">{stats.users.total} anggota terdaftar</div>
              </div>
            </div>
          </div>

          {/* Global Stats Strip */}
          <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/60">
            {[
              { label: 'Total Barang',     value: stats.inventory.total,   icon: PackageCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Peminjaman Aktif', value: stats.borrowings.active, icon: Handshake,    color: 'text-amber-400',   bg: 'bg-amber-500/10' },
              { label: 'Anggota KKN',      value: stats.users.total,       icon: Users,        color: 'text-sky-400',     bg: 'bg-sky-500/10' },
              { label: 'Isu Terdeteksi',   value: totalIssues,             icon: Activity,     color: totalIssues > 0 ? 'text-rose-400' : 'text-emerald-400', bg: totalIssues > 0 ? 'bg-rose-500/10' : 'bg-emerald-500/10' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${s.bg} shrink-0`}>
                    <Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div>
                    <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] text-slate-400 leading-tight">{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── MODULE CARDS (CLICKABLE) ────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-200">Ringkasan Modul (Klik untuk Detail)</h2>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">💡 Klik card modul mana saja untuk membuka rincian data</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {modules.map(mod => {
              const Icon = mod.icon;
              const pct  = mod.ring.total > 0 ? Math.round((mod.ring.value / mod.ring.total) * 100) : 0;
              return (
                <div
                  key={mod.id}
                  onClick={() => { setSelectedModule(mod.id); setModalSearch(''); }}
                  className={`group glass-card rounded-2xl overflow-hidden border ${mod.border} bg-linear-to-br ${mod.gradient} hover:scale-[1.02] cursor-pointer transition-all duration-200 shadow-lg`}
                >
                  {/* Header */}
                  <div className="p-4 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${mod.iconBg} border border-white/5`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-100 leading-tight group-hover:text-emerald-300 transition-colors flex items-center gap-1">
                            {mod.label}
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-emerald-400" />
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{mod.desc}</div>
                        </div>
                      </div>
                      <div className="relative shrink-0">
                        <RingChart value={mod.ring.value} total={mod.ring.total} color={mod.accentColor} size={44} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[9px] font-black" style={{ color: mod.accentColor }}>{pct}%</span>
                        </div>
                      </div>
                    </div>

                    {mod.alert && (
                      <div className={`mt-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border ${
                        mod.alert.danger
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}>
                        {mod.alert.danger ? <XCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {mod.alert.msg}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="px-4 pb-3">
                    <div className={`grid gap-2 ${mod.secondary.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                      {mod.secondary.map(s => (
                        <div key={s.label} className="bg-slate-900/50 rounded-xl p-2.5 text-center">
                          <div className={`text-lg font-black ${s.color}`}>{s.value}</div>
                          <div className="text-[9px] text-slate-400 leading-tight mt-0.5">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress & Click CTA */}
                  <div className="px-4 pb-4 space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>{mod.primary.label}</span>
                      <span className="font-bold" style={{ color: mod.accentColor }}>{mod.primary.value} item</span>
                    </div>
                    <Bar value={mod.ring.value} total={mod.ring.total} color={mod.accentColor} />

                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-semibold text-emerald-400 group-hover:text-emerald-300">
                      <span>Lihat detail data →</span>
                      <span className="text-[9px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded-md">Publik</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── QUICK STATUS ──────────────────────────────────────────── */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/60">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-slate-200">Status Cepat Semua Modul</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickStatus.map(s => (
              <div key={s.label} className="bg-slate-900/60 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-semibold">{s.label}</span>
                  <span className="text-xs font-black" style={{ color: s.color }}>{s.value}/{s.total}</span>
                </div>
                <Bar value={s.value} total={s.total} color={s.color} />
                <div className="text-[10px] text-slate-500 mt-1.5">{s.note}</div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/60 py-6 mt-4">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <Package className="w-3.5 h-3.5 text-emerald-500" />
            <strong className="text-slate-300">PERKAB.KKN</strong>
            — Sistem Perlengkapan, Akomodasi &amp; Logistik Kelompok KKN 2026
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-3 h-3 text-amber-500/60" />
            <span>Data bersifat publik dan real-time</span>
          </div>
        </div>
      </footer>

      {/* ── PUBLIC READ-ONLY MODULE DETAIL MODAL ────────────────────────── */}
      {selectedModule && activeModuleObj && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md"
          onClick={e => { if (e.target === e.currentTarget) setSelectedModule(null); }}
        >
          <div className="glass-card w-full max-w-4xl rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Modal Header (Responsive for Mobile HP) */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-3 glass-card">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`p-2.5 sm:p-3 rounded-2xl ${activeModuleObj.iconBg} border border-white/10 shrink-0`}>
                  <activeModuleObj.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-white leading-snug">{activeModuleObj.label}</h2>
                    <span className="w-fit text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                      Publik (Read-Only)
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1">{activeModuleObj.desc}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedModule(null)}
                className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="px-4 sm:px-5 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder={`Cari data di ${activeModuleObj.label}...`}
                value={modalSearch}
                onChange={e => setModalSearch(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              {modalSearch && (
                <button onClick={() => setModalSearch('')} className="text-xs text-slate-400 hover:text-white">
                  Clear
                </button>
              )}
            </div>

            {/* Modal Body / Items List */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
              {/* 1. Inventory */}
              {selectedModule === 'inventory' && (
                <InventoryDetailView
                  inventory={inventory}
                  search={modalSearch}
                  onItemClick={item => setSelectedItemModal({ type: 'inventory', title: 'Detail Inventaris Barang', item })}
                />
              )}

              {/* 2. Borrowings */}
              {selectedModule === 'borrowings' && (
                <BorrowingDetailView
                  borrowings={borrowings}
                  search={modalSearch}
                  onItemClick={item => setSelectedItemModal({ type: 'borrowing', title: 'Detail Peminjaman Alat', item })}
                />
              )}

              {/* 3. Posko & Facilities */}
              {selectedModule === 'posko' && (
                <PoskoDetailView
                  facilities={facilities}
                  rooms={rooms}
                  search={modalSearch}
                  onFacilityClick={item => setSelectedItemModal({ type: 'facility', title: 'Detail Fasilitas Posko', item })}
                  onRoomClick={item => setSelectedItemModal({ type: 'room', title: 'Detail Tata Letak Kamar', item })}
                />
              )}

              {/* 4. Events / Persiapan Tempat */}
              {selectedModule === 'events' && (
                <EventDetailView
                  eventSetups={eventSetups}
                  search={modalSearch}
                  onItemClick={item => setSelectedItemModal({ type: 'event', title: 'Detail Persiapan Acara', item })}
                />
              )}

              {/* 5. Transports */}
              {selectedModule === 'transport' && (
                <TransportDetailView
                  transports={transports}
                  search={modalSearch}
                  onItemClick={item => setSelectedItemModal({ type: 'transport', title: 'Detail Mobilisasi Armada', item })}
                />
              )}

              {/* 6. Maintenance */}
              {selectedModule === 'maintenance' && (
                <MaintenanceDetailView
                  maintenanceLogs={maintenanceLogs}
                  search={modalSearch}
                  onItemClick={item => setSelectedItemModal({ type: 'maintenance', title: 'Detail Pemeliharaan Barang', item })}
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-800 glass-card flex items-center justify-between gap-3 text-xs">
              <div className="text-slate-400 text-[10px] sm:text-[11px] truncate">
                💡 Klik barang/item mana saja di atas untuk rincian lengkap
              </div>
              <button
                onClick={() => setSelectedModule(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors shrink-0"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SINGLE ITEM FULL DETAIL POPUP MODAL ────────────────────────── */}
      {selectedItemModal && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
          onClick={e => { if (e.target === e.currentTarget) setSelectedItemModal(null); }}
        >
          <div className="glass-card w-full max-w-lg rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {selectedItemModal.title}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white mt-1.5 leading-snug">
                  {selectedItemModal.item.name ||
                   selectedItemModal.item.itemName ||
                   selectedItemModal.item.facilityName ||
                   selectedItemModal.item.eventName ||
                   selectedItemModal.item.vehicleName ||
                   selectedItemModal.item.roomName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItemModal(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Field Details */}
            <div className="space-y-2 text-xs max-h-[60vh] overflow-y-auto pr-1">
              {/* Inventory Type */}
              {selectedItemModal.type === 'inventory' && (
                <>
                  <DetailRow label="Kode Barang" value={selectedItemModal.item.code} fontMono />
                  <DetailRow label="Kategori" value={selectedItemModal.item.category} />
                  <DetailRow label="Jumlah Total" value={`${selectedItemModal.item.quantity} ${selectedItemModal.item.unit}`} />
                  <DetailRow label="Tersedia" value={`${selectedItemModal.item.availableQty} ${selectedItemModal.item.unit}`} highlightColor="text-emerald-400" />
                  <DetailRow label="Kondisi" value={selectedItemModal.item.condition} />
                  <DetailRow label="Kepemilikan" value={selectedItemModal.item.ownership} />
                  {selectedItemModal.item.lenderName && <DetailRow label="Pemilik/Pemberi" value={selectedItemModal.item.lenderName} />}
                  <DetailRow label="Lokasi Penyimpanan" value={selectedItemModal.item.location} />
                  {selectedItemModal.item.notes && <DetailRow label="Catatan" value={selectedItemModal.item.notes} />}
                </>
              )}

              {/* Borrowing Type */}
              {selectedItemModal.type === 'borrowing' && (
                <>
                  <DetailRow label="Status Peminjaman" value={selectedItemModal.item.status} highlightColor={
                    selectedItemModal.item.status === 'Dikembalikan' ? 'text-emerald-400' :
                    selectedItemModal.item.status === 'Terlambat' ? 'text-rose-400' : 'text-amber-400'
                  } />
                  <DetailRow label="Nama Peminjam" value={selectedItemModal.item.borrowerName} />
                  {selectedItemModal.item.borrowerContact && <DetailRow label="Kontak Peminjam" value={selectedItemModal.item.borrowerContact} />}
                  <DetailRow label="Pemberi Pinjam/Pemilik" value={selectedItemModal.item.lenderName} />
                  {selectedItemModal.item.lenderPhone && <DetailRow label="HP Pemilik" value={selectedItemModal.item.lenderPhone} />}
                  <DetailRow label="Jumlah Dipinjam" value={`${selectedItemModal.item.quantity} unit`} />
                  <DetailRow label="Tanggal Pinjam" value={selectedItemModal.item.borrowDate} />
                  <DetailRow label="Tanggal Jatuh Tempo" value={selectedItemModal.item.dueDate || selectedItemModal.item.expectedReturnDate || '-'} />
                  {selectedItemModal.item.returnDate && <DetailRow label="Dikembalikan Pada" value={selectedItemModal.item.returnDate} highlightColor="text-emerald-400" />}
                  {selectedItemModal.item.conditionOnReturn && <DetailRow label="Kondisi Kembali" value={selectedItemModal.item.conditionOnReturn} />}
                  <DetailRow label="Biaya Jaminan/DP" value={selectedItemModal.item.depositCost ? `Rp ${Number(selectedItemModal.item.depositCost).toLocaleString('id-ID')}` : 'Tidak Ada'} />
                  {selectedItemModal.item.notes && <DetailRow label="Catatan" value={selectedItemModal.item.notes} />}
                </>
              )}

              {/* Facility Type */}
              {selectedItemModal.type === 'facility' && (
                <>
                  <DetailRow label="Fasilitas" value={selectedItemModal.item.facilityName} />
                  <DetailRow label="Kategori" value={selectedItemModal.item.category || selectedItemModal.item.facilityType || 'Fasilitas'} />
                  <DetailRow label="Kondisi Status" value={selectedItemModal.item.status} highlightColor={
                    selectedItemModal.item.status === 'Sangat Baik' ? 'text-emerald-400' : 'text-amber-400'
                  } />
                  <DetailRow label="Penanggung Jawab (PIC)" value={selectedItemModal.item.picName} />
                  <DetailRow label="Terakhir Dicek" value={selectedItemModal.item.lastChecked || '-'} />
                  <DetailRow label="Rincian" value={selectedItemModal.item.details || '-'} />
                </>
              )}

              {/* Room Type */}
              {selectedItemModal.type === 'room' && (
                <>
                  <DetailRow label="Nama Kamar/Area" value={selectedItemModal.item.roomName} />
                  <DetailRow label="Kapasitas" value={`${selectedItemModal.item.capacity} orang`} />
                  <DetailRow label="Penghuni Terdaftar" value={
                    Array.isArray(selectedItemModal.item.occupants) && selectedItemModal.item.occupants.length > 0
                      ? selectedItemModal.item.occupants.join(', ')
                      : (selectedItemModal.item.currentOccupants || 'Belum Diisi')
                  } />
                  {Array.isArray(selectedItemModal.item.assignedEquipment) && selectedItemModal.item.assignedEquipment.length > 0 && (
                    <DetailRow label="Fasilitas Kamar" value={selectedItemModal.item.assignedEquipment.join(', ')} />
                  )}
                  {selectedItemModal.item.notes && <DetailRow label="Catatan" value={selectedItemModal.item.notes} />}
                </>
              )}

              {/* Event Type */}
              {selectedItemModal.type === 'event' && (
                <>
                  <DetailRow label="Proker Acara" value={selectedItemModal.item.eventName || selectedItemModal.item.eventTitle} />
                  <DetailRow label="Status Persiapan" value={selectedItemModal.item.setupStatus} highlightColor="text-teal-400" />
                  <DetailRow label="Tanggal Pelaksanaan" value={selectedItemModal.item.eventDate} />
                  <DetailRow label="Lokasi Acara" value={selectedItemModal.item.location} />
                  <DetailRow label="Penanggung Jawab (PIC)" value={selectedItemModal.item.picName || 'PJ Event'} />
                  {selectedItemModal.item.notes && <DetailRow label="Catatan" value={selectedItemModal.item.notes} />}

                  {/* Checklist */}
                  {Array.isArray(selectedItemModal.item.requiredItems || selectedItemModal.item.itemsChecklist) && (
                    <div className="pt-2 border-t border-slate-800 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-300">Checklist Perlengkapan Acara:</div>
                      <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-xl">
                        {(selectedItemModal.item.requiredItems || selectedItemModal.item.itemsChecklist).map((ci: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-[11px]">
                            <span className={ci.isReady ? 'text-slate-300 line-through' : 'text-slate-400'}>
                              {ci.itemName || ci.itemNeeded} ({ci.qty || ci.quantity})
                            </span>
                            <span className={`font-bold ${ci.isReady ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {ci.isReady ? '✓ Siap' : '⏳ Belum'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Transport Type */}
              {selectedItemModal.type === 'transport' && (
                <>
                  <DetailRow label="Nama Kendaraan" value={`${selectedItemModal.item.vehicleName} (${selectedItemModal.item.vehicleType || 'Mobil'})`} />
                  <DetailRow label="Status Armada" value={selectedItemModal.item.status} highlightColor="text-violet-400" />
                  <DetailRow label="Pengemudi / PJ" value={selectedItemModal.item.driverName} />
                  <DetailRow label="Tujuan / Tugas" value={selectedItemModal.item.purpose || selectedItemModal.item.route} />
                  <DetailRow label="Tanggal Keberangkatan" value={selectedItemModal.item.departureDate} />
                  {selectedItemModal.item.returnDate && <DetailRow label="Tanggal Kepulangan" value={selectedItemModal.item.returnDate} />}
                  <DetailRow label="Rincian Muatan" value={selectedItemModal.item.cargoDetails || '-'} />
                  <DetailRow label="Estimasi Biaya" value={selectedItemModal.item.cost ? `Rp ${Number(selectedItemModal.item.cost).toLocaleString('id-ID')}` : 'Rp 0'} />
                </>
              )}

              {/* Maintenance Type */}
              {selectedItemModal.type === 'maintenance' && (
                <>
                  <DetailRow label="Nama Barang" value={selectedItemModal.item.itemName} />
                  <DetailRow label="Status Perbaikan" value={selectedItemModal.item.status} highlightColor={
                    selectedItemModal.item.status === 'Selesai Perbaikan' ? 'text-emerald-400' : 'text-rose-400'
                  } />
                  <DetailRow label="Dilaporkan Oleh" value={selectedItemModal.item.reportedBy} />
                  <DetailRow label="Tanggal Laporan" value={selectedItemModal.item.dateReported || '-'} />
                  <DetailRow label="Deskripsi Kerusakan" value={selectedItemModal.item.damageDescription || selectedItemModal.item.issueDescription || '-'} />
                  <DetailRow label="Estimasi Biaya" value={selectedItemModal.item.estimatedCost ? `Rp ${Number(selectedItemModal.item.estimatedCost).toLocaleString('id-ID')}` : 'Rp 0'} />
                  {selectedItemModal.item.resolutionNotes && (
                    <DetailRow label="Solusi Penanganan" value={selectedItemModal.item.resolutionNotes} highlightColor="text-emerald-400" />
                  )}
                </>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedItemModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors mt-2"
            >
              Tutup Rincian
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string; fontMono?: boolean; highlightColor?: string }> = ({
  label, value, fontMono, highlightColor,
}) => (
  <div className="flex items-start justify-between gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
    <span className="text-slate-400 text-[11px] shrink-0 font-medium">{label}</span>
    <span className={`text-xs font-bold text-right leading-tight ${fontMono ? 'font-mono' : ''} ${highlightColor || 'text-slate-100'}`}>
      {value}
    </span>
  </div>
);

// ── DETAIL SUB-COMPONENTS ───────────────────────────────────────────────────

// 1. Inventory Detail
const InventoryDetailView: React.FC<{ inventory: any[]; search: string; onItemClick: (item: any) => void }> = ({
  inventory, search, onItemClick,
}) => {
  const filtered = inventory.filter(i =>
    !search ||
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase()) ||
    i.code.toLowerCase().includes(search.toLowerCase()) ||
    i.location.toLowerCase().includes(search.toLowerCase())
  );

  if (filtered.length === 0) return <EmptyDetailState message="Tidak ada data barang yang ditemukan." />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {filtered.map(item => (
        <div
          key={item.id}
          onClick={() => onItemClick(item)}
          className="group bg-slate-900/80 hover:bg-slate-800/80 rounded-2xl p-4 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all duration-200 space-y-2"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono text-slate-500">{item.code}</span>
              <h4 className="font-bold text-slate-100 text-sm leading-snug group-hover:text-emerald-300 transition-colors">
                {item.name}
              </h4>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
              item.condition === 'Bagus' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
              item.condition === 'Perlu Perbaikan' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
              'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              {item.condition}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="bg-slate-950/60 rounded-xl p-2">
              <div className="text-[10px] text-slate-500">Kategori</div>
              <div className="font-semibold text-slate-300 truncate">{item.category}</div>
            </div>
            <div className="bg-slate-950/60 rounded-xl p-2">
              <div className="text-[10px] text-slate-500">Tersedia</div>
              <div className="font-bold text-emerald-400">{item.availableQty} <span className="text-slate-500 font-normal">/ {item.quantity} {item.unit}</span></div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
            <span>Klik rincian lengkap →</span>
            <span className="text-slate-500 font-normal">{item.location}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// 2. Borrowing Detail
const BorrowingDetailView: React.FC<{ borrowings: any[]; search: string; onItemClick: (item: any) => void }> = ({
  borrowings, search, onItemClick,
}) => {
  const filtered = borrowings.filter(b =>
    !search ||
    b.itemName.toLowerCase().includes(search.toLowerCase()) ||
    b.borrowerName.toLowerCase().includes(search.toLowerCase())
  );

  if (filtered.length === 0) return <EmptyDetailState message="Tidak ada catatan peminjaman alat." />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {filtered.map(b => (
        <div
          key={b.id}
          onClick={() => onItemClick(b)}
          className="group bg-slate-900/80 hover:bg-slate-800/80 rounded-2xl p-4 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all duration-200 space-y-2"
        >
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold text-slate-100 text-sm leading-snug group-hover:text-emerald-300 transition-colors">
              {b.itemName}
            </h4>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
              b.status === 'Dikembalikan' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
              b.status === 'Terlambat' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
              'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {b.status}
            </span>
          </div>

          <div className="text-xs space-y-1 pt-1">
            <div className="flex items-center gap-1.5 text-slate-300">
              <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Peminjam: <strong className="text-white">{b.borrowerName}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Pinjam: {b.borrowDate} — Jatuh Tempo: {b.dueDate || b.expectedReturnDate || '-'}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
            <span>Klik rincian lengkap →</span>
            <span className="text-slate-500 font-normal">{b.quantity} unit</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// 3. Posko Detail
const PoskoDetailView: React.FC<{
  facilities: any[];
  rooms: any[];
  search: string;
  onFacilityClick: (item: any) => void;
  onRoomClick: (item: any) => void;
}> = ({ facilities, rooms, search, onFacilityClick, onRoomClick }) => {
  const filteredFac = facilities.filter(f =>
    !search ||
    f.facilityName.toLowerCase().includes(search.toLowerCase()) ||
    (f.category || f.facilityType || '').toLowerCase().includes(search.toLowerCase()) ||
    f.picName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Fasilitas Posko (Klik untuk Detail)</h4>
        {filteredFac.length === 0 ? (
          <EmptyDetailState message="Tidak ada fasilitas terpantau." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredFac.map(f => (
              <div
                key={f.id}
                onClick={() => onFacilityClick(f)}
                className="group bg-slate-900/80 hover:bg-slate-800/80 rounded-2xl p-4 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all duration-200 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-sky-400 font-bold uppercase">{f.category || f.facilityType || 'Fasilitas'}</span>
                    <h5 className="font-bold text-slate-100 text-sm leading-snug group-hover:text-emerald-300 transition-colors">{f.facilityName}</h5>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    f.status === 'Sangat Baik' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {f.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 space-y-0.5 pt-1">
                  <div>PIC: <strong className="text-slate-200">{f.picName}</strong></div>
                  <div className="line-clamp-1">Rincian: {f.details}</div>
                </div>
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
                  <span>Klik rincian lengkap →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {rooms.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Tata Letak Kamar Posko</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {rooms.map(r => (
              <div
                key={r.id}
                onClick={() => onRoomClick(r)}
                className="group bg-slate-900/60 hover:bg-slate-800/80 rounded-2xl p-3.5 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all duration-200"
              >
                <h5 className="font-bold text-slate-100 text-xs group-hover:text-emerald-300 transition-colors">{r.roomName}</h5>
                <div className="text-[11px] text-slate-400 mt-1">Kapasitas: <strong className="text-sky-400">{r.capacity} orang</strong></div>
                <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                  {Array.isArray(r.occupants) && r.occupants.length > 0 ? r.occupants.join(', ') : (r.currentOccupants || 'Penghuni Belum Diisi')}
                </div>
                <div className="pt-2 border-t border-slate-800/60 mt-2 text-[10px] text-emerald-400 font-semibold">
                  Klik rincian kamar →
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 4. Event Detail
const EventDetailView: React.FC<{ eventSetups: any[]; search: string; onItemClick: (item: any) => void }> = ({
  eventSetups, search, onItemClick,
}) => {
  const filtered = eventSetups.filter(e =>
    !search ||
    (e.eventName || e.eventTitle || '').toLowerCase().includes(search.toLowerCase()) ||
    e.location.toLowerCase().includes(search.toLowerCase())
  );

  if (filtered.length === 0) return <EmptyDetailState message="Tidak ada proker acara yang terdaftar." />;

  return (
    <div className="space-y-3">
      {filtered.map(evt => {
        const checklist = evt.requiredItems || evt.itemsChecklist || [];
        const totalItems = checklist.length;
        const readyItems = checklist.filter((i: any) => i.isReady).length;
        return (
          <div
            key={evt.id}
            onClick={() => onItemClick(evt)}
            className="group bg-slate-900/80 hover:bg-slate-800/80 rounded-2xl p-4 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all duration-200 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-100 text-sm leading-snug group-hover:text-emerald-300 transition-colors">
                  {evt.eventName || evt.eventTitle}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-500" /> {evt.eventDate}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {evt.location}</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 w-fit ${
                evt.setupStatus === 'Selesai' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                evt.setupStatus === 'Bahan Siap' || evt.setupStatus === 'Terpasang' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {evt.setupStatus}
              </span>
            </div>

            {totalItems > 0 && (
              <div className="bg-slate-950/60 rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-[11px] font-semibold text-slate-300">
                  <span>Checklist Logistik Proker</span>
                  <span className="text-teal-400">{readyItems} / {totalItems} Siap</span>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
              <span>Klik rincian lengkap →</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 5. Transport Detail
const TransportDetailView: React.FC<{ transports: any[]; search: string; onItemClick: (item: any) => void }> = ({
  transports, search, onItemClick,
}) => {
  const filtered = transports.filter(t =>
    !search ||
    t.vehicleName.toLowerCase().includes(search.toLowerCase()) ||
    t.driverName.toLowerCase().includes(search.toLowerCase()) ||
    (t.purpose || t.route || '').toLowerCase().includes(search.toLowerCase())
  );

  if (filtered.length === 0) return <EmptyDetailState message="Tidak ada armada transportasi yang terdaftar." />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {filtered.map(t => (
        <div
          key={t.id}
          onClick={() => onItemClick(t)}
          className="group bg-slate-900/80 hover:bg-slate-800/80 rounded-2xl p-4 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all duration-200 space-y-2"
        >
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold text-slate-100 text-sm leading-snug group-hover:text-emerald-300 transition-colors">
              {t.vehicleName} ({t.vehicleType || 'Mobil'})
            </h4>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
              t.status === 'Berjalan' ? 'bg-violet-500/10 text-violet-400 border-violet-500/30' :
              t.status === 'Selesai' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
              'bg-sky-500/10 text-sky-400 border-sky-500/30'
            }`}>
              {t.status}
            </span>
          </div>

          <div className="text-xs text-slate-300 space-y-1 pt-1">
            <div>Pengemudi / PJ: <strong className="text-white">{t.driverName}</strong></div>
            <div className="flex items-center gap-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Tujuan/Tugas: {t.purpose || t.route}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
            <span>Klik rincian lengkap →</span>
            <span className="text-slate-500 font-normal">{t.departureDate}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// 6. Maintenance Detail
const MaintenanceDetailView: React.FC<{ maintenanceLogs: any[]; search: string; onItemClick: (item: any) => void }> = ({
  maintenanceLogs, search, onItemClick,
}) => {
  const filtered = maintenanceLogs.filter(m =>
    !search ||
    m.itemName.toLowerCase().includes(search.toLowerCase()) ||
    m.reportedBy.toLowerCase().includes(search.toLowerCase()) ||
    (m.damageDescription || m.issueDescription || '').toLowerCase().includes(search.toLowerCase())
  );

  if (filtered.length === 0) return <EmptyDetailState message="Tidak ada laporan kerusakan / pemeliharaan barang." />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {filtered.map(m => (
        <div key={m.id} className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold text-slate-100 text-sm leading-snug">{m.itemName}</h4>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              m.status === 'Selesai Perbaikan' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
              m.status === 'Sedang Diperbaiki' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
              'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              {m.status}
            </span>
          </div>

          <div className="text-xs text-slate-300 space-y-1 pt-1">
            <div className="text-slate-400">Masalah: {m.issueDescription}</div>
            <div className="text-[11px] text-slate-500">Dilaporkan oleh: {m.reportedBy} ({m.dateReported})</div>
            {m.resolutionNotes && (
              <div className="text-[11px] text-emerald-400 italic bg-emerald-950/30 p-2 rounded-lg border border-emerald-500/20 mt-1">
                Solusi: {m.resolutionNotes}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const EmptyDetailState: React.FC<{ message: string }> = ({ message }) => (
  <div className="p-8 text-center glass-card rounded-2xl border border-slate-800">
    <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
    <div className="text-xs text-slate-400 font-medium">{message}</div>
  </div>
);
