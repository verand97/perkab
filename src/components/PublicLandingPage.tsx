import React, { useMemo } from 'react';
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
} from 'lucide-react';
import { usePerkab } from '../context/PerkabContext';

interface PublicLandingPageProps {
  onLoginClick: () => void;
}

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

  const modules = [
    {
      label: 'Pendataan Logistik', desc: 'Katalog & Inventaris Barang',
      icon: PackageCheck, iconBg: 'bg-emerald-500/15 text-emerald-400',
      border: 'border-emerald-500/20', gradient: 'from-emerald-500/10 to-transparent',
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
      label: 'Peminjaman Alat', desc: 'Pinjam Alat Warga/Kampus',
      icon: Handshake, iconBg: 'bg-amber-500/15 text-amber-400',
      border: 'border-amber-500/20', gradient: 'from-amber-500/10 to-transparent',
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
      label: 'Akomodasi & Posko', desc: 'Listrik, Air, Kamar & Dapur',
      icon: Home, iconBg: 'bg-sky-500/15 text-sky-400',
      border: 'border-sky-500/20', gradient: 'from-sky-500/10 to-transparent',
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
      label: 'Persiapan Tempat', desc: 'Logistik Proker Acara',
      icon: CalendarCheck, iconBg: 'bg-teal-500/15 text-teal-400',
      border: 'border-teal-500/20', gradient: 'from-teal-500/10 to-transparent',
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
      label: 'Pengaturan Transportasi', desc: 'Armada & Mobilisasi',
      icon: Truck, iconBg: 'bg-violet-500/15 text-violet-400',
      border: 'border-violet-500/20', gradient: 'from-violet-500/10 to-transparent',
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
      label: 'Pemeliharaan Barang', desc: 'Barang Rusak & Retur',
      icon: Wrench, iconBg: 'bg-rose-500/15 text-rose-400',
      border: 'border-rose-500/20', gradient: 'from-rose-500/10 to-transparent',
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
              <p className="text-slate-400 mt-3 max-w-md leading-relaxed">
                Pantau seluruh modul perlengkapan, akomodasi, dan logistik kelompok KKN secara transparan dan real-time.
              </p>
              <button
                onClick={onLoginClick}
                className="mt-5 flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-600/25 group w-fit"
              >
                <LogIn className="w-4 h-4" />
                Masuk ke Dashboard Admin
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
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

        {/* ── MODULE CARDS ──────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-300">Ringkasan Per Modul</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {modules.map(mod => {
              const Icon = mod.icon;
              const pct  = mod.ring.total > 0 ? Math.round((mod.ring.value / mod.ring.total) * 100) : 0;
              return (
                <div key={mod.label}
                  className={`glass-card rounded-2xl overflow-hidden border ${mod.border} bg-linear-to-br ${mod.gradient}`}
                >
                  {/* Header */}
                  <div className="p-4 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${mod.iconBg} border border-white/5`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-100 leading-tight">{mod.label}</div>
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

                  {/* Progress */}
                  <div className="px-4 pb-4 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>{mod.primary.label}</span>
                      <span className="font-bold" style={{ color: mod.accentColor }}>{mod.primary.value} item</span>
                    </div>
                    <Bar value={mod.ring.value} total={mod.ring.total} color={mod.accentColor} />
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

        {/* ── CTA BOTTOM ────────────────────────────────────────────── */}
        <div className="relative overflow-hidden glass-card rounded-2xl p-8 border border-emerald-500/20 text-center">
          <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 via-transparent to-violet-500/5 pointer-events-none" />
          <div className="relative">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 mb-4">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Kelola Logistik KKN Lebih Efisien</h3>
            <p className="text-slate-400 text-sm mb-5 max-w-md mx-auto">
              Login sebagai anggota atau admin untuk mencatat, memperbarui, dan mengelola semua data logistik kelompok KKN.
            </p>
            <button
              onClick={onLoginClick}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold transition-all shadow-xl shadow-emerald-600/25 group"
            >
              <LogIn className="w-4 h-4" />
              Masuk ke Dashboard Admin
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
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

    </div>
  );
};
