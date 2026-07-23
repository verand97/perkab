import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  InventoryItem,
  BorrowingRecord,
  PoskoFacility,
  PoskoRoomLayout,
  EventSetup,
  TransportRecord,
  MaintenanceLog,
  SupabaseConfig,
  UserAccount,
  ToastMessage,
  ToastType,
  ConfirmDialogOptions,
  ThemeMode,
} from '../types';
import {
  INITIAL_INVENTORY,
  INITIAL_BORROWINGS,
  INITIAL_POSKO_FACILITIES,
  INITIAL_ROOM_LAYOUTS,
  INITIAL_EVENT_SETUPS,
  INITIAL_TRANSPORTS,
  INITIAL_MAINTENANCE_LOGS,
  INITIAL_USERS,
} from '../lib/sampleData';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  getSupabaseClient,
  resetSupabaseClient,
} from '../lib/supabase';

interface PerkabContextType {
  // Theme Mode
  themeMode: ThemeMode;
  toggleTheme: () => void;

  // Auth & Session
  currentUser: UserAccount | null;
  login: (nameOrNim: string, nim: string) => boolean;
  logout: () => void;

  // Notification & Dialog System
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastType, title?: string) => void;
  removeToast: (id: string) => void;
  confirmOptions: ConfirmDialogOptions | null;
  showConfirm: (options: ConfirmDialogOptions) => void;
  closeConfirm: () => void;

  // Users CRUD
  users: UserAccount[];
  addUser: (user: Omit<UserAccount, 'id'>) => void;
  updateUser: (user: UserAccount) => void;
  deleteUser: (id: string) => void;

  // Inventory
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'code'>) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;

  // Borrowings
  borrowings: BorrowingRecord[];
  addBorrowingRecord: (record: Omit<BorrowingRecord, 'id'>) => void;
  returnBorrowingItem: (id: string, conditionOnReturn: 'Bagus' | 'Rusak' | 'Hilang', returnNotes?: string) => void;
  deleteBorrowingRecord: (id: string) => void;

  // Posko & Facilities
  facilities: PoskoFacility[];
  updateFacilityStatus: (id: string, status: PoskoFacility['status'], details: string, picName: string) => void;
  rooms: PoskoRoomLayout[];
  updateRoomLayout: (room: PoskoRoomLayout) => void;
  addRoomLayout: (room: Omit<PoskoRoomLayout, 'id'>) => void;

  // Events
  eventSetups: EventSetup[];
  addEventSetup: (event: Omit<EventSetup, 'id'>) => void;
  updateEventStatus: (id: string, status: EventSetup['setupStatus']) => void;
  toggleEventChecklistItem: (eventId: string, itemId: string) => void;
  deleteEventSetup: (id: string) => void;

  // Transports
  transports: TransportRecord[];
  addTransportRecord: (trp: Omit<TransportRecord, 'id'>) => void;
  updateTransportStatus: (id: string, status: TransportRecord['status']) => void;
  deleteTransportRecord: (id: string) => void;

  // Maintenance
  maintenanceLogs: MaintenanceLog[];
  addMaintenanceLog: (log: Omit<MaintenanceLog, 'id' | 'dateReported'>) => void;
  updateMaintenanceStatus: (id: string, status: MaintenanceLog['status'], resolutionNotes?: string) => void;

  // Config, Reset & Clear
  supabaseConfig: SupabaseConfig;
  updateSupabaseConfig: (config: SupabaseConfig) => Promise<boolean>;
  resetToSampleData: () => void;
  clearAllData: (clearSupabase?: boolean) => Promise<void>;
}

const PerkabContext = createContext<PerkabContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'perkab_app_data_v1';
const SESSION_KEY = 'perkab_session_user';
const THEME_STORAGE_KEY = 'perkab_theme';

