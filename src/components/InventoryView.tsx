import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  QrCode,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Printer,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import { usePerkab } from '../context/PerkabContext';
import { InventoryItem, InventoryCategory, ItemCondition, ItemOwnership } from '../types';
import { exportToCSV } from '../lib/exportExcel';

interface InventoryViewProps {
  onOpenExport: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onOpenExport }) => {
  const {
    inventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    showConfirm,
  } = usePerkab();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCondition, setSelectedCondition] = useState<string>('ALL');
  const [selectedOwnership, setSelectedOwnership] = useState<string>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [qrItem, setQrItem] = useState<InventoryItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Elektronik' as InventoryCategory,
    quantity: 1,
    unit: 'Unit',
    condition: 'Bagus' as ItemCondition,
    ownership: 'Kelompok' as ItemOwnership,
    lenderName: '',
    location: 'Posko',
    notes: '',
  });

  // Filtered Items
  const filteredItems = inventory.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesCondition = selectedCondition === 'ALL' || item.condition === selectedCondition;
    const matchesOwnership = selectedOwnership === 'ALL' || item.ownership === selectedOwnership;

    return matchesSearch && matchesCategory && matchesCondition && matchesOwnership;
  });

  const categories: InventoryCategory[] = [
    'Elektronik',
    'Perkakas',
    'Dapur',
    'Akomodasi',
    'Acara',
    'Lainnya',
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInventoryItem({
      name: formData.name,
      category: formData.category,
      quantity: Number(formData.quantity),
      availableQty: Number(formData.quantity),
      unit: formData.unit,
      condition: formData.condition,
      ownership: formData.ownership,
      lenderName: formData.lenderName || undefined,
      location: formData.location,
      notes: formData.notes || undefined,
    });
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateInventoryItem({
      ...editingItem,
      name: formData.name,
      category: formData.category,
      quantity: Number(formData.quantity),
      availableQty: Math.min(Number(formData.quantity), editingItem.availableQty),
      unit: formData.unit,
      condition: formData.condition,
      ownership: formData.ownership,
      lenderName: formData.lenderName || undefined,
      location: formData.location,
      notes: formData.notes || undefined,
    });
    setEditingItem(null);
    resetForm();
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      condition: item.condition,
      ownership: item.ownership,
      lenderName: item.lenderName || '',
      location: item.location,
      notes: item.notes || '',
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Elektronik',
      quantity: 1,
      unit: 'Unit',
      condition: 'Bagus',
      ownership: 'Kelompok',
      lenderName: '',
      location: 'Posko',
      notes: '',
    });
  };

  const handleExportCSV = () => {
    const exportData = filteredItems.map(item => ({
      'Kode': item.code,
      'Nama Barang': item.name,
      'Kategori': item.category,
      'Total Jumlah': item.quantity,
      'Tersedia': item.availableQty,
      'Satuan': item.unit,
      'Kondisi': item.condition,
      'Milik': item.ownership,
      'Pemberi Pinjaman': item.lenderName || '-',
      'Lokasi': item.location,
      'Catatan': item.notes || '-',
    }));
    exportToCSV(exportData, 'Inventaris_Logistik');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 font-heading">
            <Package className="w-6 h-6 text-emerald-400" />
            <span>Pendataan Logistik & Inventaris</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Katalog terstruktur barang kelompok posko, alat milik warga desa, kampus, & barang sewa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Barang Baru</span>
          </button>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="glass-card rounded-2xl p-4 space-y-4 border border-slate-800">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama barang, kode (PKB-...), atau lokasi posko..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Condition Selects */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCondition}
              onChange={e => setSelectedCondition(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
            >
              <option value="ALL">Semua Kondisi</option>
              <option value="Bagus">Bagus</option>
              <option value="Perlu Perbaikan">Perlu Perbaikan</option>
              <option value="Rusak">Rusak</option>
            </select>

            <select
              value={selectedOwnership}
              onChange={e => setSelectedOwnership(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
            >
              <option value="ALL">Semua Kepemilikan</option>
              <option value="Kelompok">Milik Kelompok</option>
              <option value="Warga Desa">Warga Desa</option>
              <option value="Kampus">Pinjaman Kampus</option>
              <option value="Sewa">Barang Sewa</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mr-1 font-heading">
            Kategori:
          </span>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Semua ({inventory.length})
          </button>
          {categories.map(cat => {
            const count = inventory.filter(i => i.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 font-extrabold border-b border-slate-800 font-heading">
                <th className="py-3.5 px-4">Kode & Nama Barang</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4 text-center">Jumlah / Stuk</th>
                <th className="py-3.5 px-4">Kondisi</th>
                <th className="py-3.5 px-4">Kepemilikan</th>
                <th className="py-3.5 px-4">Lokasi Posko</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-100 flex items-center gap-2 font-heading">
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 font-bold">
                        {item.code}
                      </span>
                      {item.notes && (
                        <span className="text-[11px] text-slate-400 truncate max-w-50" title={item.notes}>
                          • {item.notes}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-[11px] font-semibold">
                      {item.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="font-bold text-slate-100 font-mono">
                      {item.availableQty} / {item.quantity} {item.unit}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {item.availableQty < item.quantity ? 'Dipinjam' : 'Ready'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                        item.condition === 'Bagus'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : item.condition === 'Perlu Perbaikan'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {item.condition === 'Bagus' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5" />
                      )}
                      <span>{item.condition}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-200">{item.ownership}</div>
                    {item.lenderName && (
                      <div className="text-[10px] text-slate-400">{item.lenderName}</div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-slate-300 font-semibold">
                    {item.location}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setQrItem(item)}
                        className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-400 hover:text-teal-300 border border-slate-800"
                        title="Cetak Tag Label & QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
                        title="Edit Barang"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          showConfirm({
                            title: 'Hapus Barang Inventaris',
                            message: `Apakah Anda yakin ingin menghapus barang "${item.name}" (${item.code}) dari katalog logistik?`,
                            confirmText: 'Ya, Hapus Barang',
                            danger: true,
                            onConfirm: () => deleteInventoryItem(item.id),
                          });
                        }}
                        className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800"
                        title="Hapus Barang"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Tidak ada barang inventaris yang sesuai dengan filter. Klik "+ Tambah Barang Baru" untuk memasukkan data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Inventory */}
      {(isAddModalOpen || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-lg rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-black text-white font-heading">
                {editingItem ? 'Edit Barang Inventaris' : 'Tambah Logistik Inventaris Baru'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingItem(null);
                }}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingItem ? handleEditSubmit : handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Nama Barang *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sound System Portable / Kabel Roll 25m"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Kategori *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as InventoryCategory })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Kepemilikan *</label>
                  <select
                    value={formData.ownership}
                    onChange={e => setFormData({ ...formData, ownership: e.target.value as ItemOwnership })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="Kelompok">Milik Kelompok KKN</option>
                    <option value="Warga Desa">Pinjaman Warga Desa</option>
                    <option value="Kampus">Pinjaman Kampus</option>
                    <option value="Sewa">Barang Sewa</option>
                  </select>
                </div>
              </div>

              {formData.ownership !== 'Kelompok' && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nama Pemilik / Tempat Sewa</label>
                  <input
                    type="text"
                    placeholder="Nama warga / laboratorium kampus / tempat rental"
                    value={formData.lenderName}
                    onChange={e => setFormData({ ...formData, lenderName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Jumlah Total *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Satuan *</label>
                  <input
                    type="text"
                    placeholder="Unit / Pcs / Roll"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Kondisi *</label>
                  <select
                    value={formData.condition}
                    onChange={e => setFormData({ ...formData, condition: e.target.value as ItemCondition })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="Bagus">Bagus</option>
                    <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                    <option value="Rusak">Rusak</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Lokasi Penyimpanan di Posko *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rak Posko 1 / Box A / Dapur"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Kelengkapan kabel, instruksi pemakaian, dll..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-lg shadow-emerald-600/20"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Tag Label Modal */}
      {qrItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 no-print">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-heading">
                <QrCode className="w-5 h-5 text-teal-400" />
                <span>Tag Label & QR Inventaris</span>
              </h3>
              <button onClick={() => setQrItem(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="printable-area border-2 border-dashed border-emerald-500/40 rounded-2xl p-5 bg-slate-950 text-center space-y-3">
              <div className="inline-block bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-3 py-0.5 rounded-full font-heading">
                PROPERTY OF LOGISTIK KKN 2026
              </div>

              <div className="w-32 h-32 mx-auto bg-white p-2 rounded-2xl flex items-center justify-center shadow-inner">
                <svg className="w-full h-full text-slate-950" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm9-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm13-2h2v2h-2v-2zm-4 0h2v2h-2v-2zm2 4h2v2h-2v-2zm2-2h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2z" />
                </svg>
              </div>

              <div>
                <h4 className="text-base font-black text-white font-heading">{qrItem.name}</h4>
                <div className="font-mono text-xs font-bold text-emerald-400 mt-0.5">{qrItem.code}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/80 p-2.5 rounded-xl text-slate-300 border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold font-heading">Kategori</span>
                  <strong>{qrItem.category}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold font-heading">Lokasi Posko</span>
                  <strong>{qrItem.location}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 no-print">
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Label Tag Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
