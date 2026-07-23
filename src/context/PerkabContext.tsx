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
} from '../types';
import {
  INITIAL_INVENTORY,
  INITIAL_BORROWINGS,
  INITIAL_POSKO_FACILITIES,
  INITIAL_ROOM_LAYOUTS,
  INITIAL_EVENT_SETUPS,
  INITIAL_TRANSPORTS,
  INITIAL_MAINTENANCE_LOGS,
} from '../lib/sampleData';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  getSupabaseClient,
  resetSupabaseClient,
} from '../lib/supabase';

interface PerkabContextType {
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

export const PerkabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

    // Default to sample data if first time
    setInventory(INITIAL_INVENTORY);
    setBorrowings(INITIAL_BORROWINGS);
    setFacilities(INITIAL_POSKO_FACILITIES);
    setRooms(INITIAL_ROOM_LAYOUTS);
    setEventSetups(INITIAL_EVENT_SETUPS);
    setTransports(INITIAL_TRANSPORTS);
    setMaintenanceLogs(INITIAL_MAINTENANCE_LOGS);
  }, []);

  // Save to localStorage on state change (after mount)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const dataToSave = {
      inventory,
      borrowings,
      facilities,
      rooms,
      eventSetups,
      transports,
      maintenanceLogs,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  }, [inventory, borrowings, facilities, rooms, eventSetups, transports, maintenanceLogs]);

  // Sync with Supabase if client is active
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;

    // Async sync remote data if available
    async function syncRemote() {
      try {
        const { data: invData } = await client!.from('inventory').select('*');
        if (invData && invData.length > 0) {
          // Format remote inventory
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

    // Push to Supabase if connected
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

    // Decrease available qty if matched with inventory
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
        // Return available Qty in inventory if tied
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

        // If item returned damaged/lost, add automatically to maintenance logs!
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
    const client = getSupabaseClient();
    if (client) {
      client.from('borrowings').delete().eq('id', id).then();
    }
  };

  // Posko Handlers
  const updateFacilityStatus = (id: string, status: PoskoFacility['status'], details: string, picName: string) => {
    const today = new Date().toISOString().split('T')[0];
    setFacilities(prev => prev.map(f => f.id === id ? { ...f, status, details, lastChecked: today, picName } : f));
  };

  const updateRoomLayout = (updatedRoom: PoskoRoomLayout) => {
    setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
  };

  const addRoomLayout = (room: Omit<PoskoRoomLayout, 'id'>) => {
    const newRoom: PoskoRoomLayout = {
      ...room,
      id: `room-${Date.now()}`,
    };
    setRooms(prev => [...prev, newRoom]);
  };

  // Event Handlers
  const addEventSetup = (evt: Omit<EventSetup, 'id'>) => {
    const newEvt: EventSetup = {
      ...evt,
      id: `evt-${Date.now()}`,
    };
    setEventSetups(prev => [newEvt, ...prev]);
  };

  const updateEventStatus = (id: string, status: EventSetup['setupStatus']) => {
    setEventSetups(prev => prev.map(e => e.id === id ? { ...e, setupStatus: status } : e));
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
  };

  // Transport Handlers
  const addTransportRecord = (trp: Omit<TransportRecord, 'id'>) => {
    const newTrp: TransportRecord = {
      ...trp,
      id: `trp-${Date.now()}`,
    };
    setTransports(prev => [newTrp, ...prev]);
  };

  const updateTransportStatus = (id: string, status: TransportRecord['status']) => {
    setTransports(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const deleteTransportRecord = (id: string) => {
    setTransports(prev => prev.filter(t => t.id !== id));
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
  };

  const updateMaintenanceStatus = (id: string, status: MaintenanceLog['status'], resolutionNotes?: string) => {
    setMaintenanceLogs(prev => prev.map(m => m.id === id ? {
      ...m,
      status,
      resolutionNotes: resolutionNotes || m.resolutionNotes,
    } : m));
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
            return true;
          }
        }
      } catch (e) {
        console.error('Supabase test connection failed:', e);
      }
    }
    setSupabaseConfigState({ ...newConfig, isConnected: false });
    saveSupabaseConfig({ ...newConfig, isConnected: false });
    return false;
  };

  const resetToSampleData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setInventory(INITIAL_INVENTORY);
    setBorrowings(INITIAL_BORROWINGS);
    setFacilities(INITIAL_POSKO_FACILITIES);
    setRooms(INITIAL_ROOM_LAYOUTS);
    setEventSetups(INITIAL_EVENT_SETUPS);
    setTransports(INITIAL_TRANSPORTS);
    setMaintenanceLogs(INITIAL_MAINTENANCE_LOGS);
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
  };

  return (
    <PerkabContext.Provider
      value={{
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
