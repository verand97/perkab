import React from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  X,
  CheckCircle2,
  Table,
} from 'lucide-react';
import { usePerkab } from '../context/PerkabContext';
import { exportToExcel, exportToCSV } from '../lib/exportExcel';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const {
    inventory,
    borrowings,
    facilities,
    rooms,
    eventSetups,
    transports,
    maintenanceLogs,
  } = usePerkab();

  if (!isOpen) return null;

  const handleExportFullExcel = () => {
    exportToExcel({
      inventory,
      borrowings,
      facilities,
      rooms,
      eventSetups,
      transports,
      maintenance: maintenanceLogs,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="glass-card w-full max-w-xl rounded-3xl p-6 border border-slate-700 shadow-2xl my-auto max-h-[90vh] flex flex-col space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-linear-to-tr from-emerald-600 to-teal-500 text-white shadow">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-heading">
                Pusat Rekapitulasi Data (Excel & CSV)
              </h3>
              <p className="text-xs text-slate-400">
                Unduh seluruh laporan logistik, peminjaman, dan akomodasi KKN
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">

        {/* Option 1: Full Excel Workbook (.xlsx) */}
        <div className="p-5 rounded-2xl bg-linear-to-r from-slate-900 to-emerald-950/50 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase">
                RECOMMENDED
              </span>
              <h4 className="text-sm font-bold text-white">Full Workbook Excel (.xlsx)</h4>
            </div>
            <span className="text-xs text-emerald-400 font-bold">7 Sheet Terpisah</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Menghasilkan file Excel lengkap yang berisi seluruh data Perkab: Katalog Inventaris, Record Peminjaman Alat, Kelayakan Posko, Layout Kamar, Setup Proker, Transportasi, dan Laporan Kerusakan.
          </p>

          <button
            onClick={handleExportFullExcel}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Rekap Excel (.xlsx)</span>
          </button>
        </div>

        {/* Option 2: Individual CSV Exports (.csv) */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Ekspor Per Modul ke CSV (.csv):
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => exportToCSV(inventory, 'Inventaris_Logistik')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Table className="w-4 h-4 text-emerald-400" />
                <span>Inventaris Logistik</span>
              </span>
              <span className="text-[10px] text-slate-400">CSV</span>
            </button>

            <button
              onClick={() => exportToCSV(borrowings, 'Peminjaman_Alat')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Table className="w-4 h-4 text-amber-400" />
                <span>Peminjaman Alat</span>
              </span>
              <span className="text-[10px] text-slate-400">CSV</span>
            </button>

            <button
              onClick={() => exportToCSV(facilities, 'Fasilitas_Posko')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Table className="w-4 h-4 text-teal-400" />
                <span>Fasilitas Posko</span>
              </span>
              <span className="text-[10px] text-slate-400">CSV</span>
            </button>

            <button
              onClick={() => exportToCSV(eventSetups, 'Setup_Proker_Acara')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Table className="w-4 h-4 text-cyan-400" />
                <span>Setup Proker Acara</span>
              </span>
              <span className="text-[10px] text-slate-400">CSV</span>
            </button>

            <button
              onClick={() => exportToCSV(transports, 'Transportasi_Mobilisasi')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Table className="w-4 h-4 text-indigo-400" />
                <span>Transportasi</span>
              </span>
              <span className="text-[10px] text-slate-400">CSV</span>
            </button>

            <button
              onClick={() => exportToCSV(maintenanceLogs, 'Laporan_Kerusakan')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Table className="w-4 h-4 text-rose-400" />
                <span>Laporan Kerusakan</span>
              </span>
              <span className="text-[10px] text-slate-400">CSV</span>
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
