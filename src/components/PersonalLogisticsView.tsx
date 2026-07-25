import React, { useState } from 'react';
import {
  Backpack,
  Plus,
  Lock,
  Globe,
  Edit2,
  Trash2,
  X,
  Package,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRightLeft,
  Filter,
  StickyNote,
} from 'lucide-react';
import { usePerkab } from '../context/PerkabContext';
import { ImageUploader } from './ImageUploader';
import {
  PersonalLogisticsItem,
  PersonalLogisticsCategory,
  PersonalItemStatus,
  ItemCondition,
} from '../types';

const CATEGORIES: PersonalLogisticsCategory[] = [
  'Elektronik',
  'Pakaian',
  'Peralatan',
  'Makanan & Minuman',
  'Dokumen',
  'Kebutuhan Personal',
  'Lainnya',
];

const STATUSES: PersonalItemStatus[] = ['Terbawa', 'Ketinggalan', 'Hilang', 'Dipinjamkan'];
const CONDITIONS: ItemCondition[] = ['Bagus', 'Perlu Perbaikan', 'Rusak'];

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

const DEFAULT_FORM = {
  itemName: '',
  category: 'Lainnya' as PersonalLogisticsCategory,
  quantity: 1,
  unit: 'buah',
  condition: 'Bagus' as ItemCondition,
  status: 'Terbawa' as PersonalItemStatus,
  isPrivate: true,
  imageUrl: '',
  notes: '',
};

