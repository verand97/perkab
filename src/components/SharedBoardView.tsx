import React, { useState, useMemo } from 'react';
import {
  LayoutGrid,
  Users,
  Package,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRightLeft,
  Search,
  ChevronDown,
  ChevronUp,
  Globe,
  Backpack,
  PackageCheck,
  StickyNote,
  Lock,
} from 'lucide-react';
import { usePerkab } from '../context/PerkabContext';
import { PersonalItemStatus } from '../types';

const STATUS_CONFIG: Record<PersonalItemStatus, { icon: React.FC<{ className?: string }>; color: string; bg: string }> = {
  Terbawa:     { icon: CheckCircle2,   color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  Ketinggalan: { icon: AlertCircle,    color: 'text-amber-400',   bg: 'bg-amber-500/15 border-amber-500/30' },
  Hilang:      { icon: XCircle,        color: 'text-rose-400',    bg: 'bg-rose-500/15 border-rose-500/30' },
  Dipinjamkan: { icon: ArrowRightLeft, color: 'text-sky-400',     bg: 'bg-sky-500/15 border-sky-500/30' },
};

const MEMBER_AVATAR_COLORS = [
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-sky-500 to-blue-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-lime-500 to-green-600',
  'from-fuchsia-500 to-pink-600',
  'from-cyan-500 to-sky-600',
];

const CATEGORY_DOT: Record<string, string> = {
  'Elektronik':         'bg-violet-400',
  'Pakaian':            'bg-pink-400',
  'Peralatan':          'bg-orange-400',
  'Makanan & Minuman':  'bg-lime-400',
  'Dokumen':            'bg-sky-400',
  'Kebutuhan Personal': 'bg-teal-400',
  'Lainnya':            'bg-slate-400',
};

export const SharedBoardView: React.FC = () => {
  const { personalLogistics, inventory, users } = usePerkab();
  const [searchQuery, setSearchQuery]     = useState('');
  const [filterMember, setFilterMember]   = useState('ALL');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab]         = useState<'personal' | 'inventory'>('personal');

  // Only public personal logistics
  const publicItems = personalLogistics.filter(p => !p.isPrivate);

  // Group public items by owner
  const groupedByMember = useMemo(() => {
    const map: Record<string, { name: string; id: string; items: typeof publicItems }> = {};
    publicItems.forEach(item => {
      if (!map[item.ownerId]) {
        map[item.ownerId] = { name: item.ownerName, id: item.ownerId, items: [] };
      }
      map[item.ownerId].items.push(item);
    });
    return Object.values(map);
  }, [publicItems]);

  const filteredGroups = groupedByMember
    .filter(g => filterMember === 'ALL' || g.id === filterMember)
    .map(g => ({
      ...g,
      items: g.items.filter(item =>
        searchQuery === '' ||
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(g => g.items.length > 0);

  const filteredInventory = inventory.filter(item =>
    searchQuery === '' ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCard = (id: string) => setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));

  const totalPublicItems = publicItems.length;
  const totalMembers     = groupedByMember.length;
  const hilangCount      = publicItems.filter(i => i.status === 'Hilang').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden glass-card rounded-2xl p-6 border border-emerald-500/20">
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <LayoutGrid className="w-6 h-6 text-emerald-400" />
              Papan Logistik Bersama
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Semua barang publik anggota &amp; inventaris kelompok KKN
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 rounded-xl px-3 py-2 border border-slate-700/60">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hanya item <strong className="text-emerald-400">publik</strong> yang ditampilkan</span>
            <Lock className="w-3.5 h-3.5 text-slate-500 ml-1" />
            <span className="text-slate-500">Item privat disembunyikan</span>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-800/60">
          <div className="text-center">
            <div className="text-3xl font-black text-emerald-400">{totalMembers}</div>
            <div className="text-xs text-slate-400 mt-0.5">Anggota Berbagi</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-violet-400">{totalPublicItems}</div>
            <div className="text-xs text-slate-400 mt-0.5">Item Publik</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-black ${hilangCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>{hilangCount}</div>
            <div className="text-xs text-slate-400 mt-0.5">Item Hilang</div>
          </div>
        </div>
      </div>

      {/* Tab + Filters */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        {/* Tab switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'personal'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Backpack className="w-4 h-4" />
            Logistik Anggota
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'personal' ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'}`}>
              {totalPublicItems}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'inventory'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            Inventaris Kelompok
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'inventory' ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'}`}>
              {inventory.length}
            </span>
          </button>
        </div>

        {/* Search + filter */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama barang atau kategori..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {activeTab === 'personal' && (
            <select
              value={filterMember}
              onChange={e => setFilterMember(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Anggota</option>
              {groupedByMember.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Personal Tab */}
      {activeTab === 'personal' && (
        <>
          {filteredGroups.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">Belum ada item publik dari anggota</p>
              <p className="text-xs text-slate-500 mt-1">
                Anggota perlu mengatur item mereka ke <strong>Mode Publik</strong> di halaman Logistik Pribadi
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredGroups.map((group, idx) => {
                const avatarGrad = MEMBER_AVATAR_COLORS[idx % MEMBER_AVATAR_COLORS.length];
                const isExpanded = expandedCards[group.id] !== false; // default expanded
                const previewItems = isExpanded ? group.items : group.items.slice(0, 3);
                const terbawa = group.items.filter(i => i.status === 'Terbawa').length;
                const hilang  = group.items.filter(i => i.status === 'Hilang').length;
                const dipinjam = group.items.filter(i => i.status === 'Dipinjamkan').length;

                return (
                  <div key={group.id} className="glass-card rounded-2xl overflow-hidden border border-slate-800/60 hover:border-emerald-500/20 transition-all">
                    {/* Member header */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-900/80 to-slate-800/40 border-b border-slate-800/60">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-white font-black text-sm shadow-lg`}>
                          {group.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 text-sm capitalize">{group.name}</div>
                          <div className="text-[10px] text-slate-400">{group.items.length} item publik</div>
                        </div>
                      </div>
                      {/* Mini stats */}
                      <div className="flex items-center gap-2">
                        {terbawa > 0  && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">✓ {terbawa}</span>}
                        {dipinjam > 0 && <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">↗ {dipinjam}</span>}
                        {hilang > 0   && <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">✗ {hilang}</span>}
                        <button
                          onClick={() => toggleCard(group.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors ml-1"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Items list */}
                    <div className="p-3 space-y-2">
                      {previewItems.map(item => {
                        const st = STATUS_CONFIG[item.status];
                        const StatusIcon = st.icon;
                        const dotColor = CATEGORY_DOT[item.category] || 'bg-slate-400';
                        return (
                          <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/60 transition-colors group">
                            <div className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-slate-200 truncate">{item.itemName}</div>
                              <div className="text-[10px] text-slate-500">{item.category} · {item.quantity} {item.unit}</div>
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border shrink-0 ${st.bg}`}>
                              <StatusIcon className={`w-3 h-3 ${st.color}`} />
                              <span className={st.color}>{item.status}</span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Show more / less */}
                      {group.items.length > 3 && (
                        <button
                          onClick={() => toggleCard(group.id)}
                          className="w-full text-center text-xs text-emerald-400 hover:text-emerald-300 py-2 font-semibold transition-colors"
                        >
                          {isExpanded
                            ? `Sembunyikan (tampilkan 3 dari ${group.items.length})`
                            : `Lihat ${group.items.length - 3} item lainnya...`
                          }
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <>
          {filteredInventory.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">Tidak ada inventaris yang cocok</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredInventory.map(item => (
                <div key={item.id} className="glass-card rounded-2xl p-4 border border-slate-800/60 hover:border-emerald-500/20 transition-all hover:scale-[1.01]">
                  {/* Top */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="text-xs text-slate-500 font-mono">{item.code}</div>
                      <h3 className="font-bold text-slate-100 text-sm mt-0.5 leading-tight">{item.name}</h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      item.condition === 'Bagus'           ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                      item.condition === 'Perlu Perbaikan' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                                                             'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    }`}>
                      {item.condition}
                    </span>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-slate-900/60 rounded-lg p-2">
                      <div className="text-slate-500 text-[10px] mb-0.5">Kategori</div>
                      <div className="font-semibold text-slate-300">{item.category}</div>
                    </div>
                    <div className="bg-slate-900/60 rounded-lg p-2">
                      <div className="text-slate-500 text-[10px] mb-0.5">Tersedia</div>
                      <div className="font-bold text-emerald-400">{item.availableQty}<span className="text-slate-400 font-normal">/{item.quantity} {item.unit}</span></div>
                    </div>
                    <div className="bg-slate-900/60 rounded-lg p-2">
                      <div className="text-slate-500 text-[10px] mb-0.5">Kepemilikan</div>
                      <div className="font-semibold text-slate-300">{item.ownership}</div>
                    </div>
                    <div className="bg-slate-900/60 rounded-lg p-2">
                      <div className="text-slate-500 text-[10px] mb-0.5">Lokasi</div>
                      <div className="font-semibold text-slate-300 truncate">{item.location}</div>
                    </div>
                  </div>

                  {/* Availability bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Ketersediaan</span>
                      <span className={item.availableQty === 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        {item.quantity > 0 ? Math.round((item.availableQty / item.quantity) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${item.availableQty === 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${item.quantity > 0 ? (item.availableQty / item.quantity) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {item.notes && (
                    <div className="mt-2 flex items-start gap-1.5 text-[10px] text-slate-500">
                      <StickyNote className="w-3 h-3 mt-0.5 shrink-0" />
                      <span className="italic">{item.notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
