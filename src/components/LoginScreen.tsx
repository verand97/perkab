import React, { useState } from 'react';
import {
  Package,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { usePerkab } from '../context/PerkabContext';

export const LoginScreen: React.FC = () => {
  const { login } = usePerkab();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Harap isi Nama (User Login) dan NIM (Password)!');
      return;
    }

    const success = login(username, password);
    if (!success) {
      setErrorMsg('Login gagal! Nama atau NIM tidak sesuai. Pastikan Nama & NIM sudah benar.');
    }
  };

  const handleQuickFillAdmin = () => {
    setUsername('muhammad verri andika pratama');
    setPassword('231240001452');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Subtle Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="glass-card w-full max-w-md rounded-3xl p-8 border border-slate-800 shadow-2xl relative z-10 space-y-6">
        {/* Header Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 rounded-2xl bg-linear-to-br from-emerald-500 via-teal-600 to-slate-900 text-white shadow-xl shadow-emerald-500/20 ring-1 ring-white/20">
            <Package className="w-8 h-8 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white font-heading">
              PERKAB<span className="text-emerald-400">.KKN</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Sistem Login Perlengkapan & Akomodasi Logistik KKN 2026
            </p>
          </div>
        </div>

        {/* Quick Admin Helper */}
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-2.5">
          <div className="flex items-center justify-between font-bold text-emerald-300 font-heading">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Akun Admin Utama KKN:</span>
            </span>
            <button
              onClick={handleQuickFillAdmin}
              className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-extrabold uppercase transition-all shadow-md active:scale-95 font-heading"
            >
              Isi Otomatis
            </button>
          </div>
          <div className="text-[11px] text-slate-300 space-y-1">
            <div>Nama: <strong className="text-white capitalize">muhammad verri andika pratama</strong></div>
            <div>NIM / Password: <strong className="text-emerald-300 font-mono">231240001452</strong></div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-semibold leading-relaxed">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block font-extrabold text-slate-300 mb-1 font-heading">
              Nama Lengkap (User Login) *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="muhammad verri andika pratama"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block font-extrabold text-slate-300 mb-1 font-heading">
              NIM (Password) *
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Masukkan NIM..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider font-heading shadow-xl shadow-emerald-600/25 active:scale-95 transition-all mt-2"
          >
            <span>Masuk ke Dashboard Perkab</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-500 pt-3 border-t border-slate-800/80">
          Tim Perlengkapan & Akomodasi Kelompok KKN 2026
        </div>
      </div>
    </div>
  );
};
