import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  AlertOctagon,
  CheckCircle2,
  Clock,
  DollarSign,
  User,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { usePerkab } from '../context/PerkabContext';
import { MaintenanceLog, MaintenanceStatus } from '../types';
import { exportToCSV } from '../lib/exportExcel';
import { ImageUploader } from './ImageUploader';

export const MaintenanceView: React.FC = () => {
  const {
    maintenanceLogs,
    addMaintenanceLog,
    updateMaintenanceStatus,
  } = usePerkab();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<MaintenanceLog | null>(null);

  // Form state
  const [itemName, setItemName] = useState('');
  const [reportedBy, setReportedBy] = useState('');
  const [damageDescription, setDamageDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [imageUrl, setImageUrl] = useState('');

  // Resolution modal state
  const [mStatus, setMStatus] = useState<MaintenanceStatus>('Dalam Perbaikan');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMaintenanceLog({
      itemName,
      reportedBy,
      damageDescription,
      estimatedCost: Number(estimatedCost),
      status: 'Dilaporkan',
      imageUrl: imageUrl || undefined,
    });
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;
    updateMaintenanceStatus(editingLog.id, mStatus, resolutionNotes);
    setEditingLog(null);
    setResolutionNotes('');
  };

  const resetForm = () => {
    setItemName('');
    setReportedBy('');
    setDamageDescription('');
    setEstimatedCost(0);
    setImageUrl('');
  };

  const statuses: MaintenanceStatus[] = [
    'Dilaporkan',
    'Dalam Perbaikan',
    'Selesai Perbaikan',
    'Ganti Rugi',
  ];

  const handleExportCSV = () => {
    const data = maintenanceLogs.map(m => ({
      'Nama Barang': m.itemName,
      'Pelapor': m.reportedBy,
      'Tanggal Lapor': m.dateReported,
      'Deskripsi Kerusakan': m.damageDescription,
      'Estimasi Biaya (Rp)': m.estimatedCost,
      'Status': m.status,
      'Catatan Penyelesaian': m.resolutionNotes || '-',
    }));
    exportToCSV(data, 'Pemeliharaan_Barang_Rusak');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-rose-400" />
            <span>Pemeliharaan & Kerusakan Barang</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Merawat peralatan agar tidak rusak/hilang, mencatat penanganan perbaikan, dan histori akuntabilitas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Laporkan Barang Rusak</span>
          </button>
        </div>
      </div>

      {/* Logs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {maintenanceLogs.map(log => (
          <div
            key={log.id}
            className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {log.imageUrl && (
                <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-800 shrink-0 mb-3">
                  <img src={log.imageUrl} alt={log.itemName} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                    log.status === 'Selesai Perbaikan'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : log.status === 'Dalam Perbaikan'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : log.status === 'Ganti Rugi'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {log.status}
                </span>

                <span className="text-[11px] text-slate-400 font-mono">
                  Lapor: {log.dateReported}
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white">{log.itemName}</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  Pelapor: <strong className="text-slate-200">{log.reportedBy}</strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-2">
                <div className="text-slate-300">
                  <span className="text-slate-400 font-semibold block mb-0.5">Deskripsi Kerusakan:</span>
                  <p className="leading-relaxed">{log.damageDescription}</p>
                </div>

                {log.resolutionNotes && (
                  <div className="pt-2 border-t border-slate-700/60 text-emerald-300">
                    <span className="text-slate-400 font-semibold block mb-0.5">Solusi / Penanganan:</span>
                    <p className="leading-relaxed">{log.resolutionNotes}</p>
                  </div>
                )}
              </div>

              {log.estimatedCost > 0 && (
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-800/40">
                  <span className="text-slate-400">Estimasi Biaya Servis/Ganti:</span>
                  <span className="font-bold text-rose-400">
                    Rp {log.estimatedCost.toLocaleString('id-ID')}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  setEditingLog(log);
                  setMStatus(log.status);
                  setResolutionNotes(log.resolutionNotes || '');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
              >
                Update Status Perbaikan
              </button>
            </div>
          </div>
        ))}

        {maintenanceLogs.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 glass-panel rounded-2xl">
            Tidak ada laporan barang rusak. Semua alat dalam kondisi aman!
          </div>
        )}
      </div>

      {/* Modal Add Maintenance Log */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-card w-full max-w-lg rounded-3xl p-6 border border-slate-700 shadow-2xl my-auto max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="text-lg font-black text-white font-heading">Laporkan Barang Rusak / Perlu Perbaikan</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto py-3 pr-1 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Barang *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kabel Roll Stopkontak / Mic Wireless 2"
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Pelapor (Anggota KKN) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama pelapor"
                    value={reportedBy}
                    onChange={e => setReportedBy(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Estimasi Biaya (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={estimatedCost}
                    onChange={e => setEstimatedCost(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Deskripsi Kerusakan *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Penjelasan detail bagian mana yang rusak atau kendalanya..."
                  value={damageDescription}
                  onChange={e => setDamageDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <ImageUploader
                value={imageUrl}
                onChange={setImageUrl}
                label="Foto Bukti Kerusakan Barang (Opsional)"
              />

              <div className="shrink-0 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg"
                >
                  Kirim Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Update Status */}
      {editingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl my-auto max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="text-base font-extrabold text-white">
                Update Penanganan: {editingLog.itemName}
              </h3>
              <button
                type="button"
                onClick={() => setEditingLog(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="flex-1 overflow-y-auto py-3 pr-1 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Status Perbaikan *</label>
                <select
                  value={mStatus}
                  onChange={e => setMStatus(e.target.value as MaintenanceStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-rose-500"
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Catatan Penanganan / Ganti Rugi</label>
                <textarea
                  rows={3}
                  placeholder="Keterangan perbaikan, toko servis, atau penyelesaian..."
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="shrink-0 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow"
                >
                  Simpan Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
