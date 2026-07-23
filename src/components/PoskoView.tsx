import React, { useState } from 'react';
import {
  Home,
  Zap,
  Droplet,
  Bed,
  Utensils,
  Wifi,
  ShieldCheck,
  Edit,
  Plus,
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { usePerkab } from '../context/PerkabContext';
import { PoskoFacility, PoskoRoomLayout, FacilityStatus } from '../types';
import { ImageUploader } from './ImageUploader';

export const PoskoView: React.FC = () => {
  const {
    facilities,
    updateFacilityStatus,
    rooms,
    updateRoomLayout,
    addRoomLayout,
  } = usePerkab();

  const [editingFacility, setEditingFacility] = useState<PoskoFacility | null>(null);
  const [facStatus, setFacStatus] = useState<FacilityStatus>('Sangat Baik');
  const [facDetails, setFacDetails] = useState('');
  const [facPic, setFacPic] = useState('');
  const [facImage, setFacImage] = useState('');

  // Room Modal State
  const [editingRoom, setEditingRoom] = useState<PoskoRoomLayout | null>(null);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomCapacity, setRoomCapacity] = useState(4);
  const [occupantsText, setOccupantsText] = useState('');
  const [equipmentText, setEquipmentText] = useState('');
  const [roomImage, setRoomImage] = useState('');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Listrik':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Air':
        return <Droplet className="w-5 h-5 text-cyan-400" />;
      case 'Kamar Tidur':
        return <Bed className="w-5 h-5 text-indigo-400" />;
      case 'Dapur':
        return <Utensils className="w-5 h-5 text-orange-400" />;
      default:
        return <Wifi className="w-5 h-5 text-teal-400" />;
    }
  };

  const handleUpdateFacilitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFacility) return;
    updateFacilityStatus(editingFacility.id, facStatus, facDetails, facPic);
    editingFacility.imageUrl = facImage || undefined;
    setEditingFacility(null);
  };

  const openFacilityModal = (fac: PoskoFacility) => {
    setEditingFacility(fac);
    setFacStatus(fac.status);
    setFacDetails(fac.details);
    setFacPic(fac.picName);
    setFacImage(fac.imageUrl || '');
  };

  const handleSaveRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const occupants = occupantsText.split(',').map(s => s.trim()).filter(Boolean);
    const assignedEquipment = equipmentText.split(',').map(s => s.trim()).filter(Boolean);

    if (editingRoom) {
      updateRoomLayout({
        ...editingRoom,
        roomName,
        capacity: roomCapacity,
        occupants,
        assignedEquipment,
        imageUrl: roomImage || undefined,
      });
      setEditingRoom(null);
    } else {
      addRoomLayout({
        roomName,
        capacity: roomCapacity,
        occupants,
        assignedEquipment,
        imageUrl: roomImage || undefined,
      });
      setIsAddRoomModalOpen(false);
    }
    resetRoomForm();
  };

  const openEditRoomModal = (room: PoskoRoomLayout) => {
    setEditingRoom(room);
    setRoomName(room.roomName);
    setRoomCapacity(room.capacity);
    setOccupantsText(room.occupants.join(', '));
    setEquipmentText(room.assignedEquipment.join(', '));
    setRoomImage(room.imageUrl || '');
  };

  const resetRoomForm = () => {
    setRoomName('');
    setRoomCapacity(4);
    setOccupantsText('');
    setEquipmentText('');
    setRoomImage('');
  };

  const goodFacilityCount = facilities.filter(f => f.status === 'Sangat Baik').length;
  const overallHealth = facilities.length > 0 ? Math.round((goodFacilityCount / facilities.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white dark:text-white light:text-slate-900 tracking-tight flex items-center gap-2 font-heading">
            <Home className="w-6 h-6 text-teal-400" />
            <span>Akomodasi & Kelayakan Posko KKN</span>
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-500 mt-1">
            Monitoring kelayakan listrik, air, sanitasi, dapur, serta pembagian tempat tidur & kamar posko
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold font-heading">
            Skor Kelayakan Posko: {overallHealth}%
          </div>
        </div>
      </div>

      {/* Facilities Health Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-widest font-heading">
          Status Fasilitas Utama Posko Tempat Tinggal:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities.map(fac => (
            <div
              key={fac.id}
              className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800 dark:border-slate-800 light:border-slate-200 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {fac.imageUrl && (
                  <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-800 shrink-0 mb-1">
                    <img src={fac.imageUrl} alt={fac.facilityName} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200">
                      {getCategoryIcon(fac.category)}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white dark:text-white light:text-slate-900 font-heading">
                        {fac.facilityName}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-semibold">{fac.category}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                      fac.status === 'Sangat Baik'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : fac.status === 'Perlu Perhatian'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {fac.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-600 bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 p-3 rounded-xl border border-slate-800/60 dark:border-slate-800/60 light:border-slate-200 leading-relaxed">
                  {fac.details}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-400">
                  <span>PJ: </span>
                  <strong className="text-slate-200 dark:text-slate-200 light:text-slate-800">{fac.picName}</strong>
                </div>

                <button
                  onClick={() => openFacilityModal(fac)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-slate-100 hover:bg-slate-800 text-teal-400 hover:text-teal-300 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-[11px] font-bold transition-all"
                >
                  Update Check
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Room Layout & Bed Allocation Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-widest font-heading flex items-center gap-2">
            <Bed className="w-4 h-4 text-indigo-400" />
            <span>Tata Letak Kamar & Alokasi Tempat Tidur Anggota:</span>
          </h3>

          <button
            onClick={() => {
              resetRoomForm();
              setIsAddRoomModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Ruangan / Kamar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => (
            <div
              key={room.id}
              className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800 dark:border-slate-800 light:border-slate-200 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {room.imageUrl && (
                  <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-800 shrink-0 mb-1">
                    <img src={room.imageUrl} alt={room.roomName} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black text-white dark:text-white light:text-slate-900 font-heading">
                    {room.roomName}
                  </h4>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Kapasitas: {room.occupants.length} / {room.capacity} Orang
                  </span>
                </div>

                {/* Occupants List */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                    Penghuni Kamar:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {room.occupants.map((occ, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-slate-100 text-slate-200 dark:text-slate-200 light:text-slate-800 text-xs font-semibold border border-slate-800 dark:border-slate-800 light:border-slate-300 capitalize"
                      >
                        {occ}
                      </span>
                    ))}
                    {room.occupants.length === 0 && (
                      <span className="text-xs text-slate-500 italic">Belum ada penghuni</span>
                    )}
                  </div>
                </div>

                {/* Assigned Equipment */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                    Fasilitas & Perangkat Kamar:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {room.assignedEquipment.map((eq, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-indigo-950/40 text-indigo-300 text-[11px] border border-indigo-500/20 font-medium"
                      >
                        • {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex justify-end">
                <button
                  onClick={() => openEditRoomModal(room)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-slate-100 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-xs font-bold"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Layout</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Facility Status Modal */}
      {editingFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white font-heading">
                Update Kelayakan {editingFacility.facilityName}
              </h3>
              <button onClick={() => setEditingFacility(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateFacilitySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Status Kelayakan *</label>
                <select
                  value={facStatus}
                  onChange={e => setFacStatus(e.target.value as FacilityStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-semibold focus:outline-none focus:border-teal-500"
                >
                  <option value="Sangat Baik">Sangat Baik (Lancar & Berfungsi Full)</option>
                  <option value="Perlu Perhatian">Perlu Perhatian (Ada Kendala Kecil)</option>
                  <option value="Kerusakan">Kerusakan (Butuh Perbaikan Segera)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Keterangan / Rincian Kondisi *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Daya 1300 Watt aman, air jernih dari sumur desa..."
                  value={facDetails}
                  onChange={e => setFacDetails(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Penanggung Jawab (PJ) *</label>
                <input
                  type="text"
                  required
                  value={facPic}
                  onChange={e => setFacPic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <ImageUploader
                value={facImage}
                onChange={setFacImage}
                label="Foto Bukti Fasilitas Posko (Opsional)"
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingFacility(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold shadow-lg"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Modal (Add / Edit) */}
      {(isAddRoomModalOpen || editingRoom) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white font-heading">
                {editingRoom ? 'Edit Tata Letak Kamar' : 'Tambah Ruangan / Kamar Posko'}
              </h3>
              <button
                onClick={() => {
                  setIsAddRoomModalOpen(false);
                  setEditingRoom(null);
                }}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoomSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Nama Ruangan / Kamar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kamar Putra 1 / Gudang Logistik"
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Kapasitas Tempat Tidur *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={roomCapacity}
                  onChange={e => setRoomCapacity(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Daftar Anggota Penghuni (Pisahkan Koma)</label>
                <input
                  type="text"
                  placeholder="Verri, Andika, Pratama, Farhan"
                  value={occupantsText}
                  onChange={e => setOccupantsText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Perangkat / Fasilitas Kamar (Pisahkan Koma)</label>
                <input
                  type="text"
                  placeholder="Kasur Busa 2x, Kipas Angin, Kabel Roll"
                  value={equipmentText}
                  onChange={e => setEquipmentText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <ImageUploader
                value={roomImage}
                onChange={setRoomImage}
                label="Denah / Foto Ruangan Kamar (Opsional)"
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddRoomModalOpen(false);
                    setEditingRoom(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg"
                >
                  Simpan Layout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
