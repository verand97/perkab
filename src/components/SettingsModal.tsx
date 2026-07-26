import React, { useState } from 'react';
import {
  Settings,
  Database,
  CloudCheck,
  HardDrive,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  X,
  Code2,
  ShieldAlert,
} from 'lucide-react';
import { usePerkab } from '../context/PerkabContext';
import { SUPABASE_SQL_SCHEMA } from '../lib/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    supabaseConfig,
    updateSupabaseConfig,
    resetToSampleData,
    clearAllData,
    showConfirm,
  } = usePerkab();

  const [url, setUrl] = useState(supabaseConfig.url || '');
  const [anonKey, setAnonKey] = useState(supabaseConfig.anonKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showSql, setShowSql] = useState(false);

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'Admin';

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-90 flex items-center justify-center p-3 sm:p-4 bg-slate-950/95 backdrop-blur-xl">
        <div className="glass-card w-full max-w-md rounded-2xl sm:rounded-3xl p-6 border border-rose-500/40 text-center space-y-4 shadow-2xl my-auto">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white font-heading">Akses Ditolak (Khusus Admin)</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Pengaturan Database Supabase &amp; Opsi Reset Data hanya dapat diakses oleh <strong className="text-emerald-400 font-semibold">Admin Utama Perkab KKN</strong>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  const handleSaveSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    const result = await updateSupabaseConfig({
      url: url.trim(),
      anonKey: anonKey.trim(),
      isConnected: false,
    });

    setIsTesting(false);
    setTestResult(result);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClearAll = () => {
    showConfirm({
      title: 'Kosongkan Semua Data',
      message: 'PERINGATAN: Apakah Anda yakin ingin MENGOSONGKAN DAN BERSIHKAN SEMUA DATA (Inventaris, Peminjaman, Posko, Transport, Proker, Kerusakan)? Data lokal dan database cloud akan dihapus.',
      confirmText: 'Ya, Bersihkan Semua Data',
      danger: true,
      onConfirm: async () => {
        await clearAllData(true);
        onClose();
      },
    });
  };

  const handleResetDemo = () => {
    showConfirm({
      title: 'Reset Demo Data',
      message: 'Apakah Anda yakin ingin mengembalikan data ke contoh awal simulasi KKN?',
      confirmText: 'Ya, Reset Demo Data',
      danger: false,
      onConfirm: () => {
        resetToSampleData();
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center p-3 sm:p-4 bg-slate-950/95 backdrop-blur-xl overflow-y-auto">
      <div className="glass-card w-full max-w-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-700 shadow-2xl my-auto max-h-[90vh] flex flex-col space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-slate-800 text-teal-400 border border-slate-700 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-white font-heading truncate">
                Pengaturan Database & Backend
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Mode Offline (Local Storage) atau Cloud Sync Supabase
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">

        {/* Current Active Mode */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {supabaseConfig.isConnected ? (
              <CloudCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <HardDrive className="w-6 h-6 text-amber-400 shrink-0" />
            )}
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {supabaseConfig.isConnected ? 'Mode Supabase Cloud' : 'Mode Offline (Browser Storage)'}
              </div>
              <div className="text-[11px] text-slate-400 leading-snug">
                {supabaseConfig.isConnected
                  ? 'Tersinkronisasi secara real-time ke Supabase cloud'
                  : 'Data tersimpan lokal di browser Anda (tanpa perlu server)'}
              </div>
            </div>
          </div>
        </div>

        {/* Supabase Form */}
        <form onSubmit={handleSaveSupabase} className="space-y-3.5 text-xs">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Konfigurasi Supabase Project:
          </h4>

          <div>
            <label className="block font-semibold text-slate-400 mb-1">Project URL</label>
            <input
              type="text"
              placeholder="https://xyzxyz.supabase.co"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono text-xs truncate"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-400 mb-1">Anon API Key</label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR..."
              value={anonKey}
              onChange={e => setAnonKey(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono text-xs truncate"
            />
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs leading-relaxed ${
                testResult.success
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-950/40 text-rose-300 border-rose-500/40'
              }`}
            >
              {testResult.message}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowSql(!showSql)}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center justify-center sm:justify-start gap-1.5 py-1 transition-colors cursor-pointer"
            >
              <Code2 className="w-4 h-4 shrink-0" />
              <span>{showSql ? 'Sembunyikan Skema SQL' : 'Lihat Skema SQL Supabase'}</span>
            </button>

            <button
              type="submit"
              disabled={isTesting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold shadow text-xs transition-all shrink-0 cursor-pointer"
            >
              {isTesting ? 'Testing Koneksi...' : 'Simpan & Tes Koneksi'}
            </button>
          </div>
        </form>

        {/* SQL Schema Preview */}
        {showSql && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-300 truncate">Skema DDL Database Supabase:</span>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold border border-slate-700 shrink-0 cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Tercopy!' : 'Copy SQL Script'}</span>
              </button>
            </div>

            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-300 overflow-x-auto max-h-40 font-mono">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        )}

        {/* Data Management Section */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Manajemen Data & Reset:
          </h4>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              onClick={handleClearAll}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span>Bersihkan Semua Data (Kosongkan)</span>
            </button>

            <button
              onClick={handleResetDemo}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Muat Ulang Demo Data</span>
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};
