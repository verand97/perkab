import React from 'react';
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
} from 'lucide-react';
import { usePerkab } from '../context/PerkabContext';
import { TabType } from './Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: TabType) => void;
  onOpenExport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenExport }) => {
  const {
    inventory,
    borrowings,
    facilities,
    eventSetups,
    transports,
    maintenanceLogs,
  } = usePerkab();

  // Metrics
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

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 border border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistem Manajemen Perkab & Akomodasi KKN</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Selamat Datang di Command Center Perkab!
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Pantau seluruh logistik kelompok, status peminjaman alat warga/kampus, kesiapan posko tempat tinggal, hingga pengembalian barang tepat waktu.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('inventory')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-lg shadow-emerald-600/25"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Logistik</span>
            </button>
            <button
              onClick={onOpenExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Download Excel/CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overdue / Urgent Alert Banner */}
      {overdueBorrowings.length > 0 && (
        <div className="rounded-xl bg-rose-950/40 border border-rose-500/40 p-4 flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400 flex-shrink-0">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-rose-200">
              Peringatan: {overdueBorrowings.length} Barang Peminjaman Melewati Tenggat Pengembalian!
            </h4>
            <p className="text-xs text-rose-300/80 mt-1">
              Segera hubungi pemilik atau kembalikan barang tepat waktu untuk menjaga hubungan baik dengan warga desa & kampus.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {overdueBorrowings.map(bor => (
                <div
                  key={bor.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-900/60 text-xs text-rose-100 border border-rose-700/50"
                >
                  <span className="font-semibold">{bor.itemName}</span>
                  <span className="text-[10px] text-rose-300">({bor.lenderName})</span>
                  <a
                    href={`https://wa.me/${bor.lenderPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 hover:bg-rose-800 rounded text-rose-300 hover:text-white"
                    title="Hubungi via WA"
                  >
                    <PhoneCall className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Inventaris */}
        <div
          onClick={() => onNavigate('inventory')}
          className="glass-panel glass-panel-hover rounded-2xl p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Logistik
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalInventoryCount}</span>
            <span className="text-xs text-slate-400">Unit / Barang</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800 text-slate-400">
            <span>Tersedia di Posko:</span>
            <span className="font-bold text-emerald-400">{availableInventoryCount} Item</span>
          </div>
        </div>

        {/* Card 2: Peminjaman */}
        <div
          onClick={() => onNavigate('borrowings')}
          className="glass-panel glass-panel-hover rounded-2xl p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pinjaman Aktif
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Handshake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{activeBorrowings.length}</span>
            <span className="text-xs text-slate-400">Barang Belum Kembali</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800 text-slate-400">
            <span>Tenggat Lewat:</span>
            <span className={`font-bold ${overdueBorrowings.length > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
              {overdueBorrowings.length} Item
            </span>
          </div>
        </div>

        {/* Card 3: Posko Health */}
        <div
          onClick={() => onNavigate('posko')}
          className="glass-panel glass-panel-hover rounded-2xl p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Kelayakan Posko
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:scale-110 transition-transform">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{poskoScore}%</span>
            <span className="text-xs text-emerald-400 font-semibold">Kondisi Baik</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800 text-slate-400">
            <span>Fasilitas Terdaftar:</span>
            <span className="font-bold text-slate-200">{facilities.length} Fasilitas</span>
          </div>
        </div>

        {/* Card 4: Proker & Transport */}
        <div
          onClick={() => onNavigate('events')}
          className="glass-panel glass-panel-hover rounded-2xl p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Proker & Mobilisasi
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{upcomingEvents.length}</span>
            <span className="text-xs text-slate-400">Setup Acara</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800 text-slate-400">
            <span>Armada Transport Aktif:</span>
            <span className="font-bold text-cyan-400">{activeTransports.length} Kendaraan</span>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Proker Equipment Readiness */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-emerald-400" />
                  <span>Kesiapan Logistik Program Kerja</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Status alat & perlengkapan yang perlu disiapkan untuk acara masyarakat
                </p>
              </div>

              <button
                onClick={() => onNavigate('events')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {eventSetups.map(evt => {
                const readyItems = evt.requiredItems.filter(i => i.isReady).length;
                const totalItems = evt.requiredItems.length;
                const percent = totalItems > 0 ? Math.round((readyItems / totalItems) * 100) : 0;

                return (
                  <div
                    key={evt.id}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{evt.eventName}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span className="flex items-center gap-1 text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {evt.eventDate}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-400 font-medium">{evt.location}</span>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          evt.setupStatus === 'Selesai'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : evt.setupStatus === 'Terpasang'
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                            : evt.setupStatus === 'Terangkut'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-slate-700 text-slate-300 border-slate-600'
                        }`}
                      >
                        {evt.setupStatus}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-400">Progress Alat Ready:</span>
                        <span className="font-semibold text-slate-200">
                          {readyItems} dari {totalItems} Alat ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Return & Maintenance Snapshot */}
        <div className="space-y-6">
          {/* Active Borrowing Monitor */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Handshake className="w-5 h-5 text-amber-400" />
                <span>Peminjaman Terdekat</span>
              </h3>
              <button
                onClick={() => onNavigate('borrowings')}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300"
              >
                Detail
              </button>
            </div>

            <div className="space-y-3">
              {activeBorrowings.slice(0, 3).map(bor => (
                <div
                  key={bor.id}
                  className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span>{bor.itemName}</span>
                    <span className="text-amber-400 font-semibold">{bor.quantity}x</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Pemilik: {bor.lenderName}</span>
                    <span>Tenggat: <strong className="text-slate-200">{bor.dueDate}</strong></span>
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

          {/* Maintenance / Damage Log Snapshot */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>Perbaikan & Kerusakan</span>
              </h3>
              <button
                onClick={() => onNavigate('maintenance')}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300"
              >
                Kelola
              </button>
            </div>

            <div className="space-y-3">
              {pendingMaintenance.map(log => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span>{log.itemName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {log.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {log.damageDescription}
                  </p>
                </div>
              ))}

              {pendingMaintenance.length === 0 && (
                <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 py-3">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Semua barang & fasilitas dalam kondisi aman!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
