import React, { useState } from 'react';
import {
  Users,
  Plus,
  ShieldCheck,
  Edit2,
  Trash2,
  X,
  Search,
  UserCheck,
  KeyRound,
  FileSpreadsheet,
} from 'lucide-react';
import { usePerkab } from '../context/PerkabContext';
import { UserAccount, UserRole } from '../types';
import { exportToCSV } from '../lib/exportExcel';

export const UserManagementView: React.FC = () => {
  const {
    users,
    addUser,
    updateUser,
    deleteUser,
    currentUser,
  } = usePerkab();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [nim, setNim] = useState('');
  const [role, setRole] = useState<UserRole>('Anggota');
  const [position, setPosition] = useState('');

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.position && u.position.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
      name: name.trim().toLowerCase(),
      nim: nim.trim(),
      role,
      position: position.trim() || undefined,
    });
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUser({
      ...editingUser,
      name: name.trim().toLowerCase(),
      nim: nim.trim(),
      role,
      position: position.trim() || undefined,
    });
    setEditingUser(null);
    resetForm();
  };

  const openEditModal = (u: UserAccount) => {
    setEditingUser(u);
    setName(u.name);
    setNim(u.nim);
    setRole(u.role);
    setPosition(u.position || '');
  };

  const resetForm = () => {
    setName('');
    setNim('');
    setRole('Anggota');
    setPosition('');
  };

  const handleExportUsersCSV = () => {
    const data = filteredUsers.map(u => ({
      'Nama User (Username)': u.name,
      'NIM (Password)': u.nim,
      'Role Akses': u.role,
      'Jabatan / Posisi': u.position || '-',
    }));
    exportToCSV(data, 'Manajemen_User_Perkab');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Manajemen User & Hak Akses Role</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tambah, edit, atau hapus anggota kelompok serta tentukan role (Admin, PJ Perkab, Anggota)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportUsersCSV}
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah User Baru</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama anggota, NIM, atau posisi..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700/70">
                <th className="py-3.5 px-4">Nama Lengkap (User Login)</th>
                <th className="py-3.5 px-4">NIM (Password)</th>
                <th className="py-3.5 px-4">Role Akses</th>
                <th className="py-3.5 px-4">Jabatan / Posisi KKN</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map(u => {
                const isSelf = currentUser?.id === u.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-100 capitalize">
                      <div className="flex items-center gap-2">
                        <span>{u.name}</span>
                        {isSelf && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                            Saya (Aktif)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">
                      {u.nim}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                          u.role === 'Admin'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : u.role === 'PJ Perkab'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-slate-700/80 text-slate-300 border-slate-600'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{u.role}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {u.position || '-'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
                          title="Edit User & Role"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {!isSelf && (
                          <button
                            onClick={() => {
                              if (confirm(`Hapus akun user "${u.name}"?`)) {
                                deleteUser(u.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-700"
                            title="Hapus User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Tidak ada data user yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      {(isAddModalOpen || editingUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white">
                {editingUser ? 'Edit User & Role Akses' : 'Tambah User Akun Baru'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingUser(null);
                }}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingUser ? handleEditSubmit : handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nama Lengkap (Digunakan untuk User Login) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="muhammad verri andika pratama"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  NIM (Digunakan untuk Password Login) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="231240001452"
                  value={nim}
                  onChange={e => setNim(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Role / Hak Akses *</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value="Admin">Admin (Akses Penuh + Manajemen User)</option>
                  <option value="PJ Perkab">PJ Perkab (Penanggung Jawab Logistik)</option>
                  <option value="Anggota">Anggota (Anggota Kelompok KKN)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Jabatan / Posisi KKN</label>
                <input
                  type="text"
                  placeholder="Contoh: Koordinator Utama / PJ Inventaris / Anggota Logistik"
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Tambah User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
