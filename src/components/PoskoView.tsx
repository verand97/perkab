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
} from 'lucide-react';
import { usePerkab } from '../context/PerkabContext';
import { PoskoFacility, PoskoRoomLayout, FacilityStatus } from '../types';

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

  // Room Modal State
  const [editingRoom, setEditingRoom] = useState<PoskoRoomLayout | null>(null);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomCapacity, setRoomCapacity] = useState(4);
  const [occupantsText, setOccupantsText] = useState('');
  const [equipmentText, setEquipmentText] = useState('');

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
    setEditingFacility(null);
  };

  const openFacilityModal = (fac: PoskoFacility) => {
    setEditingFacility(fac);
    setFacStatus(fac.status);
    setFacDetails(fac.details);
    setFacPic(fac.picName);
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
      });
      setEditingRoom(null);
    } else {
      addRoomLayout({
        roomName,
        capacity: roomCapacity,
        occupants,
        assignedEquipment,
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
  };

  const resetRoomForm = () => {
    setRoomName('');
    setRoomCapacity(4);
    setOccupantsText('');
    setEquipmentText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Home className="w-6 h-6 text-teal-400" />
          <span>Akomodasi & Kelayakan Posko KKN</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Pengecekan fasilitas harian (listrik, air, dapur, kamar) serta pengaturan tata letak tempat tinggal kelompok
        </p>
      </div>

      {/* Facilities Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
          Status Fasilitas Utama Posko
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities.map(fac => (
            <div
              key={fac.id}
              className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3 hover:border-teal-500/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                    {getCategoryIcon(fac.category)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{fac.facilityName}</h4>
                    <span className="text-[10px] text-slate-400">{fac.category}</span>
                  </div>
                </div>

                <button
                  onClick={() => openFacilityModal(fac)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                  title="Update Status"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status pill */}
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                    fac.status === 'Sangat Baik'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : fac.status === 'Perlu Perhatian'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {fac.status === 'Sangat Baik' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  )}
                  <span>{fac.status}</span>
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                {fac.details}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <span>Cek Terakhir: <strong>{fac.lastChecked}</strong></span>
                <span>PIC: <strong className="text-teal-300">{fac.picName}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Room Layout & Capacity Section */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>Tata Letak Kamar & Pembagian Anggota</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Alokasi tempat tidur dan pembagian barang per ruangan di posko
            </p>
          </div>

          <button
            onClick={() => {
              resetRoomForm();
              setIsAddRoomModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kamar/Ruang</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rooms.map(room => (
            <div
              key={room.id}
              className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-base font-extrabold text-white">{room.roomName}</h4>
                <button
                  onClick={() => openEditRoomModal(room)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              {room.capacity > 0 && (
                <div className="text-xs text-slate-300">
                  <span className="text-slate-400">Kapasitas: </span>
                  <strong>{room.occupants.length} dari {room.capacity} Orang</strong>
                </div>
              )}

              {/* Occupants tags */}
              {room.occupants.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                    Anggota Penghuni:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {room.occupants.map((occ, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-emerald-300 border border-slate-700 text-[11px]"
                      >
                        {occ}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipment list */}
              {room.assignedEquipment.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                    Fasilitas & Barang Terpasang:
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {room.assignedEquipment.map((eq, idx) => (
                      <li key={idx} className="truncate">{eq}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Update Facility */}
      {editingFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white">
                Update Fasilitas: {editingFacility.facilityName}
              </h3>
              <button onClick={() => setEditingFacility(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateFacilitySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Status Kelayakan *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Sangat Baik', 'Perlu Perhatian', 'Kerusakan'] as FacilityStatus[]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFacStatus(st)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        facStatus === st
                          ? st === 'Sangat Baik'
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : st === 'Perlu Perhatian'
                            ? 'bg-amber-600 text-white border-amber-500'
                            : 'bg-rose-600 text-white border-rose-500'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Detail & Catatan Kondisi *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Kondisi terkini air, token listrik, kasur..."
                  value={facDetails}
                  onChange={e => setFacDetails(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">PIC Pemeriksa *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama anggota yang memeriksa"
                  value={facPic}
                  onChange={e => setFacPic(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFacility(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow"
                >
                  Simpan Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Room */}
      {(isAddRoomModalOpen || editingRoom) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white">
                {editingRoom ? 'Edit Layout Ruangan' : 'Tambah Ruangan Posko'}
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

            <form onSubmit={handleSaveRoomSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Ruangan / Kamar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kamar Depan (Putra) / Storage Gudang"
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Kapasitas Orang</label>
                <input
                  type="number"
                  min="0"
                  value={roomCapacity}
                  onChange={e => setRoomCapacity(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Daftar Penghuni (Pisahkan dengan Koma)</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Andi, Budi, Rian, Faris"
                  value={occupantsText}
                  onChange={e => setOccupantsText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Fasilitas / Barang Terpasang (Pisahkan dengan Koma)</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: 1 Kipas Angin, 1 Kabel Roll, 2 Kasur Busa"
                  value={equipmentText}
                  onChange={e => setEquipmentText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddRoomModalOpen(false);
                    setEditingRoom(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow"
                >
                  Simpan Ruangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
