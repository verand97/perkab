import React, { useMemo } from 'react';
import {
  LayoutGrid,
  PackageCheck,
  Handshake,
  Home,
  CalendarCheck,
  Truck,
  Wrench,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  Activity,
  ArrowRight,
  Zap,
  Shield,
  Star,
} from 'lucide-react';
import { usePerkab } from '../context/PerkabContext';
import { TabType } from './Sidebar';

interface SharedBoardViewProps {
  onNavigate?: (tab: TabType) => void;
}

// Mini ring chart (SVG)
const RingChart: React.FC<{ value: number; total: number; color: string; size?: number }> = ({
  value, total, color, size = 52,
}) => {
  const pct   = total > 0 ? value / total : 0;
  const r     = (size - 8) / 2;
  const circ  = 2 * Math.PI * r;
  const dash  = pct * circ;
  const cx    = size / 2;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }} />
    </svg>
  );
};

// Progress bar
const Bar: React.FC<{ value: number; total: number; color: string }> = ({ value, total, color }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
      <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
};

export const SharedBoardView: React.FC<SharedBoardViewProps> = ({ onNavigate }) => {
  const {
    inventory,
    borrowings,
    facilities,
    rooms,
    eventSetups,
    transports,
    maintenanceLogs,
    users,
    currentUser,
  } = usePerkab();

  // ── Computed Stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const invAvailable   = inventory.filter(i => i.availableQty > 0).length;
    const invRusak       = inventory.filter(i => i.condition === 'Rusak').length;

    const borActive      = borrowings.filter(b => b.status === 'Dipinjam').length;
    const borTerlambat   = borrowings.filter(b => b.status === 'Terlambat').length;
    const borReturned    = borrowings.filter(b => b.status === 'Dikembalikan').length;

    const facBaik        = facilities.filter(f => f.status === 'Sangat Baik').length;
    const facIssue       = facilities.filter(f => f.status !== 'Sangat Baik').length;

    const evtActive      = eventSetups.filter(e => e.setupStatus !== 'Selesai').length;
    const evtDone        = eventSetups.filter(e => e.setupStatus === 'Selesai').length;

    const trpBerjalan    = transports.filter(t => t.status === 'Berjalan').length;
    const trpJadwal      = transports.filter(t => t.status === 'Jadwal').length;

    const mtnPending     = maintenanceLogs.filter(m => m.status !== 'Selesai Perbaikan').length;
    const mtnDone        = maintenanceLogs.filter(m => m.status === 'Selesai Perbaikan').length;

    return {
      inventory:   { total: inventory.length,       available: invAvailable, rusak: invRusak },
      borrowings:  { total: borrowings.length,       active: borActive, terlambat: borTerlambat, returned: borReturned },
      facilities:  { total: facilities.length,       baik: facBaik, issue: facIssue },
      rooms:       { total: rooms.length },
      events:      { total: eventSetups.length,      active: evtActive, done: evtDone },
      transports:  { total: transports.length,       berjalan: trpBerjalan, jadwal: trpJadwal },
      maintenance: { total: maintenanceLogs.length,  pending: mtnPending, done: mtnDone },
      users:       { total: users.length },
    };
  }, [inventory, borrowings, facilities, rooms, eventSetups, transports, maintenanceLogs, users]);

  const totalItems      = stats.inventory.total + stats.borrowings.total + stats.events.total + stats.transports.total;
  const totalIssues     = stats.borrowings.terlambat + stats.facilities.issue + stats.maintenance.pending;
  const overallHealth   = totalItems > 0 ? Math.max(0, Math.round(100 - (totalIssues / Math.max(totalItems, 1)) * 100)) : 100;

  // ── Module Cards Config ─────────────────────────────────────────────────
  const modules = [
    {
      id: 'inventory' as TabType,
      label: 'Pendataan Logistik',
      desc: 'Katalog & Inventaris Barang',
      icon: PackageCheck,
      gradient: 'from-emerald-500/20 to-teal-600/10',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/15 text-emerald-400',
      accentColor: '#10b981',
      primary: { label: 'Total Barang', value: stats.inventory.total },
      secondary: [
        { label: 'Tersedia',  value: stats.inventory.available, color: 'text-emerald-400' },
        { label: 'Rusak',     value: stats.inventory.rusak,     color: 'text-rose-400' },
      ],
      ring: { value: stats.inventory.available, total: stats.inventory.total, color: '#10b981' },
      alert: stats.inventory.rusak > 0 ? { msg: `${stats.inventory.rusak} barang rusak`, type: 'warn' as const } : null,
    },
    {
      id: 'borrowings' as TabType,
      label: 'Peminjaman Alat',
      desc: 'Pinjam Alat Warga/Kampus',
      icon: Handshake,
      gradient: 'from-amber-500/20 to-orange-600/10',
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/15 text-amber-400',
      accentColor: '#f59e0b',
      primary: { label: 'Total Peminjaman', value: stats.borrowings.total },
      secondary: [
        { label: 'Aktif',       value: stats.borrowings.active,    color: 'text-amber-400' },
        { label: 'Terlambat',   value: stats.borrowings.terlambat, color: 'text-rose-400' },
        { label: 'Dikembalikan',value: stats.borrowings.returned,  color: 'text-emerald-400' },
      ],
      ring: { value: stats.borrowings.returned, total: stats.borrowings.total, color: '#f59e0b' },
      alert: stats.borrowings.terlambat > 0 ? { msg: `${stats.borrowings.terlambat} terlambat!`, type: 'danger' as const } : null,
    },
    {
      id: 'posko' as TabType,
      label: 'Akomodasi & Posko',
      desc: 'Listrik, Air, Kamar & Dapur',
      icon: Home,
      gradient: 'from-sky-500/20 to-blue-600/10',
      border: 'border-sky-500/20',
      iconBg: 'bg-sky-500/15 text-sky-400',
      accentColor: '#0ea5e9',
      primary: { label: 'Fasilitas Terpantau', value: stats.facilities.total },
      secondary: [
        { label: 'Kondisi Baik', value: stats.facilities.baik,  color: 'text-emerald-400' },
        { label: 'Perlu Perhatian', value: stats.facilities.issue, color: 'text-amber-400' },
        { label: 'Kamar', value: stats.rooms.total, color: 'text-sky-400' },
      ],
      ring: { value: stats.facilities.baik, total: stats.facilities.total, color: '#0ea5e9' },
      alert: stats.facilities.issue > 0 ? { msg: `${stats.facilities.issue} fasilitas perlu perhatian`, type: 'warn' as const } : null,
    },
    {
      id: 'events' as TabType,
      label: 'Persiapan Tempat',
      desc: 'Logistik Proker Acara',
      icon: CalendarCheck,
      gradient: 'from-teal-500/20 to-cyan-600/10',
      border: 'border-teal-500/20',
      iconBg: 'bg-teal-500/15 text-teal-400',
      accentColor: '#14b8a6',
      primary: { label: 'Total Proker', value: stats.events.total },
      secondary: [
        { label: 'Berlangsung', value: stats.events.active, color: 'text-teal-400' },
        { label: 'Selesai',     value: stats.events.done,   color: 'text-emerald-400' },
      ],
      ring: { value: stats.events.done, total: stats.events.total, color: '#14b8a6' },
      alert: null,
    },
    {
      id: 'transport' as TabType,
      label: 'Pengaturan Transportasi',
      desc: 'Armada & Mobilisasi',
      icon: Truck,
      gradient: 'from-violet-500/20 to-purple-600/10',
      border: 'border-violet-500/20',
      iconBg: 'bg-violet-500/15 text-violet-400',
      accentColor: '#8b5cf6',
      primary: { label: 'Total Armada', value: stats.transports.total },
      secondary: [
        { label: 'Berjalan', value: stats.transports.berjalan, color: 'text-violet-400' },
        { label: 'Terjadwal', value: stats.transports.jadwal,  color: 'text-sky-400' },
      ],
      ring: { value: stats.transports.berjalan + stats.transports.jadwal, total: stats.transports.total, color: '#8b5cf6' },
      alert: null,
    },
    {
      id: 'maintenance' as TabType,
      label: 'Pemeliharaan Barang',
      desc: 'Barang Rusak & Retur',
      icon: Wrench,
      gradient: 'from-rose-500/20 to-pink-600/10',
      border: 'border-rose-500/20',
      iconBg: 'bg-rose-500/15 text-rose-400',
      accentColor: '#f43f5e',
      primary: { label: 'Total Laporan', value: stats.maintenance.total },
      secondary: [
        { label: 'Pending',   value: stats.maintenance.pending, color: 'text-rose-400' },
        { label: 'Selesai',   value: stats.maintenance.done,    color: 'text-emerald-400' },
      ],
      ring: { value: stats.maintenance.done, total: stats.maintenance.total, color: '#f43f5e' },
      alert: stats.maintenance.pending > 0 ? { msg: `${stats.maintenance.pending} laporan menunggu`, type: 'warn' as const } : null,
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden glass-card rounded-2xl p-6 border border-emerald-500/20">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-violet-500/10  rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Title */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/20">
                <LayoutGrid className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
                Papan Informasi Publik
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 leading-tight">
              Status Logistik & Operasional
            </h1>
            <p className="text-sm text-slate-400 mt-1.5">
              Ringkasan seluruh modul perkab KKN —{' '}
              <span className="text-emerald-400 font-semibold capitalize">{currentUser?.name}</span>
            </p>
          </div>

          {/* Health meter */}
          <div className="flex items-center gap-5 shrink-0">
            {/* Donut */}
            <div className="relative">
              <RingChart value={overallHealth} total={100} color={overallHealth >= 80 ? '#10b981' : overallHealth >= 60 ? '#f59e0b' : '#f43f5e'} size={72} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-sm font-black ${overallHealth >= 80 ? 'text-emerald-400' : overallHealth >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {overallHealth}%
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-300 mb-0.5">Kesehatan Sistem</div>
              <div className={`text-sm font-black flex items-center gap-1 ${overallHealth >= 80 ? 'text-emerald-400' : overallHealth >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                {overallHealth >= 80 ? <><CheckCircle2 className="w-3.5 h-3.5" /> Sangat Baik</> : overallHealth >= 60 ? <><AlertCircle className="w-3.5 h-3.5" /> Perlu Perhatian</> : <><XCircle className="w-3.5 h-3.5" /> Kritis</>}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{totalIssues} isu aktif terdeteksi</div>
            </div>
          </div>
        </div>

        {/* ── Global Stats Strip ───────────────────────────────────── */}
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/60">
          {[
            { label: 'Total Barang',    value: stats.inventory.total,  icon: PackageCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Peminjaman Aktif',value: stats.borrowings.active, icon: Handshake,    color: 'text-amber-400',   bg: 'bg-amber-500/10' },
            { label: 'Anggota KKN',     value: stats.users.total,      icon: Users,        color: 'text-sky-400',     bg: 'bg-sky-500/10' },
            { label: 'Isu Terdeteksi',  value: totalIssues,            icon: Activity,     color: totalIssues > 0 ? 'text-rose-400' : 'text-emerald-400', bg: totalIssues > 0 ? 'bg-rose-500/10' : 'bg-emerald-500/10' },
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

      {/* ── MODULE GRID ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {modules.map(mod => {
          const Icon = mod.icon;
          const pct  = mod.ring.total > 0 ? Math.round((mod.ring.value / mod.ring.total) * 100) : 0;
          return (
            <div
              key={mod.id}
              className={`group glass-card rounded-2xl overflow-hidden border ${mod.border} bg-linear-to-br ${mod.gradient} hover:scale-[1.02] transition-all duration-200 cursor-pointer`}
              onClick={() => onNavigate?.(mod.id)}
            >
              {/* Card header */}
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
                  {/* Mini ring + pct */}
                  <div className="relative shrink-0">
                    <RingChart value={mod.ring.value} total={mod.ring.total} color={mod.accentColor} size={44} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[9px] font-black" style={{ color: mod.accentColor }}>{pct}%</span>
                    </div>
                  </div>
                </div>

                {/* Alert badge */}
                {mod.alert && (
                  <div className={`mt-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border ${
                    mod.alert.type === 'danger'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  }`}>
                    {mod.alert.type === 'danger' ? <XCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {mod.alert.msg}
                  </div>
                )}
              </div>

              {/* Stats row */}
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

              {/* Progress bar */}
              <div className="px-4 pb-4 space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>{mod.primary.label}</span>
                  <span className="font-bold" style={{ color: mod.accentColor }}>{mod.primary.value} item</span>
                </div>
                <Bar value={mod.ring.value} total={mod.ring.total} color={mod.accentColor} />
              </div>

              {/* Footer CTA */}
              <div className={`px-4 py-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-semibold text-slate-400 group-hover:text-slate-200 transition-colors`}>
                <span>Lihat detail modul</span>
                <ArrowRight className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── RECENT STATUS BADGES ─────────────────────────────────────── */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800/60">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-slate-200">Status Cepat</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

          {/* Inventory health */}
          <div className="bg-slate-900/60 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-semibold">Ketersediaan Barang</span>
              <span className="text-xs font-black text-emerald-400">{stats.inventory.available}/{stats.inventory.total}</span>
            </div>
            <Bar value={stats.inventory.available} total={stats.inventory.total} color="#10b981" />
            <div className="text-[10px] text-slate-500 mt-1.5">
              {stats.inventory.rusak > 0 ? `⚠ ${stats.inventory.rusak} barang kondisi rusak` : '✓ Semua barang dalam kondisi baik'}
            </div>
          </div>

          {/* Borrowing return rate */}
          <div className="bg-slate-900/60 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-semibold">Tingkat Pengembalian</span>
              <span className="text-xs font-black text-amber-400">{stats.borrowings.returned}/{stats.borrowings.total}</span>
            </div>
            <Bar value={stats.borrowings.returned} total={stats.borrowings.total} color="#f59e0b" />
            <div className="text-[10px] text-slate-500 mt-1.5">
              {stats.borrowings.terlambat > 0 ? `🔴 ${stats.borrowings.terlambat} peminjaman terlambat` : `🟢 ${stats.borrowings.active} aktif dipinjam`}
            </div>
          </div>

          {/* Facility health */}
          <div className="bg-slate-900/60 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-semibold">Kondisi Fasilitas Posko</span>
              <span className="text-xs font-black text-sky-400">{stats.facilities.baik}/{stats.facilities.total}</span>
            </div>
            <Bar value={stats.facilities.baik} total={stats.facilities.total} color="#0ea5e9" />
            <div className="text-[10px] text-slate-500 mt-1.5">
              {stats.facilities.issue > 0 ? `⚠ ${stats.facilities.issue} fasilitas perlu pengecekan` : '✓ Semua fasilitas dalam kondisi baik'}
            </div>
          </div>

          {/* Event progress */}
          <div className="bg-slate-900/60 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-semibold">Selesai Persiapan Tempat</span>
              <span className="text-xs font-black text-teal-400">{stats.events.done}/{stats.events.total}</span>
            </div>
            <Bar value={stats.events.done} total={stats.events.total} color="#14b8a6" />
            <div className="text-[10px] text-slate-500 mt-1.5">
              {stats.events.active > 0 ? `⏳ ${stats.events.active} proker sedang dipersiapkan` : '✓ Semua proker selesai disiapkan'}
            </div>
          </div>

          {/* Transport active */}
          <div className="bg-slate-900/60 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-semibold">Transportasi Aktif</span>
              <span className="text-xs font-black text-violet-400">{stats.transports.berjalan + stats.transports.jadwal}/{stats.transports.total}</span>
            </div>
            <Bar value={stats.transports.berjalan + stats.transports.jadwal} total={stats.transports.total} color="#8b5cf6" />
            <div className="text-[10px] text-slate-500 mt-1.5">
              {stats.transports.berjalan > 0 ? `🚛 ${stats.transports.berjalan} armada sedang berjalan` : `📅 ${stats.transports.jadwal} armada terjadwal`}
            </div>
          </div>

          {/* Maintenance resolve rate */}
          <div className="bg-slate-900/60 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-semibold">Selesai Pemeliharaan</span>
              <span className="text-xs font-black text-rose-400">{stats.maintenance.done}/{stats.maintenance.total}</span>
            </div>
            <Bar value={stats.maintenance.done} total={stats.maintenance.total} color="#f43f5e" />
            <div className="text-[10px] text-slate-500 mt-1.5">
              {stats.maintenance.pending > 0 ? `🔧 ${stats.maintenance.pending} laporan belum diselesaikan` : '✓ Semua laporan kerusakan teratasi'}
            </div>
          </div>

        </div>
      </div>

      {/* ── FOOTER NOTE ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-3 text-[10px] text-slate-600 py-2">
        <Shield className="w-3 h-3" />
        <span>Data ditampilkan secara real-time dari sistem Perkab KKN</span>
        <Star className="w-3 h-3" />
        <span>Klik modul untuk membuka detail</span>
        <TrendingUp className="w-3 h-3" />
      </div>

    </div>
  );
};
