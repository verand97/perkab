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
} from 'lucide-react';
import { usePerkab } from '../context/PerkabContext';
import { BorrowingRecord, BorrowingStatus, ReturnCondition } from '../types';
import { exportToCSV } from '../lib/exportExcel';

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
      notes: '',
    });
  };

  const handleSelectInventory = (invId: string) => {
    const matched = inventory.find(i => i.id === invId);
    if (matched) {
      setFormData(prev => ({
        ...prev,
        inventoryId: matched.id,
        itemName: matched.name,
        lenderName: matched.lenderName || prev.lenderName,
      }));
    }
  };

  const handleExportCSV = () => {
    const data = filteredBorrowings.map(b => ({
      'Nama Barang': b.itemName,
      'Pemberi Pinjaman': b.lenderName,
      'No. WA Pemilik': b.lenderPhone,
      'PJ Anggota KKN': b.borrowerName,
      'Jumlah': b.quantity,
      'Tgl Pinjam': b.borrowDate,
      'Tenggat Pengembalian': b.dueDate,
      'Tgl Kembali': b.returnDate || '-',
      'Deposit/Sewa (Rp)': b.depositCost,
      'Status': b.status,
      'Kondisi Kembali': b.conditionOnReturn || '-',
      'Catatan': b.notes || '-',
    }));
    exportToCSV(data, 'Peminjaman_Alat');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Handshake className="w-6 h-6 text-amber-400" />
            <span>Pengadaan & Peminjaman Alat</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pencatatan peminjaman alat dari Warga Desa, Kampus, atau Sewa beserta tenggat pengembaliannya
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Pinjaman Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('DIPINJAM')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'DIPINJAM'
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            Masih Dipinjam ({activeCount})
          </button>
          <button
            onClick={() => setActiveTab('DIKEMBALIKAN')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'DIKEMBALIKAN'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            Sudah Dikembalikan ({returnedCount})
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ALL'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            Semua ({borrowings.length})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari alat / nama pemilik..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBorrowings.map(bor => {
          const isOverdue = bor.status === 'Dipinjam' && new Date(bor.dueDate) < new Date(new Date().setHours(0,0,0,0));
          const cleanPhone = bor.lenderPhone.replace(/[^0-9]/g, '');

          return (
            <div
              key={bor.id}
              className={`glass-panel rounded-2xl p-5 border transition-all space-y-4 flex flex-col justify-between ${
                isOverdue
                  ? 'border-rose-500/50 bg-rose-950/20'
                  : bor.status === 'Dikembalikan'
                  ? 'border-slate-800 opacity-80'
                  : 'border-slate-800 hover:border-amber-500/40'
              }`}
            >
              <div className="space-y-3">
                {/* Status & Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                      bor.status === 'Dikembalikan'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : isOverdue
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {bor.status === 'Dikembalikan'
                      ? 'SUDAH DIKEMBALIKAN'
                      : isOverdue
                      ? 'TERLAMBAT'
                      : 'SEDANG DIPINJAM'}
                  </span>

                  <span className="font-mono text-xs font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {bor.quantity}x
                  </span>
                </div>

                {/* Item Name */}
                <div>
                  <h3 className="text-base font-extrabold text-white">{bor.itemName}</h3>
                  <div className="text-xs text-slate-400 mt-1">
                    PJ Anggota KKN: <strong className="text-slate-200">{bor.borrowerName}</strong>
                  </div>
                </div>

                {/* Lender details box */}
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Pemilik:</span>
                    <span className="font-bold text-amber-300">{bor.lenderName}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Kontak WA:</span>
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>{bor.lenderPhone}</span>
                    </a>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2 rounded-lg bg-slate-800/40 text-slate-400">
                    <span className="block text-[10px] uppercase text-slate-500">Tgl Pinjam</span>
                    <span className="font-semibold text-slate-200">{bor.borrowDate}</span>
                  </div>

                  <div
                    className={`p-2 rounded-lg ${
                      isOverdue ? 'bg-rose-950/60 text-rose-300' : 'bg-slate-800/40 text-slate-400'
                    }`}
                  >
                    <span className="block text-[10px] uppercase text-slate-500">Tenggat Kembali</span>
                    <span className="font-bold">{bor.dueDate}</span>
                  </div>
                </div>

                {bor.depositCost > 0 && (
                  <div className="text-xs text-slate-400 flex items-center justify-between bg-slate-800/40 p-2 rounded-lg">
                    <span>Biaya Sewa / Deposit:</span>
                    <span className="font-bold text-emerald-400">
                      Rp {bor.depositCost.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}

                {bor.notes && (
                  <p className="text-[11px] text-slate-400 bg-slate-900/50 p-2 rounded-lg italic">
                    "{bor.notes}"
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                {bor.status === 'Dipinjam' ? (
                  <button
                    onClick={() => setReturningItem(bor)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Kembalikan Barang</span>
                  </button>
                ) : (
                  <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold py-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Kembali tgl {bor.returnDate} ({bor.conditionOnReturn})</span>
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
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-700"
                  title="Hapus Record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredBorrowings.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 glass-panel rounded-2xl">
            Tidak ada catatan peminjaman barang yang sesuai.
          </div>
        )}
      </div>

      {/* Modal Add Borrowing */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-extrabold text-white">Catat Peminjaman Alat Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              {/* Optional Link to Existing Inventory */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Pilih dari Katalog Inventaris (Opsional)
                </label>
                <select
                  onChange={e => handleSelectInventory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Pilih Barang dari Logistik (atau Ketik Manual) --</option>
                  {inventory.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} ({inv.code}) - {inv.lenderName || inv.ownership}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Barang / Peralatan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sound System 500W / Proyektor Epson / Terpal"
                  value={formData.itemName}
                  onChange={e => setFormData({ ...formData, itemName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Pemberi Pinjaman (Pemilik) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Warga / Kadus / Kampus"
                    value={formData.lenderName}
                    onChange={e => setFormData({ ...formData, lenderName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">No. HP / WA Pemilik *</label>
                  <input
                    type="text"
                    required
                    placeholder="08123456789"
                    value={formData.lenderPhone}
                    onChange={e => setFormData({ ...formData, lenderPhone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">PJ Anggota KKN *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama anggota penanggungjawab"
                    value={formData.borrowerName}
                    onChange={e => setFormData({ ...formData, borrowerName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Jumlah Pinjam *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tanggal Pinjam *</label>
                  <input
                    type="date"
                    required
                    value={formData.borrowDate}
                    onChange={e => setFormData({ ...formData, borrowDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tenggat Pengembalian *</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Biaya Sewa / Deposit (Rp)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0 jika gratis"
                  value={formData.depositCost}
                  onChange={e => setFormData({ ...formData, depositCost: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Catatan Peminjaman</label>
                <textarea
                  rows={2}
                  placeholder="Dipergunakan untuk acara apa / jaminan KTP dll..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg"
                >
                  Simpan Pinjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Return Item */}
      {returningItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-emerald-400" />
                <span>Pengembalian Barang Pinjaman</span>
              </h3>
              <button onClick={() => setReturningItem(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
              <div className="font-bold text-white">{returningItem.itemName} ({returningItem.quantity}x)</div>
              <div className="text-slate-400">Dikembalikan kepada: <strong className="text-amber-300">{returningItem.lenderName}</strong></div>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Kondisi Saat Pengembalian *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Bagus', 'Rusak', 'Hilang'] as ReturnCondition[]).map(cond => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setReturnCondition(cond)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        returnCondition === cond
                          ? cond === 'Bagus'
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-rose-600 text-white border-rose-500'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Catatan Pengembalian</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan ucapan terima kasih / jika ada lecetan / info ganti rugi..."
                  value={returnNotes}
                  onChange={e => setReturnNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReturningItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg"
                >
                  Konfirmasi Kembali
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
