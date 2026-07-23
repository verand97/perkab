import React, { useState } from 'react';
import {
  Handshake,
  Plus,
  Search,
  Calendar,
  Clock,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
  FileSpreadsheet,
  Trash2,
  Package,
} from 'lucide-react';
import { usePerkab } from '../context/PerkabContext';
import { BorrowingRecord, BorrowingStatus, ReturnCondition } from '../types';
import { exportToCSV } from '../lib/exportExcel';
import { ImageUploader } from './ImageUploader';

export const BorrowingView: React.FC = () => {
  const {
    borrowings,
    inventory,
    addBorrowingRecord,
    returnBorrowingItem,
    deleteBorrowingRecord,
    showConfirm,
  } = usePerkab();

  const [activeTab, setActiveTab] = useState<'DIPINJAM' | 'DIKEMBALIKAN' | 'ALL'>('DIPINJAM');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [returningItem, setReturningItem] = useState<BorrowingRecord | null>(null);

  // Return Form State
  const [returnCondition, setReturnCondition] = useState<ReturnCondition>('Bagus');
  const [returnNotes, setReturnNotes] = useState('');

  // Add Form State
  const [formData, setFormData] = useState({
    itemName: '',
    inventoryId: '',
    lenderName: '',
    lenderPhone: '',
    borrowerName: '',
    borrowDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    quantity: 1,
    depositCost: 0,
    imageUrl: '',
    notes: '',
  });

  // Filtered List
  const filteredBorrowings = borrowings.filter(bor => {
    const matchesTab =
      activeTab === 'ALL' ||
      (activeTab === 'DIPINJAM' && bor.status === 'Dipinjam') ||
      (activeTab === 'DIKEMBALIKAN' && bor.status === 'Dikembalikan');

    const matchesSearch =
      bor.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bor.lenderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bor.borrowerName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const activeCount = borrowings.filter(b => b.status === 'Dipinjam').length;
  const returnedCount = borrowings.filter(b => b.status === 'Dikembalikan').length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBorrowingRecord({
      itemName: formData.itemName,
      inventoryId: formData.inventoryId || undefined,
      lenderName: formData.lenderName,
      lenderPhone: formData.lenderPhone,
      borrowerName: formData.borrowerName,
      borrowDate: formData.borrowDate,
      dueDate: formData.dueDate,
      quantity: Number(formData.quantity),
      depositCost: Number(formData.depositCost),
      status: 'Dipinjam',
      imageUrl: formData.imageUrl || undefined,
      notes: formData.notes || undefined,
    });
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningItem) return;
    returnBorrowingItem(returningItem.id, returnCondition, returnNotes);
    setReturningItem(null);
    setReturnNotes('');
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      inventoryId: '',
      lenderName: '',
      lenderPhone: '',
      borrowerName: '',
      borrowDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      quantity: 1,
      depositCost: 0,
      imageUrl: '',
      notes: '',
    });
  };

  const handleSelectInventoryItem = (invId: string) => {
    const found = inventory.find(i => i.id === invId);
    if (found) {
      setFormData(prev => ({
        ...prev,
        inventoryId: invId,
        itemName: found.name,
        lenderName: found.ownership === 'Kelompok' ? 'Gudang Posko KKN' : (found.lenderName || 'Warga Desa'),
        imageUrl: found.imageUrl || prev.imageUrl,
      }));
    }
  };

  const handleExportCSV = () => {
    const exportData = filteredBorrowings.map(b => ({
      'Nama Barang': b.itemName,
      'Pemilik / Asal': b.lenderName,
      'No. HP Pemilik': b.lenderPhone || '-',
      'Penanggung Jawab / Peminjam': b.borrowerName,
      'Tanggal Pinjam': b.borrowDate,
      'Tenggat Kembali': b.dueDate,
      'Tanggal Dikembalikan': b.returnDate || '-',
      'Jumlah': b.quantity,
      'Biaya Deposit': b.depositCost,
      'Status': b.status,
      'Kondisi Kembali': b.conditionOnReturn || '-',
      'Catatan': b.notes || '-',
    }));
    exportToCSV(exportData, 'Peminjaman_Alat_Logistik');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white dark:text-white light:text-slate-900 tracking-tight flex items-center gap-2 font-heading">
            <Handshake className="w-6 h-6 text-amber-400" />
            <span>Peminjaman Alat & Logistik</span>
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-500 mt-1">
            Pencatatan pinjam-meminjam peralatan dengan warga desa, sekolah, balai desa, atau kampus
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-white text-slate-200 dark:text-slate-200 light:text-slate-800 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-xs font-bold transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold shadow-md shadow-amber-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Peminjaman Baru</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="glass-card rounded-2xl p-4 space-y-4 border border-slate-800 dark:border-slate-800 light:border-slate-200">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Tab Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('DIPINJAM')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'DIPINJAM'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 dark:bg-slate-900 light:bg-slate-100 text-slate-400 light:text-slate-600 border border-slate-800 dark:border-slate-800 light:border-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Sedang Dipinjam ({activeCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('DIKEMBALIKAN')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'DIKEMBALIKAN'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 dark:bg-slate-900 light:bg-slate-100 text-slate-400 light:text-slate-600 border border-slate-800 dark:border-slate-800 light:border-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sudah Dikembalikan ({returnedCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'bg-slate-900 dark:bg-slate-900 light:bg-slate-100 text-slate-400 light:text-slate-600 border border-slate-800 dark:border-slate-800 light:border-slate-200'
              }`}
            >
              Semua ({borrowings.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama barang, peminjam, atau pemilik..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 text-xs text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Borrowing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBorrowings.map(bor => {
          const isOverdue =
            bor.status === 'Dipinjam' &&
            new Date(bor.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

          return (
            <div
              key={bor.id}
              className={`glass-card glass-card-hover rounded-2xl p-5 border space-y-4 flex flex-col justify-between ${
                isOverdue
                  ? 'border-rose-500/50 bg-rose-950/20'
                  : bor.status === 'Dikembalikan'
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : 'border-slate-800 dark:border-slate-800 light:border-slate-200'
              }`}
            >
              <div className="space-y-3">
                {bor.imageUrl && (
                  <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-800 shrink-0">
                    <img src={bor.imageUrl} alt={bor.itemName} className="w-full h-full object-cover" />
                  </div>
                )}
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider font-heading">
                      Peminjaman Logistik
                    </span>
                    <h3 className="text-base font-black text-white dark:text-white light:text-slate-900 font-heading leading-snug">
                      {bor.itemName}
                    </h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border shrink-0 ${
                      isOverdue
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : bor.status === 'Dikembalikan'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {isOverdue ? 'Terlambat' : bor.status}
                  </span>
                </div>

                {/* Info List */}
                <div className="space-y-1.5 text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 p-3 rounded-xl border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Pemilik / Sumber:</span>
                    <strong className="text-white dark:text-white light:text-slate-900">{bor.lenderName}</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Penanggung Jawab:</span>
                    <strong className="text-amber-400 font-semibold">{bor.borrowerName}</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Jumlah Unit:</span>
                    <strong className="font-mono text-emerald-400 font-bold">{bor.quantity} Unit</strong>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-900/40 dark:bg-slate-900/40 light:bg-slate-100 text-slate-400">
                    <span className="block text-[9px] uppercase font-bold text-slate-500">Tgl Pinjam</span>
                    <span className="font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800 font-mono">{bor.borrowDate}</span>
                  </div>

                  <div
                    className={`p-2 rounded-xl ${
                      isOverdue ? 'bg-rose-950/60 text-rose-300' : 'bg-slate-900/40 dark:bg-slate-900/40 light:bg-slate-100 text-slate-400'
                    }`}
                  >
                    <span className="block text-[9px] uppercase font-bold text-slate-500">Tenggat Kembali</span>
                    <span className="font-bold font-mono text-slate-100 dark:text-slate-100 light:text-slate-900">{bor.dueDate}</span>
                  </div>
                </div>

                {bor.lenderPhone && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs">
                    <span className="text-[11px] text-emerald-300 font-mono">{bor.lenderPhone}</span>
                    <a
                      href={`https://wa.me/${bor.lenderPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold shadow"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Kontak WA</span>
                    </a>
                  </div>
                )}

                {bor.notes && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-900/40 p-2 rounded-lg">
                    "{bor.notes}"
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
                {bor.status === 'Dipinjam' ? (
                  <button
                    onClick={() => setReturningItem(bor)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Kembalikan Barang</span>
                  </button>
                ) : (
                  <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold py-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Kembali {bor.returnDate} ({bor.conditionOnReturn})</span>
                  </div>
                )}

                <button
                  onClick={() => {
                    showConfirm({
                      title: 'Hapus Peminjaman Alat',
                      message: `Apakah Anda yakin ingin menghapus data peminjaman "${bor.itemName}" (${bor.lenderName})?`,
                      confirmText: 'Ya, Hapus Record',
                      danger: true,
                      onConfirm: () => deleteBorrowingRecord(bor.id),
                    });
                  }}
                  className="p-2 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-slate-100 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 dark:border-slate-800 light:border-slate-300"
                  title="Hapus Record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredBorrowings.length === 0 && (
          <div className="col-span-full glass-card rounded-2xl py-12 text-center text-slate-500 text-xs">
            Belum ada record peminjaman yang sesuai. Klik "+ Catat Peminjaman Baru" untuk memasukkan data.
          </div>
        )}
      </div>

      {/* Modal Add Borrowing */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-lg rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-black text-white font-heading">
                Catat Peminjaman Alat Logistik Baru
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Pilih Dari Inventaris Posko (Opsional)</label>
                <select
                  value={formData.inventoryId}
                  onChange={e => handleSelectInventoryItem(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500 font-semibold"
                >
                  <option value="">-- Pilih dari Katalog Inventaris --</option>
                  {inventory.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.code} - {inv.name} (Tersedia: {inv.availableQty} {inv.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Nama Barang Dipinjam *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Proyektor Epson / Spanduk Selamat Datang"
                  value={formData.itemName}
                  onChange={e => setFormData({ ...formData, itemName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Pemilik / Tempat Pinjam *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama warga / Balai Desa / Kampus"
                    value={formData.lenderName}
                    onChange={e => setFormData({ ...formData, lenderName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">No. HP / WA Pemilik</label>
                  <input
                    type="text"
                    placeholder="081234567890"
                    value={formData.lenderPhone}
                    onChange={e => setFormData({ ...formData, lenderPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Penanggung Jawab / Peminjam *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama anggota kelompok KKN"
                    value={formData.borrowerName}
                    onChange={e => setFormData({ ...formData, borrowerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Jumlah Unit *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Tanggal Pinjam *</label>
                  <input
                    type="date"
                    required
                    value={formData.borrowDate}
                    onChange={e => setFormData({ ...formData, borrowDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Tenggat Kembali *</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <ImageUploader
                value={formData.imageUrl}
                onChange={url => setFormData({ ...formData, imageUrl: url })}
                label="Foto / Bukti Fisik Barang Pinjaman (Opsional)"
              />

              <div>
                <label className="block font-bold text-slate-300 mb-1">Biaya Deposit / Uang Muka (Rp)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.depositCost}
                  onChange={e => setFormData({ ...formData, depositCost: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold shadow-lg shadow-amber-600/20"
                >
                  Simpan Peminjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Return Item */}
      {returningItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white font-heading">
                Proses Pengembalian Barang
              </h3>
              <button onClick={() => setReturningItem(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="font-extrabold text-white font-heading">{returningItem.itemName}</div>
                <div className="text-slate-400">Pemilik: {returningItem.lenderName} ({returningItem.quantity} Unit)</div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Kondisi Barang Saat Dikembalikan *</label>
                <select
                  value={returnCondition}
                  onChange={e => setReturnCondition(e.target.value as ReturnCondition)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="Bagus">Bagus (Lengkap & Berfungsi Normal)</option>
                  <option value="Rusak">Rusak (Perlu Perbaikan / Ganti Rugi)</option>
                  <option value="Hilang">Hilang (Perlu Ganti Rugi)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Catatan Pengembalian</label>
                <textarea
                  rows={2}
                  placeholder="Catatan penerimaan, ucapan terima kasih warga, dll..."
                  value={returnNotes}
                  onChange={e => setReturnNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setReturningItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-lg"
                >
                  Konfirmasi Pengembalian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