export const PersonalLogisticsView: React.FC = () => {
  const { currentUser, personalLogistics, addPersonalItem, updatePersonalItem, deletePersonalItem, showConfirm } = usePerkab();

  const [filterStatus, setFilterStatus]     = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterPrivacy, setFilterPrivacy]   = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [editingItem, setEditingItem]       = useState<PersonalLogisticsItem | null>(null);
  const [form, setForm]                     = useState({ ...DEFAULT_FORM });

  if (!currentUser) return null;

  const myItems = personalLogistics.filter(p => p.ownerId === currentUser.id);

  const filteredItems = myItems.filter(item => {
    const matchStatus   = filterStatus   === 'ALL' || item.status   === filterStatus;
    const matchCategory = filterCategory === 'ALL' || item.category === filterCategory;
    const matchPrivacy  = filterPrivacy  === 'ALL'
      || (filterPrivacy === 'private' && item.isPrivate)
      || (filterPrivacy === 'public'  && !item.isPrivate);
    return matchStatus && matchCategory && matchPrivacy;
  });

  const openAdd = () => {
    setEditingItem(null);
    setForm({ ...DEFAULT_FORM });
    setIsModalOpen(true);
  };

  const openEdit = (item: PersonalLogisticsItem) => {
    setEditingItem(item);
    setForm({
      itemName:  item.itemName,
      category:  item.category,
      quantity:  item.quantity,
      unit:      item.unit,
      condition: item.condition,
      status:    item.status,
      isPrivate: item.isPrivate,
      imageUrl:  item.imageUrl || '',
      notes:     item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setForm(f => ({ ...f, imageUrl: canvas.toDataURL('image/jpeg', 0.82) }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemName.trim()) return;
    const payload = {
      ownerId:   currentUser.id,
      ownerName: currentUser.name,
      itemName:  form.itemName.trim(),
      category:  form.category,
      quantity:  form.quantity,
      unit:      form.unit.trim() || 'buah',
      condition: form.condition,
      status:    form.status,
      isPrivate: form.isPrivate,
      imageUrl:  form.imageUrl || undefined,
      notes:     form.notes.trim() || undefined,
    };
    if (editingItem) updatePersonalItem({ ...editingItem, ...payload });
    else addPersonalItem(payload);
    setIsModalOpen(false);
  };

  const handleDelete = (item: PersonalLogisticsItem) => {
    showConfirm({
      title: 'Hapus Item Logistik',
      message: `Yakin ingin menghapus "${item.itemName}" dari daftar logistik pribadimu?`,
      confirmText: 'Hapus',
      danger: true,
      onConfirm: () => deletePersonalItem(item.id),
    });
  };

  const togglePrivacy = (item: PersonalLogisticsItem) => {
    updatePersonalItem({ ...item, isPrivate: !item.isPrivate });
  };

  const privateCount = myItems.filter(i => i.isPrivate).length;
  const publicCount  = myItems.filter(i => !i.isPrivate).length;
  const hilangCount  = myItems.filter(i => i.status === 'Hilang').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Backpack className="w-6 h-6 text-emerald-400" />
            Logistik Pribadi
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Barang bawaan &amp; kebutuhan personal{' '}
            <span className="text-emerald-400 font-semibold">{currentUser.name}</span>{' '}
            <span className="text-slate-500 text-xs font-normal">(Terisolasi &amp; tidak pernah muncul di Landing Page Publik)</span>
          </p>
        </div>
        <button
          id="btn-add-personal-item"
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Item', value: myItems.length, color: 'text-slate-200',   sub: 'barang tercatat' },
          { label: 'Privat',     value: privateCount,   color: 'text-violet-400',  sub: 'hanya kamu' },
          { label: 'Publik',     value: publicCount,    color: 'text-emerald-400', sub: 'terlihat semua' },
          { label: 'Hilang',     value: hilangCount,    color: 'text-rose-400',    sub: 'perlu dicari' },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-xl p-4">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs font-bold text-slate-300 mt-0.5">{s.label}</div>
            <div className="text-[10px] text-slate-500">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-emerald-500">
          <option value="ALL">Semua Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-emerald-500">
          <option value="ALL">Semua Kategori</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterPrivacy} onChange={e => setFilterPrivacy(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-emerald-500">
          <option value="ALL">Privat &amp; Publik</option>
          <option value="private">🔒 Privat saja</option>
          <option value="public">🌐 Publik saja</option>
        </select>
        {filteredItems.length !== myItems.length && (
          <span className="text-xs text-slate-400">
            Menampilkan <strong className="text-slate-200">{filteredItems.length}</strong> dari {myItems.length} item
          </span>
        )}
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">
            Belum ada item{filterStatus !== 'ALL' || filterCategory !== 'ALL' ? ' yang cocok dengan filter' : ''}
          </p>
          <p className="text-xs text-slate-500 mt-1">Klik "Tambah Item" untuk mencatat barang bawaanmu</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map(item => {
            const statusCfg = STATUS_CONFIG[item.status];
            const StatusIcon = statusCfg.icon;
            return (
              <div
                key={item.id}
                className={`glass-card rounded-2xl p-4 border transition-all hover:scale-[1.01] flex flex-col justify-between ${
                  item.isPrivate ? 'border-violet-500/20 bg-violet-950/10' : 'border-slate-800/60'
                }`}
              >
                <div>
                  {/* Image Preview Thumbnail if Present */}
                  {item.imageUrl && (
                    <div className="w-full h-36 rounded-xl overflow-hidden mb-3 bg-slate-900 border border-slate-800 relative group">
                      <img
                        src={item.imageUrl}
                        alt={item.itemName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-100 text-sm leading-tight">{item.itemName}</h3>
                        {item.isPrivate ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-violet-400 bg-violet-500/15 border border-violet-500/30 px-1.5 py-0.5 rounded-full">
                            <Lock className="w-2.5 h-2.5" /> Privat
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
                            <Globe className="w-2.5 h-2.5" /> Publik
                          </span>
                        )}
                      </div>
                      <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[item.category]}`}>
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => togglePrivacy(item)} title={item.isPrivate ? 'Jadikan Publik' : 'Jadikan Privat'}
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-violet-400 transition-colors cursor-pointer">
                        {item.isPrivate ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-sky-400 transition-colors cursor-pointer">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(item)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-slate-900/60 rounded-lg p-2">
                      <div className="text-slate-500 text-[10px] mb-0.5">Jumlah</div>
                      <div className="font-bold text-slate-200">{item.quantity} <span className="font-normal text-slate-400">{item.unit}</span></div>
                    </div>
                    <div className="bg-slate-900/60 rounded-lg p-2">
                      <div className="text-slate-500 text-[10px] mb-0.5">Kondisi</div>
                      <div className={`font-bold ${item.condition === 'Bagus' ? 'text-emerald-400' : item.condition === 'Perlu Perbaikan' ? 'text-amber-400' : 'text-rose-400'}`}>
                        {item.condition}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Status */}
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${statusCfg.bg}`}>
                    <StatusIcon className={`w-3.5 h-3.5 ${statusCfg.color}`} />
                    <span className={statusCfg.color}>{statusCfg.label}</span>
                  </div>

                  {item.notes && (
                    <div className="mt-2 flex items-start gap-1.5 text-[11px] text-slate-400">
                      <StickyNote className="w-3 h-3 mt-0.5 shrink-0 text-slate-500" />
                      <span className="italic leading-snug">{item.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-90 flex items-center justify-center p-3 sm:p-4 bg-slate-950/95 backdrop-blur-xl overflow-y-auto">
          <div className="glass-card rounded-2xl w-full max-w-md border border-slate-700/60 shadow-2xl max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 sticky top-0 glass-card rounded-t-2xl z-10">
              <h2 className="font-bold text-slate-100 flex items-center gap-2 text-sm sm:text-base font-heading">
                <Backpack className="w-5 h-5 text-emerald-400" />
                {editingItem ? 'Edit Item Logistik' : 'Tambah Item Logistik'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Barang / Kebutuhan *</label>
                <input type="text" value={form.itemName} onChange={e => setForm(f => ({ ...f, itemName: e.target.value }))}
                  placeholder="cth: Laptop ASUS, Charger HP, Sabun mandi..."
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required />
              </div>

              <ImageUploader
                value={form.imageUrl}
                onChange={url => setForm(f => ({ ...f, imageUrl: url }))}
                label="Foto / Gambar Barang Bawaan (Opsional)"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kategori</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as PersonalLogisticsCategory }))}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Jumlah</label>
                  <input type="number" min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Satuan</label>
                  <input type="text" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                    placeholder="buah, set, kg..."
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kondisi</label>
                  <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value as ItemCondition }))}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as PersonalItemStatus }))}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Catatan (opsional)</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  placeholder="Keterangan tambahan..."
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
              </div>

              {/* Privacy Toggle */}
              <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${form.isPrivate ? 'border-violet-500/40 bg-violet-950/20' : 'border-emerald-500/30 bg-emerald-950/10'}`}>
                <div className="flex items-center gap-2">
                  {form.isPrivate ? <Lock className="w-4 h-4 text-violet-400" /> : <Globe className="w-4 h-4 text-emerald-400" />}
                  <div>
                    <div className={`text-xs font-bold ${form.isPrivate ? 'text-violet-300' : 'text-emerald-300'}`}>
                      {form.isPrivate ? 'Mode Privat (Rasia/Pribadi)' : 'Mode Berbagi (Sesama Anggota)'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {form.isPrivate
                        ? 'Hanya kamu yang dapat melihat item ini di dashboard'
                        : 'Terlihat oleh anggota lain di Papan Bersama (TIDAK muncul di Landing Page Publik)'}
                    </div>
                  </div>
                </div>
                <button type="button" onClick={() => setForm(f => ({ ...f, isPrivate: !f.isPrivate }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${form.isPrivate ? 'bg-violet-600' : 'bg-emerald-600'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isPrivate ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer">
                  Batal
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer">
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

