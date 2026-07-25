import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import { ConfirmDialogOptions } from '../types';

interface ConfirmModalProps {
  options: ConfirmDialogOptions | null;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ options, onClose }) => {
  if (!options) return null;

  const handleConfirm = () => {
    options.onConfirm();
    onClose();
  };

  const isDanger = options.danger !== false;

  return (
    <div className="fixed inset-0 z-95 flex items-center justify-center p-3 sm:p-4 bg-slate-950/95 backdrop-blur-xl">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl shrink-0 ${
              isDanger
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
            }`}
          >
            {isDanger ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
          </div>

          <div className="flex-1 space-y-1">
            <h3 className="text-base font-extrabold text-white">{options.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{options.message}</p>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            {options.cancelText || 'Batal'}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
            }`}
          >
            {options.confirmText || 'Ya, Lanjutkan'}
          </button>
        </div>
      </div>
    </div>
  );
};
