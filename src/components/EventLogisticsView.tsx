import React, { useState } from 'react';
import {
  CalendarCheck,
  Plus,
  CheckSquare,
  Square,
  Clock,
  MapPin,
  UserCheck,
  Trash2,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { usePerkab } from '../context/PerkabContext';
import { EventSetup, SetupStatus } from '../types';
import { exportToCSV } from '../lib/exportExcel';

export const EventLogisticsView: React.FC = () => {
  const {
    eventSetups,
    addEventSetup,
    updateEventStatus,
    toggleEventChecklistItem,
    deleteEventSetup,
    showConfirm,
  } = usePerkab();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [picName, setPicName] = useState('');
  const [itemsInput, setItemsInput] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requiredItems = itemsInput
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map((line, idx) => ({
        id: `c-${idx}-${Date.now()}`,
        itemName: line,
        qty: 1,
        isReady: false,
      }));

    addEventSetup({
      eventName,
      eventDate,
      location,
      picName,
      setupStatus: 'Perencanaan',
      requiredItems,
      notes: notes || undefined,
    });

    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEventName('');
    setEventDate('');
    setLocation('');
    setPicName('');
    setItemsInput('');
    setNotes('');
  };

  const statuses: SetupStatus[] = [
    'Perencanaan',
    'Terangkut',
    'Terpasang',
    'Pembongkaran',
    'Selesai',
  ];

  const handleExportCSV = () => {
    const data = eventSetups.map(evt => ({
      'Nama Proker': evt.eventName,
      'Tanggal & Waktu': evt.eventDate,
      'Lokasi': evt.location,
      'PIC Acara': evt.picName,
      'Status': evt.setupStatus,
      'Daftar Peralatan': evt.requiredItems.map(i => `${i.itemName} [${i.isReady ? 'SIAP' : 'BELUM'}]`).join('; '),
      'Catatan': evt.notes || '-',
    }));
    exportToCSV(data, 'Persiapan_Proker_Acara');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-cyan-400" />
            <span>Persiapan Tempat & Proker Acara</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pengaturan panggung, tata letak tempat, sound system, & teknis peralatan untuk setiap program kerja KKN
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
            <span>Buat Setup Proker Baru</span>
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {eventSetups.map(evt => {
          const readyCount = evt.requiredItems.filter(i => i.isReady).length;
          const totalCount = evt.requiredItems.length;
          const percent = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;

          return (
            <div
              key={evt.id}
              className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5"
            >
              {/* Event Info Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-white">{evt.eventName}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {evt.eventDate}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {evt.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                      PIC: {evt.picName}
                    </span>
                  </div>
                </div>

                {/* Workflow Status Picker & Actions */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 px-2">Status:</span>
                    <select
                      value={evt.setupStatus}
                      onChange={e => updateEventStatus(evt.id, e.target.value as SetupStatus)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-cyan-300 focus:outline-none"
                    >
                      {statuses.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      showConfirm({
                        title: 'Hapus Setup Proker',
                        message: `Apakah Anda yakin ingin menghapus jadwal persiapan proker "${evt.eventName}"?`,
                        confirmText: 'Ya, Hapus Proker',
                        danger: true,
                        onConfirm: () => deleteEventSetup(evt.id),
                      });
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-700"
                    title="Hapus Proker Setup"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Readiness Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-semibold">Kelengkapan Perlengkapan Acara:</span>
                  <span className="font-bold text-cyan-300">{readyCount} dari {totalCount} Alat Ready ({percent}%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Equipment Interactive Checklist */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Checklist Peralatan & Logistik Tempat:
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {evt.requiredItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => toggleEventChecklistItem(evt.id, item.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                        item.isReady
                          ? 'bg-emerald-950/30 text-emerald-200 border-emerald-500/40'
                          : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.isReady ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        )}
                        <span className={item.isReady ? 'line-through text-emerald-300/80' : ''}>
                          {item.itemName}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.isReady
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {item.isReady ? 'READY' : 'BELUM'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {evt.notes && (
                <div className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="font-bold text-slate-300">Catatan Teknis: </span>
                  {evt.notes}
                </div>
              )}
            </div>
          );
        })}

        {eventSetups.length === 0 && (
          <div className="py-12 text-center text-slate-500 glass-panel rounded-2xl">
            Belum ada jadwal persiapan tempat proker.
          </div>
        )}
      </div>

      {/* Modal Add Event Setup */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-extrabold text-white">Buat Setup Logistik Proker Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Program Kerja / Acara *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Perpisahan KKN & Pentas Seni Pemuda"
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tanggal & Waktu *</label>
                  <input
                    type="text"
                    required
                    placeholder="2026-08-05 19:00 WIB"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Lokasi Acara *</label>
                  <input
                    type="text"
                    required
                    placeholder="Lapangan Desa / Balai Desa"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">PIC Logistik Acara *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama penanggungjawab tempat"
                  value={picName}
                  onChange={e => setPicName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Daftar Alat Needed (1 Alat Per Baris) *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={`Sound System High Watt\nProyektor & Layar\n50 Kursi Plastik\n2 Roll Kabel 25m\nSpanduk Banner 3x1m`}
                  value={itemsInput}
                  onChange={e => setItemsInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Catatan Teknis</label>
                <textarea
                  rows={2}
                  placeholder="Instruksi angkut, genset backup, dll..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
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
                  Simpan Setup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
