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
  TrendingUp,
  Boxes,
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
      {/* Hero Banner Header */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-heading">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COMMAND CENTER LOGISTIK & AKOMODASI KKN</span>
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Logistik</span>
            </button>
            <button
              onClick={onOpenExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
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
              Proker & Mobilisasi
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
                  Prosentase perlengkapan & alat yang disiapkan untuk acara masyarakat
                </p>
              </div>

              <button
                onClick={() => onNavigate('events')}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-heading"
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
                className="text-xs font-bold text-amber-400 hover:text-amber-300 font-heading"
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
                className="text-xs font-bold text-rose-400 hover:text-rose-300 font-heading"
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
                  <span>Semua barang & posko dalam kondisi baik!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