export const PerkabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme Mode State
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(themeMode);
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      showToast(`Mode ${next === 'dark' ? 'Gelap (Dark)' : 'Terang (Light)'} Aktif`, 'info');
      return next;
    });
  };

  // Toast & Confirm System State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmDialogOptions | null>(null);

  const showToast = (message: string, type: ToastType = 'info', title?: string) => {
    const id = `tst-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, message, type, title };
    setToasts(prev => [newToast, ...prev].slice(0, 5));

    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showConfirm = (options: ConfirmDialogOptions) => {
    setConfirmOptions(options);
  };

  const closeConfirm = () => {
    setConfirmOptions(null);
  };

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return null;
  });

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [borrowings, setBorrowings] = useState<BorrowingRecord[]>([]);
  const [facilities, setFacilities] = useState<PoskoFacility[]>([]);
  const [rooms, setRooms] = useState<PoskoRoomLayout[]>([]);
  const [eventSetups, setEventSetups] = useState<EventSetup[]>([]);
  const [transports, setTransports] = useState<TransportRecord[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [supabaseConfig, setSupabaseConfigState] = useState<SupabaseConfig>(getStoredSupabaseConfig());

  const isMounted = useRef(false);

  // Load Initial Data
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUsers(parsed.users || INITIAL_USERS);
        setInventory(parsed.inventory || []);
        setBorrowings(parsed.borrowings || []);
        setFacilities(parsed.facilities || []);
        setRooms(parsed.rooms || []);
        setEventSetups(parsed.eventSetups || []);
        setTransports(parsed.transports || []);
        setMaintenanceLogs(parsed.maintenanceLogs || []);
        return;
      } catch (e) {
        console.error('Failed to load local storage:', e);
      }
    }

    setUsers(INITIAL_USERS);
    setInventory(INITIAL_INVENTORY);
    setBorrowings(INITIAL_BORROWINGS);
    setFacilities(INITIAL_POSKO_FACILITIES);
    setRooms(INITIAL_ROOM_LAYOUTS);
    setEventSetups(INITIAL_EVENT_SETUPS);
    setTransports(INITIAL_TRANSPORTS);
    setMaintenanceLogs(INITIAL_MAINTENANCE_LOGS);
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const dataToSave = {
      users,
      inventory,
      borrowings,
      facilities,
      rooms,
      eventSetups,
      transports,
      maintenanceLogs,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  }, [users, inventory, borrowings, facilities, rooms, eventSetups, transports, maintenanceLogs]);

  // Sync with Supabase if active
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;

    async function syncRemote() {
      try {
        const { data: userData } = await client!.from('users').select('*');
        if (userData && userData.length > 0) {
          const formattedUsers = userData.map((u: any) => ({
            id: u.id,
            name: u.name,
            nim: u.nim,
            role: u.role,
            position: u.position,
          }));
          setUsers(formattedUsers);
        }

        const { data: invData } = await client!.from('inventory').select('*');
        if (invData && invData.length > 0) {
          const formatted = invData.map((d: any) => ({
            id: d.id,
            code: d.code,
            name: d.name,
            category: d.category,
            quantity: d.quantity,
            availableQty: d.available_qty,
            unit: d.unit,
            condition: d.condition,
            ownership: d.ownership,
            lenderName: d.lender_name,
            location: d.location,
            notes: d.notes,
          }));
          setInventory(formatted);
        }
      } catch (e) {
        console.log('Supabase sync info:', e);
      }
    }
    syncRemote();
  }, [supabaseConfig]);

  // Auth Handlers
  const login = (nameOrNim: string, nim: string): boolean => {
    const query = nameOrNim.trim().toLowerCase();
    const password = nim.trim();

    const matchedUser = users.find(u => {
      const matchName = u.name.trim().toLowerCase() === query;
      const matchNim = u.nim.trim() === query;
      const matchPass = u.nim.trim() === password;
      return (matchName || matchNim) && matchPass;
    });

    if (matchedUser) {
      setCurrentUser(matchedUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(matchedUser));
      showToast(`Selamat datang kembali, ${matchedUser.name}!`, 'success', 'Login Berhasil');
      return true;
    }
    showToast('Nama atau NIM tidak cocok dengan database!', 'error', 'Login Gagal');
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
    showToast('Anda telah keluar dari aplikasi.', 'info', 'Logout');
  };

  // User CRUD Handlers
  const addUser = (newUser: Omit<UserAccount, 'id'>) => {
    const id = `usr-${Date.now()}`;
    const userItem: UserAccount = {
      ...newUser,
      id,
    };
    setUsers(prev => [...prev, userItem]);
    showToast(`User ${newUser.name} berhasil ditambahkan!`, 'success');

    const client = getSupabaseClient();
    if (client) {
      client.from('users').insert([{
        id,
        name: newUser.name,
        nim: newUser.nim,
        role: newUser.role,
        position: newUser.position || null,
      }]).then();
    }
  };

  const updateUser = (updated: UserAccount) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    if (currentUser?.id === updated.id) {
      setCurrentUser(updated);
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    }
    showToast(`Data user ${updated.name} berhasil diperbarui.`, 'success');

    const client = getSupabaseClient();
    if (client) {
      client.from('users').update({
        name: updated.name,
        nim: updated.nim,
        role: updated.role,
        position: updated.position || null,
      }).eq('id', updated.id).then();
    }
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    showToast('User berhasil dihapus.', 'info');
    const client = getSupabaseClient();
    if (client) {
      client.from('users').delete().eq('id', id).then();
    }
  };

  // Inventory Handlers
  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'code'>) => {
    const nextNum = inventory.length + 1;
    const catCode = item.category.substring(0, 3).toUpperCase();
    const code = `PKB-${catCode}-${String(nextNum).padStart(3, '0')}`;
    const id = `inv-${Date.now()}`;

    const newItem: InventoryItem = {
      ...item,
      id,
      code,
    };

    setInventory(prev => [newItem, ...prev]);
    showToast(`Barang "${item.name}" (${code}) berhasil ditambahkan!`, 'success');

    const client = getSupabaseClient();
    if (client) {
      client.from('inventory').insert([{
        id,
        code,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        available_qty: item.availableQty,
        unit: item.unit,
        condition: item.condition,
        ownership: item.ownership,
        lender_name: item.lenderName || null,
        location: item.location,
        notes: item.notes || null,
      }]).then();
    }
  };

  const updateInventoryItem = (updated: InventoryItem) => {
    setInventory(prev => prev.map(item => item.id === updated.id ? updated : item));
    showToast(`Data barang "${updated.name}" berhasil diperbarui.`, 'success');

    const client = getSupabaseClient();
    if (client) {
      client.from('inventory').update({
        name: updated.name,
        category: updated.category,
        quantity: updated.quantity,
        available_qty: updated.availableQty,
        unit: updated.unit,
        condition: updated.condition,
        ownership: updated.ownership,
        lender_name: updated.lenderName || null,
        location: updated.location,
        notes: updated.notes || null,
      }).eq('id', updated.id).then();
    }
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
    showToast('Barang inventaris dihapus.', 'info');
    const client = getSupabaseClient();
    if (client) {
      client.from('inventory').delete().eq('id', id).then();
    }
  };

  // Borrowings Handlers
  const addBorrowingRecord = (record: Omit<BorrowingRecord, 'id'>) => {
    const id = `bor-${Date.now()}`;
    const newRecord: BorrowingRecord = {
      ...record,
      id,
    };

    setBorrowings(prev => [newRecord, ...prev]);
    showToast(`Peminjaman "${record.itemName}" berhasil dicatat.`, 'success');

    if (record.inventoryId) {
      setInventory(prev => prev.map(inv => {
        if (inv.id === record.inventoryId) {
          return {
            ...inv,
            availableQty: Math.max(0, inv.availableQty - record.quantity),
          };
        }
        return inv;
      }));
    }

    const client = getSupabaseClient();
    if (client) {
      client.from('borrowings').insert([{
        id,
        item_name: record.itemName,
        inventory_id: record.inventoryId || null,
        lender_name: record.lenderName,
        lender_phone: record.lenderPhone,
        borrower_name: record.borrowerName,
        borrow_date: record.borrowDate,
        due_date: record.dueDate,
        quantity: record.quantity,
        deposit_cost: record.depositCost,
        status: record.status,
        notes: record.notes || null,
      }]).then();
    }
  };

  const returnBorrowingItem = (id: string, conditionOnReturn: 'Bagus' | 'Rusak' | 'Hilang', returnNotes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    setBorrowings(prev => prev.map(bor => {
      if (bor.id === id) {
        if (bor.inventoryId) {
          setInventory(invList => invList.map(inv => {
            if (inv.id === bor.inventoryId) {
              return {
                ...inv,
                availableQty: Math.min(inv.quantity, inv.availableQty + bor.quantity),
                condition: conditionOnReturn === 'Rusak' ? 'Rusak' : inv.condition,
              };
            }
            return inv;
          }));
        }

        if (conditionOnReturn !== 'Bagus') {
          addMaintenanceLog({
            itemName: bor.itemName,
            reportedBy: `${bor.borrowerName} (Pengembalian ${bor.lenderName})`,
            damageDescription: `Barang dikembalikan dalam kondisi ${conditionOnReturn}. ${returnNotes || ''}`,
            estimatedCost: 50000,
            status: 'Dilaporkan',
          });
        }

        return {
          ...bor,
          status: 'Dikembalikan',
          returnDate: today,
          conditionOnReturn,
          notes: returnNotes ? `${bor.notes ? bor.notes + ' | ' : ''}Catatan Kembali: ${returnNotes}` : bor.notes,
        };
      }
      return bor;
    }));

    showToast('Status pengembalian barang berhasil dicatat!', 'success');

    const client = getSupabaseClient();
    if (client) {
      client.from('borrowings').update({
        status: 'Dikembalikan',
        return_date: today,
        condition_on_return: conditionOnReturn,
      }).eq('id', id).then();
    }
  };

  const deleteBorrowingRecord = (id: string) => {
    setBorrowings(prev => prev.filter(bor => bor.id !== id));
    showToast('Record peminjaman dihapus.', 'info');
    const client = getSupabaseClient();
    if (client) {
      client.from('borrowings').delete().eq('id', id).then();
    }
  };

  // Posko Handlers
  const updateFacilityStatus = (id: string, status: PoskoFacility['status'], details: string, picName: string) => {
    const today = new Date().toISOString().split('T')[0];
    setFacilities(prev => prev.map(f => f.id === id ? { ...f, status, details, lastChecked: today, picName } : f));
    showToast('Status fasilitas posko berhasil diperbarui.', 'success');
  };

  const updateRoomLayout = (updatedRoom: PoskoRoomLayout) => {
    setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
    showToast(`Layout ${updatedRoom.roomName} berhasil diperbarui.`, 'success');
  };

  const addRoomLayout = (room: Omit<PoskoRoomLayout, 'id'>) => {
    const newRoom: PoskoRoomLayout = {
      ...room,
      id: `room-${Date.now()}`,
    };
    setRooms(prev => [...prev, newRoom]);
    showToast(`Ruangan ${room.roomName} berhasil ditambahkan!`, 'success');
  };

  // Event Handlers
  const addEventSetup = (evt: Omit<EventSetup, 'id'>) => {
    const newEvt: EventSetup = {
      ...evt,
      id: `evt-${Date.now()}`,
    };
    setEventSetups(prev => [newEvt, ...prev]);
    showToast(`Setup proker "${evt.eventName}" berhasil dibuat.`, 'success');
  };

  const updateEventStatus = (id: string, status: EventSetup['setupStatus']) => {
    setEventSetups(prev => prev.map(e => e.id === id ? { ...e, setupStatus: status } : e));
    showToast('Status alur proker diperbarui.', 'info');
  };

  const toggleEventChecklistItem = (eventId: string, itemId: string) => {
    setEventSetups(prev => prev.map(evt => {
      if (evt.id === eventId) {
        const updatedItems = evt.requiredItems.map(item => {
          if (item.id === itemId) {
            return { ...item, isReady: !item.isReady };
          }
          return item;
        });
        return { ...evt, requiredItems: updatedItems };
      }
      return evt;
    }));
  };

  const deleteEventSetup = (id: string) => {
    setEventSetups(prev => prev.filter(e => e.id !== id));
    showToast('Setup proker dihapus.', 'info');
  };

  // Transport Handlers
  const addTransportRecord = (trp: Omit<TransportRecord, 'id'>) => {
    const newTrp: TransportRecord = {
      ...trp,
      id: `trp-${Date.now()}`,
    };
    setTransports(prev => [newTrp, ...prev]);
    showToast(`Jadwal armada ${trp.vehicleName} berhasil disimpan.`, 'success');
  };

  const updateTransportStatus = (id: string, status: TransportRecord['status']) => {
    setTransports(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    showToast('Status mobilisasi diperbarui.', 'info');
  };

  const deleteTransportRecord = (id: string) => {
    setTransports(prev => prev.filter(t => t.id !== id));
    showToast('Jadwal transportasi dihapus.', 'info');
  };

  // Maintenance Handlers
  const addMaintenanceLog = (log: Omit<MaintenanceLog, 'id' | 'dateReported'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newLog: MaintenanceLog = {
      ...log,
      id: `mt-${Date.now()}`,
      dateReported: today,
    };
    setMaintenanceLogs(prev => [newLog, ...prev]);
    showToast(`Laporan kerusakan ${log.itemName} berhasil dibuat.`, 'warning');
  };

  const updateMaintenanceStatus = (id: string, status: MaintenanceLog['status'], resolutionNotes?: string) => {
    setMaintenanceLogs(prev => prev.map(m => m.id === id ? {
      ...m,
      status,
      resolutionNotes: resolutionNotes || m.resolutionNotes,
    } : m));
    showToast('Status perbaikan barang berhasil diperbarui.', 'success');
  };

  // Supabase Config update
  const updateSupabaseConfig = async (newConfig: SupabaseConfig): Promise<boolean> => {
    saveSupabaseConfig(newConfig);
    resetSupabaseClient();
    setSupabaseConfigState(newConfig);

    if (newConfig.url && newConfig.anonKey) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { error } = await client.from('inventory').select('id').limit(1);
          if (!error) {
            setSupabaseConfigState({ ...newConfig, isConnected: true });
            saveSupabaseConfig({ ...newConfig, isConnected: true });
            showToast('Koneksi Supabase Cloud Berhasil Aktif!', 'success');
            return true;
          }
        }
      } catch (e) {
        console.error('Supabase test connection failed:', e);
      }
    }
    setSupabaseConfigState({ ...newConfig, isConnected: false });
    saveSupabaseConfig({ ...newConfig, isConnected: false });
    showToast('Gagal terhubung ke Supabase Cloud.', 'error');
    return false;
  };

  const resetToSampleData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setUsers(INITIAL_USERS);
    setInventory(INITIAL_INVENTORY);
    setBorrowings(INITIAL_BORROWINGS);
    setFacilities(INITIAL_POSKO_FACILITIES);
    setRooms(INITIAL_ROOM_LAYOUTS);
    setEventSetups(INITIAL_EVENT_SETUPS);
    setTransports(INITIAL_TRANSPORTS);
    setMaintenanceLogs(INITIAL_MAINTENANCE_LOGS);
    showToast('Data berhasil di-reset ke data awal.', 'info');
  };

  const clearAllData = async (clearSupabase: boolean = true) => {
    setInventory([]);
    setBorrowings([]);
    setFacilities([]);
    setRooms([]);
    setEventSetups([]);
    setTransports([]);
    setMaintenanceLogs([]);

    const emptyData = {
      users,
      inventory: [],
      borrowings: [],
      facilities: [],
      rooms: [],
      eventSetups: [],
      transports: [],
      maintenanceLogs: [],
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(emptyData));

    if (clearSupabase) {
      const client = getSupabaseClient();
      if (client) {
        try {
          await client.from('inventory').delete().neq('id', '');
          await client.from('borrowings').delete().neq('id', '');
          await client.from('posko_facilities').delete().neq('id', '');
          await client.from('posko_rooms').delete().neq('id', '');
          await client.from('event_setups').delete().neq('id', '');
          await client.from('transports').delete().neq('id', '');
          await client.from('maintenance_logs').delete().neq('id', '');
        } catch (e) {
          console.error('Failed to clear Supabase data:', e);
        }
      }
    }
    showToast('Semua data berhasil dibersihkan dari aplikasi & database!', 'success', 'Database Kosong');
  };

  return (
    <PerkabContext.Provider
      value={{
        themeMode,
        toggleTheme,

        currentUser,
        login,
        logout,

        toasts,
        showToast,
        removeToast,
        confirmOptions,
        showConfirm,
        closeConfirm,

        users,
        addUser,
        updateUser,
        deleteUser,

        inventory,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,

        borrowings,
        addBorrowingRecord,
        returnBorrowingItem,
        deleteBorrowingRecord,

        facilities,
        updateFacilityStatus,
        rooms,
        updateRoomLayout,
        addRoomLayout,

        eventSetups,
        addEventSetup,
        updateEventStatus,
        toggleEventChecklistItem,
        deleteEventSetup,

        transports,
        addTransportRecord,
        updateTransportStatus,
        deleteTransportRecord,

        maintenanceLogs,
        addMaintenanceLog,
        updateMaintenanceStatus,

        supabaseConfig,
        updateSupabaseConfig,
        resetToSampleData,
        clearAllData,
      }}
    >
      {children}
    </PerkabContext.Provider>
  );
};

export const usePerkab = () => {
  const context = useContext(PerkabContext);
  if (!context) {
    throw new Error('usePerkab must be used within a PerkabProvider');
  }
  return context;
};
