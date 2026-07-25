import React, { useState } from 'react';
import {
  PackageCheck,
  Handshake,
  Home,
  CalendarCheck,
  AlertTriangle,
  FileSpreadsheet,
  PlusCircle,
  Clock,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  ArrowRight,
  Boxes,
  Backpack,
  Lock,
  Globe,
  Plus,
  X,
  User,
  ShieldCheck,
  AlertCircle,
  XCircle,
  ArrowRightLeft,
} from 'lucide-react';
import { usePerkab } from '../context/PerkabContext';
import { TabType } from './Sidebar';
import {
  PersonalLogisticsCategory,
  PersonalItemStatus,
  ItemCondition,
} from '../types';

interface DashboardViewProps {
  onNavigate: (tab: TabType) => void;
  onOpenExport: () => void;
}

const CATEGORIES: PersonalLogisticsCategory[] = [
  'Elektronik',
  'Pakaian',
  'Peralatan',
  'Makanan & Minuman',
  'Dokumen',
  'Kebutuhan Personal',
  'Lainnya',
];

const STATUS_CONFIG: Record<PersonalItemStatus, { label: string; icon: React.FC<{ className?: string }>; color: string; bg: string }> = {
  Terbawa:     { label: 'Terbawa',     icon: CheckCircle2,   color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  Ketinggalan: { label: 'Ketinggalan', icon: AlertCircle,    color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30' },
  Hilang:      { label: 'Hilang',      icon: XCircle,        color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/30' },
  Dipinjamkan: { label: 'Dipinjamkan', icon: ArrowRightLeft, color: 'text-sky-400',     bg: 'bg-sky-500/10 border-sky-500/30' },
};

const CATEGORY_COLORS: Record<PersonalLogisticsCategory, string> = {
  'Elektronik':         'bg-violet-500/15 text-violet-300 border-violet-500/30',
  'Pakaian':            'bg-pink-500/15 text-pink-300 border-pink-500/30',
  'Peralatan':          'bg-orange-500/15 text-orange-300 border-orange-500/30',
  'Makanan & Minuman':  'bg-lime-500/15 text-lime-300 border-lime-500/30',
  'Dokumen':            'bg-sky-500/15 text-sky-300 border-sky-500/30',
  'Kebutuhan Personal': 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  'Lainnya':            'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

const DEFAULT_PERSONAL_FORM = {
  itemName: '',
  category: 'Elektronik' as PersonalLogisticsCategory,
  quantity: 1,
  unit: 'buah',
  condition: 'Bagus' as ItemCondition,
  status: 'Terbawa' as PersonalItemStatus,
  isPrivate: true,
  notes: '',
};

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenExport }) => {
  const {
    currentUser,
    inventory,
    borrowings,
    facilities,
    eventSetups,
    transports,
    maintenanceLogs,
    personalLogistics,
    addPersonalItem,
    updatePersonalItem,
  } = usePerkab();

  const isAdmin = currentUser?.role === 'Admin';

  // Toggle View Mode: 'personal' (Anggota Dashboard) vs 'team' (Command Center Kelompok)
  const [viewMode, setViewMode] = useState<'personal' | 'team'>(isAdmin ? 'team' : 'personal');

  // Quick Add Personal Modal State
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
  const [personalForm, setPersonalForm] = useState({ ...DEFAULT_PERSONAL_FORM });

  // Metrics (Team)
  const totalInventoryCount = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const availableInventoryCount = inventory.reduce((sum, item) => sum + item.availableQty, 0);
  
  const activeBorrowings = borrowings.filter(b => b.status === 'Dipinjam');
  const overdueBorrowings = activeBorrowings.filter(b => {
    const due = new Date(b.dueDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    return due < today;
  });

  const goodFacilitiesCount = facilities.filter(f => f.status === 'Sangat Baik').length;
  const poskoScore = facilities.length > 0 ? Math.round((goodFacilitiesCount / facilities.length) * 100) : 100;

  const upcomingEvents = eventSetups.filter(e => e.setupStatus !== 'Selesai');
  const activeTransports = transports.filter(t => t.status !== 'Selesai');
  const pendingMaintenance = maintenanceLogs.filter(m => m.status !== 'Selesai Perbaikan');

  // Personal Metrics (Logged in user)
  const myPersonalItems = currentUser ? personalLogistics.filter(p => p.ownerId === currentUser.id) : [];
  const myTerbawaCount = myPersonalItems.filter(i => i.status === 'Terbawa').length;
  const myPrivateCount = myPersonalItems.filter(i => i.isPrivate).length;
  const myPublicCount = myPersonalItems.filter(i => !i.isPrivate).length;

  const handleAddPersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !personalForm.itemName.trim()) return;

    addPersonalItem({
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      itemName: personalForm.itemName.trim(),
      category: personalForm.category,
      quantity: personalForm.quantity,
      unit: personalForm.unit.trim() || 'buah',
      condition: personalForm.condition,
      status: personalForm.status,
      isPrivate: personalForm.isPrivate,
      notes: personalForm.notes.trim() || undefined,
    });

    setPersonalForm({ ...DEFAULT_PERSONAL_FORM });
    setIsPersonalModalOpen(false);
  };

  const togglePrivacy = (item: any) => {
    updatePersonalItem({ ...item, isPrivate: !item.isPrivate });
  };

  return (
    <div className="space-y-6">
      {/* ── SEGMENTED DASHBOARD SWITCHER TAB ───────────────────────── */}
      <div className="flex items-center justify-between gap-3 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-1.5 flex-1">
          <button
            type="button"
            onClick={() => setViewMode('personal')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'personal'
                ? 'bg-emerald-600 text-white shadow-lg border border-emerald-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Backpack className="w-4 h-4" />
            <span>Dashboard Personal Saya</span>
            {myPersonalItems.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px] font-black">
                {myPersonalItems.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setViewMode('team')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'team'
                ? 'bg-emerald-600 text-white shadow-lg border border-emerald-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Command Center Logistik Kelompok</span>
          </button>
        </div>

        {currentUser && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300 font-semibold capitalize">{currentUser.name}</span>
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              {currentUser.role}
            </span>
          </div>
        )}
      </div>

      {/* ── 1. ANGGOTA PERSONAL DASHBOARD VIEW ────────────────────── */}
      {viewMode === 'personal' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Personal Hero Banner */}
          <div className="glass-card hero-banner rounded-3xl p-6 lg:p-8 border border-slate-800 relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-heading">
                  <Backpack className="w-3.5 h-3.5" />
                  <span>DASHBOARD PERSONAL ANGGOTA KKN</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading">
                  Selamat Datang, {currentUser?.name || 'Anggota'}! 👋
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                  Kelola dan pantau barang bawaan pribadi, peralatan elektronik, serta logistik personal selama pelaksanaan KKN. Data privat hanya dapat dilihat oleh Anda.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsPersonalModalOpen(true)}
                  className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/25 active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Input Barang Pribadi</span>
                </button>
                <button
                  onClick={() => onNavigate('personal-logistics')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Backpack className="w-4 h-4 text-emerald-400" />
                  <span>Kelola Logistik Pribadi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Personal Quick Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
              <div className="text-2xl font-black text-white font-heading">{myPersonalItems.length}</div>
              <div className="text-xs font-bold text-slate-300">Total Barang Saya</div>
              <div className="text-[10px] text-slate-400">Tercatat di sistem</div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
              <div className="text-2xl font-black text-emerald-400 font-heading">{myTerbawaCount}</div>
              <div className="text-xs font-bold text-slate-300">Barang Terbawa</div>
              <div className="text-[10px] text-emerald-400/80">Siap di lokasi posko</div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
              <div className="text-2xl font-black text-violet-400 font-heading">{myPrivateCount}</div>
              <div className="text-xs font-bold text-slate-300">Mode Privat</div>
              <div className="text-[10px] text-violet-400/80">Hanya Anda yang dapat melihat</div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
              <div className="text-2xl font-black text-cyan-400 font-heading">{myPublicCount}</div>
              <div className="text-xs font-bold text-slate-300">Mode Berbagi (Publik)</div>
              <div className="text-[10px] text-cyan-400/80">Dapat dipinjamkan sesama anggota</div>
            </div>
          </div>

          {/* Personal Equipment Grid Section */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-heading">
                  <Backpack className="w-5 h-5 text-emerald-400" />
                  <span>Daftar Logistik &amp; Barang Bawaan Pribadi Saya</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Overview item pribadi yang Anda bawa ke posko KKN
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPersonalModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah</span>
                </button>
                <button
                  onClick={() => onNavigate('personal-logistics')}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-heading cursor-pointer"
                >
                  <span>Lihat Lengkap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {myPersonalItems.length === 0 ? (
              <div className="py-10 text-center space-y-3 bg-slate-900/60 rounded-2xl border border-slate-800/80 p-6">
                <Backpack className="w-12 h-12 text-slate-600 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Belum Ada Barang Pribadi yang Dicatat</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Catat laptop, charger, obat-obatan, pakaian, atau alat pribadi Anda agar aman dan mudah diidentifikasi di posko KKN.
                  </p>
                </div>
                <button
                  onClick={() => setIsPersonalModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Input Barang Bawaan Pertama Saya</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {myPersonalItems.slice(0, 6).map(item => {
                  const statusCfg = STATUS_CONFIG[item.status];
                  const StatusIcon = statusCfg.icon;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        item.isPrivate ? 'bg-violet-950/20 border-violet-500/30' : 'bg-slate-900/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-100 text-sm truncate">{item.itemName}</h4>
                          <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[item.category]}`}>
                            {item.category}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => togglePrivacy(item)}
                          className="shrink-0 p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-violet-400 transition-colors cursor-pointer"
                          title={item.isPrivate ? 'Ubah ke Mode Berbagi (Publik)' : 'Ubah ke Mode Privat'}
                        >
                          {item.isPrivate ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-violet-400 bg-violet-500/15 border border-violet-500/30 px-1.5 py-0.5 rounded-full">
                              <Lock className="w-2.5 h-2.5" /> Privat
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
                              <Globe className="w-2.5 h-2.5" /> Publik
                            </span>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                        <span className="text-slate-400">Jumlah: <strong className="text-white font-mono">{item.quantity} {item.unit}</strong></span>
                        <span className={`font-semibold text-[11px] ${item.condition === 'Bagus' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {item.condition}
                        </span>
                      </div>

                      <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold ${statusCfg.bg}`}>
                        <StatusIcon className={`w-3.5 h-3.5 ${statusCfg.color}`} />
                        <span className={statusCfg.color}>{statusCfg.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Compact Overview of Team Logistics for Anggota */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-heading">
                <Boxes className="w-5 h-5 text-teal-400" />
                <span>Ringkasan Logistik Tim &amp; Posko</span>
              </h3>
              <button
                onClick={() => setViewMode('team')}
                className="text-xs font-bold text-teal-400 hover:text-teal-300 font-heading cursor-pointer"
              >
                Buka Full Command Center →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div
                onClick={() => onNavigate('inventory')}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer space-y-1"
              >
                <div className="text-slate-400 font-semibold">Total Barang Kelompok</div>
                <div className="text-xl font-bold text-white font-heading">{totalInventoryCount} Unit</div>
                <div className="text-[10px] text-emerald-400">{availableInventoryCount} Unit Siap di Posko</div>
              </div>

              <div
                onClick={() => onNavigate('borrowings')}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer space-y-1"
              >
                <div className="text-slate-400 font-semibold">Peminjaman Alat Warga</div>
                <div className="text-xl font-bold text-amber-400 font-heading">{activeBorrowings.length} Alat</div>
                <div className="text-[10px] text-slate-400">{overdueBorrowings.length} Lewat Tenggat</div>
              </div>

              <div
                onClick={() => onNavigate('posko')}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer space-y-1"
              >
                <div className="text-slate-400 font-semibold">Kondisi Fasilitas Posko</div>
                <div className="text-xl font-bold text-teal-400 font-heading">{poskoScore}% Baik</div>
                <div className="text-[10px] text-slate-400">{facilities.length} Fasilitas Terdaftar</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. FULL TEAM COMMAND CENTER VIEW ──────────────────────── */}
      {viewMode === 'team' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Hero Banner Header */}
          <div className="glass-card hero-banner rounded-3xl p-6 lg:p-8 border border-slate-800 relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-heading">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>COMMAND CENTER LOGISTIK &amp; AKOMODASI KKN</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading">
                  Pusat Kendali Perlengkapan Kelompok
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                  Monitoring real-time status inventaris posko, jadwal peminjaman alat dari warga/kampus, kesiapan tempat acara proker, serta mobilisasi transportasi.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('inventory')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Tambah Logistik</span>
                </button>
                <button
                  onClick={onOpenExport}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-200 border border-emerald-400/60 text-xs font-extrabold shadow-lg shadow-emerald-950/50 active:scale-95 transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-400" />
                  <span>Download Rekap Excel</span>
                </button>
              </div>
            </div>
          </div>

          {/* Overdue Borrowing Alert */}
          {overdueBorrowings.length > 0 && (
            <div className="rounded-2xl bg-rose-950/40 border border-rose-500/40 p-4 flex items-start gap-4 shadow-xl">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="text-sm font-extrabold text-rose-200 font-heading">
                    Peringatan: {overdueBorrowings.length} Peminjaman Melewati Tenggat Pengembalian!
                  </h4>
                  <p className="text-xs text-rose-300/80 mt-0.5">
                    Segera koordinasi dengan pemilik barang / warga desa untuk menjaga nama baik kelompok KKN.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {overdueBorrowings.map(bor => (
                    <div
                      key={bor.id}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-rose-900/50 text-xs text-rose-100 border border-rose-700/50"
                    >
                      <span className="font-bold">{bor.itemName}</span>
                      <span className="text-[10px] text-rose-300">({bor.lenderName})</span>
                      <a
                        href={`https://wa.me/${bor.lenderPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 hover:bg-rose-800 rounded text-rose-300 hover:text-white"
                        title="Hubungi WhatsApp"
                      >
                        <PhoneCall className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div
              onClick={() => onNavigate('inventory')}
              className="glass-card glass-card-hover rounded-2xl p-5 cursor-pointer group space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest font-heading">
                  Total Logistik
                </span>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Boxes className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-white font-heading">{totalInventoryCount}</div>
                <p className="text-xs text-slate-400 mt-1">Total Unit Terdaftar</p>
              </div>
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Ready di Posko:</span>
                <strong className="text-emerald-400 font-mono font-bold">{availableInventoryCount} Unit</strong>
              </div>
            </div>

            {/* Metric 2 */}
            <div
              onClick={() => onNavigate('borrowings')}
              className="glass-card glass-card-hover rounded-2xl p-5 cursor-pointer group space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest font-heading">
                  Pinjaman Aktif
                </span>
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <Handshake className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-white font-heading">{activeBorrowings.length}</div>
                <p className="text-xs text-slate-400 mt-1">Barang Belum Kembali</p>
              </div>
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Tenggat Terlewati:</span>
                <strong className={`font-mono font-bold ${overdueBorrowings.length > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {overdueBorrowings.length} Barang
                </strong>
              </div>
            </div>

            {/* Metric 3 */}
            <div
              onClick={() => onNavigate('posko')}
              className="glass-card glass-card-hover rounded-2xl p-5 cursor-pointer group space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest font-heading">
                  Kelayakan Posko
                </span>
                <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:scale-110 transition-transform">
                  <Home className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-white font-heading">{poskoScore}%</div>
                <p className="text-xs text-emerald-400 font-semibold mt-1">Status Fasilitas Baik</p>
              </div>
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Fasilitas Terdaftar:</span>
                <strong className="text-slate-200 font-mono font-bold">{facilities.length} Item</strong>
              </div>
            </div>

            {/* Metric 4 */}
            <div
              onClick={() => onNavigate('events')}
              className="glass-card glass-card-hover rounded-2xl p-5 cursor-pointer group space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest font-heading">
                  Proker &amp; Mobilisasi
                </span>
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                  <CalendarCheck className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-white font-heading">{upcomingEvents.length}</div>
                <p className="text-xs text-slate-400 mt-1">Setup Acara Berlangsung</p>
              </div>
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Armada Transport Aktif:</span>
                <strong className="text-cyan-400 font-mono font-bold">{activeTransports.length} Kendaraan</strong>
              </div>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Proker Event Readiness */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card rounded-3xl p-6 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-heading">
                      <CalendarCheck className="w-5 h-5 text-emerald-400" />
                      <span>Kesiapan Logistik Program Kerja</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Prosentase perlengkapan &amp; alat yang disiapkan untuk acara masyarakat
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate('events')}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-heading cursor-pointer"
                  >
                    <span>Lihat Semua</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3.5">
                  {eventSetups.map(evt => {
                    const readyItems = evt.requiredItems.filter(i => i.isReady).length;
                    const totalItems = evt.requiredItems.length;
                    const percent = totalItems > 0 ? Math.round((readyItems / totalItems) * 100) : 0;

                    return (
                      <div
                        key={evt.id}
                        className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-white font-heading">{evt.eventName}</h4>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                              <span className="flex items-center gap-1 font-mono text-slate-300 text-[11px]">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {evt.eventDate}
                              </span>
                              <span>•</span>
                              <span className="text-emerald-400 font-semibold">{evt.location}</span>
                            </div>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                              evt.setupStatus === 'Selesai'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : evt.setupStatus === 'Terpasang'
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                                : evt.setupStatus === 'Terangkut'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {evt.setupStatus}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-slate-400">Status Alat Ready:</span>
                            <span className="font-bold text-slate-200 font-mono">
                              {readyItems} / {totalItems} Alat ({percent}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-linear-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {eventSetups.length === 0 && (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      Belum ada acara proker terdaftar. Klik "+ Buat Setup Proker Baru" untuk menambahkan.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Quick Feeds */}
            <div className="space-y-6">
              {/* Active Borrowing Card */}
              <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-heading">
                    <Handshake className="w-5 h-5 text-amber-400" />
                    <span>Pinjaman Terdekat</span>
                  </h3>
                  <button
                    onClick={() => onNavigate('borrowings')}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 font-heading cursor-pointer"
                  >
                    Detail
                  </button>
                </div>

                <div className="space-y-3">
                  {activeBorrowings.slice(0, 3).map(bor => (
                    <div
                      key={bor.id}
                      className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-100">
                        <span>{bor.itemName}</span>
                        <span className="text-amber-400 font-mono font-extrabold">{bor.quantity}x</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>Pemilik: {bor.lenderName}</span>
                        <span>Tenggat: <strong className="text-slate-200 font-mono">{bor.dueDate}</strong></span>
                      </div>
                    </div>
                  ))}

                  {activeBorrowings.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-4">
                      Tidak ada barang pinjaman aktif saat ini.
                    </p>
                  )}
                </div>
              </div>

              {/* Maintenance Snapshot */}
              <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-heading">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    <span>Pemeliharaan Barang</span>
                  </h3>
                  <button
                    onClick={() => onNavigate('maintenance')}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 font-heading cursor-pointer"
                  >
                    Kelola
                  </button>
                </div>

                <div className="space-y-3">
                  {pendingMaintenance.map(log => (
                    <div
                      key={log.id}
                      className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-200">
                        <span>{log.itemName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-300 font-extrabold border border-rose-500/30">
                          {log.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {log.damageDescription}
                      </p>
                    </div>
                  ))}

                  {pendingMaintenance.length === 0 && (
                    <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 py-3 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Semua barang &amp; posko dalam kondisi baik!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── QUICK ADD PERSONAL ITEM MODAL (INLINE) ─────────────────── */}
      {isPersonalModalOpen && (
        <div className="fixed inset-0 z-90 flex items-center justify-center p-3 sm:p-4 bg-slate-950/95 backdrop-blur-xl overflow-y-auto">
          <div className="glass-card rounded-2xl sm:rounded-3xl w-full max-w-md border border-slate-700 shadow-2xl p-5 space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2 font-heading">
                <Backpack className="w-5 h-5 text-emerald-400" />
                Catat Barang Pribadi Baru
              </h3>
              <button
                onClick={() => setIsPersonalModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPersonalSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Barang / Peralatan *</label>
                <input
                  type="text"
                  value={personalForm.itemName}
                  onChange={e => setPersonalForm(f => ({ ...f, itemName: e.target.value }))}
                  placeholder="cth: Laptop Lenovo, Charger HP, Sepatu Bot..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Kategori</label>
                <select
                  value={personalForm.category}
                  onChange={e => setPersonalForm(f => ({ ...f, category: e.target.value as PersonalLogisticsCategory }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Jumlah</label>
                  <input
                    type="number"
                    min={1}
                    value={personalForm.quantity}
                    onChange={e => setPersonalForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Satuan</label>
                  <input
                    type="text"
                    value={personalForm.unit}
                    onChange={e => setPersonalForm(f => ({ ...f, unit: e.target.value }))}
                    placeholder="buah, set, unit..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Kondisi</label>
                  <select
                    value={personalForm.condition}
                    onChange={e => setPersonalForm(f => ({ ...f, condition: e.target.value as ItemCondition }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
                  >
                    <option value="Bagus">Bagus</option>
                    <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                    <option value="Rusak">Rusak</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status Kesiapan</label>
                  <select
                    value={personalForm.status}
                    onChange={e => setPersonalForm(f => ({ ...f, status: e.target.value as PersonalItemStatus }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
                  >
                    <option value="Terbawa">Terbawa (di Posko)</option>
                    <option value="Ketinggalan">Ketinggalan</option>
                    <option value="Dipinjamkan">Dipinjamkan</option>
                    <option value="Hilang">Hilang</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Catatan Opsional</label>
                <textarea
                  value={personalForm.notes}
                  onChange={e => setPersonalForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="cth: Di lemari kamar 2, jangan dipindahkan..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs resize-none"
                />
              </div>

              {/* Privacy Setting */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${personalForm.isPrivate ? 'border-violet-500/40 bg-violet-950/20' : 'border-emerald-500/30 bg-emerald-950/10'}`}>
                <div className="flex items-center gap-2">
                  {personalForm.isPrivate ? <Lock className="w-4 h-4 text-violet-400" /> : <Globe className="w-4 h-4 text-emerald-400" />}
                  <div>
                    <div className={`font-bold ${personalForm.isPrivate ? 'text-violet-300' : 'text-emerald-300'}`}>
                      {personalForm.isPrivate ? 'Mode Privat' : 'Mode Publik / Berbagi'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {personalForm.isPrivate ? 'Hanya Anda yang melihat item ini' : 'Dapat dipinjamkan / dilihat sesama anggota'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPersonalForm(f => ({ ...f, isPrivate: !f.isPrivate }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${personalForm.isPrivate ? 'bg-violet-600' : 'bg-emerald-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${personalForm.isPrivate ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPersonalModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow cursor-pointer transition-all"
                >
                  Simpan Barang Pribadi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

