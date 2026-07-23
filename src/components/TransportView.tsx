import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Clock,
  User,
  Package,
  DollarSign,
  CheckCircle2,
  Trash2,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { usePerkab } from '../context/PerkabContext';
import { TransportRecord, VehicleType, TransportStatus } from '../types';
import { exportToCSV } from '../lib/exportExcel';

export const TransportView: React.FC = () => {
  const {
    transports,
    addTransportRecord,
    updateTransportStatus,
    deleteTransportRecord,
    showConfirm,
  } = usePerkab();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Pick-up');
  const [driverName, setDriverName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [cargoDetails, setCargoDetails] = useState('');
  const [cost, setCost] = useState(0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransportRecord({
      vehicleName,
      vehicleType,
      driverName,
      purpose,
      departureDate,
      returnDate,
      cargoDetails,
      cost: Number(cost),
      status: 'Jadwal',
    });
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setVehicleName('');
    setVehicleType('Pick-up');
    setDriverName('');
    setPurpose('');
    setDepartureDate('');
    setReturnDate('');
    setCargoDetails('');
    setCost(0);
  };

  const handleExportCSV = () => {
    const data = transports.map(t => ({
      'Nama Kendaraan': t.vehicleName,
      'Jenis Armada': t.vehicleType,
      'Driver / PJ': t.driverName,
      'Tujuan': t.purpose,
      'Waktu Berangkat': t.departureDate,
      'Waktu Kembali': t.returnDate,
      'Muatan Barang/Orang': t.cargoDetails,
      'Biaya (Rp)': t.cost,
      'Status': t.status,
    }));
    exportToCSV(data, 'Transportasi_Mobilisasi');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-cyan-400" />
            <span>Pengaturan Transportasi & Mobilisasi</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pengurusan armada kendaraan (motor, mobil, pick-up) untuk pengangkutan barang & mobilitas kelompok
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Jadwalkan Mobilisasi</span>
          </button>
        </div>
      </div>

      {/* Transport Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {transports.map(trp => (
          <div
            key={trp.id}
            className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 text-xs font-bold">
                  {trp.vehicleType}
                </span>

                <select
                  value={trp.status}
                  onChange={e => updateTransportStatus(trp.id, e.target.value as TransportStatus)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold focus:outline-none ${
                    trp.status === 'Selesai'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : trp.status === 'Berjalan'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  <option value="Jadwal">Terjadwal</option>
                  <option value="Berjalan">Sedang Berjalan</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white">{trp.purpose}</h3>
                <div className="text-xs text-slate-300 font-semibold mt-1">
                  Kendaraan: {trp.vehicleName}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-slate-300">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Pengemudi / PJ: <strong>{trp.driverName}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Package className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Muatan: {trp.cargoDetails}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-800/40 text-slate-400">
                  <span className="block text-[10px] uppercase text-slate-500">Waktu Berangkat</span>
                  <span className="font-semibold text-slate-200">{trp.departureDate}</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-800/40 text-slate-400">
                  <span className="block text-[10px] uppercase text-slate-500">Estimasi Kembali</span>
                  <span className="font-semibold text-slate-200">{trp.returnDate}</span>
                </div>
              </div>

              {trp.cost > 0 && (
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-800/40">
                  <span className="text-slate-400">Biaya Bensin / Sewa:</span>
                  <span className="font-bold text-emerald-400">
                    Rp {trp.cost.toLocaleString('id-ID')}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  showConfirm({
                    title: 'Hapus Jadwal Transportasi',
                    message: `Apakah Anda yakin ingin menghapus jadwal armada "${trp.vehicleName}"?`,
                    confirmText: 'Ya, Hapus Armada',
                    danger: true,
                    onConfirm: () => deleteTransportRecord(trp.id),
                  });
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-700"
                title="Hapus Transport"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {transports.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 glass-panel rounded-2xl">
            Belum ada armada atau jadwal transportasi yang tercatat.
          </div>
        )}
      </div>

      {/* Modal Add Transport */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-extrabold text-white">Jadwalkan Mobilisasi Transportasi</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tujuan / Keperluan Mobilisasi *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Angkut Sound System & Kursi ke Balai Desa"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nama / Plat Kendaraan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Pick-up Grand Max / Motor Beat"
                    value={vehicleName}
                    onChange={e => setVehicleName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Jenis Armada *</label>
                  <select
                    value={vehicleType}
                    onChange={e => setVehicleType(e.target.value as VehicleType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Pick-up">Pick-up</option>
                    <option value="Motor">Motor</option>
                    <option value="Mobil">Mobil</option>
                    <option value="Truk">Truk</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Driver / Penanggungjawab *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama driver / warga"
                    value={driverName}
                    onChange={e => setDriverName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Biaya Bensin / Sewa (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={cost}
                    onChange={e => setCost(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Waktu Berangkat *</label>
                  <input
                    type="text"
                    required
                    placeholder="2026-07-24 07:00"
                    value={departureDate}
                    onChange={e => setDepartureDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Estimasi Kembali *</label>
                  <input
                    type="text"
                    required
                    placeholder="2026-07-24 13:00"
                    value={returnDate}
                    onChange={e => setReturnDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Rincian Muatan Barang / Anggota *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail barang atau jumlah penumpang..."
                  value={cargoDetails}
                  onChange={e => setCargoDetails(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
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
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg"
                >
                  Simpan Mobilisasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
