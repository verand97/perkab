export type InventoryCategory = 'Elektronik' | 'Perkakas' | 'Dapur' | 'Akomodasi' | 'Acara' | 'Lainnya';
export type ItemCondition = 'Bagus' | 'Perlu Perbaikan' | 'Rusak';
export type ItemOwnership = 'Kelompok' | 'Warga Desa' | 'Kampus' | 'Sewa';

export interface InventoryItem {
  id: string;
  name: string;
  code: string;
  category: InventoryCategory;
  quantity: number;
  availableQty: number;
  unit: string;
  condition: ItemCondition;
  ownership: ItemOwnership;
  lenderName?: string;
  location: string;
  notes?: string;
  created_at?: string;
}

export type BorrowingStatus = 'Dipinjam' | 'Dikembalikan' | 'Terlambat';
export type ReturnCondition = 'Bagus' | 'Rusak' | 'Hilang';

export interface BorrowingRecord {
  id: string;
  itemName: string;
  inventoryId?: string;
  lenderName: string;
  lenderPhone: string;
  borrowerName: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  quantity: number;
  depositCost: number;
  status: BorrowingStatus;
  conditionOnReturn?: ReturnCondition;
  notes?: string;
  created_at?: string;
}

export type FacilityCategory = 'Listrik' | 'Air' | 'Kamar Tidur' | 'Dapur' | 'Sanitasi' | 'Sinyal';
export type FacilityStatus = 'Sangat Baik' | 'Perlu Perhatian' | 'Kerusakan';

export interface PoskoFacility {
  id: string;
  facilityName: string;
  category: FacilityCategory;
  status: FacilityStatus;
  details: string;
  lastChecked: string;
  picName: string;
  created_at?: string;
}

export interface PoskoRoomLayout {
  id: string;
  roomName: string;
  capacity: number;
  occupants: string[];
  assignedEquipment: string[];
  notes?: string;
}

export type SetupStatus = 'Perencanaan' | 'Terangkut' | 'Terpasang' | 'Pembongkaran' | 'Selesai';

export interface EventChecklistItem {
  id: string;
  itemName: string;
  qty: number;
  isReady: boolean;
}

export interface EventSetup {
  id: string;
  eventName: string;
  eventDate: string;
  location: string;
  picName: string;
  setupStatus: SetupStatus;
  requiredItems: EventChecklistItem[];
  notes?: string;
  created_at?: string;
}

export type VehicleType = 'Motor' | 'Mobil' | 'Pick-up' | 'Truk' | 'Lainnya';
export type TransportStatus = 'Jadwal' | 'Berjalan' | 'Selesai';

export interface TransportRecord {
  id: string;
  vehicleName: string;
  vehicleType: VehicleType;
  driverName: string;
  purpose: string;
  departureDate: string;
  returnDate: string;
  cargoDetails: string;
  cost: number;
  status: TransportStatus;
  created_at?: string;
}

export type MaintenanceStatus = 'Dilaporkan' | 'Dalam Perbaikan' | 'Selesai Perbaikan' | 'Ganti Rugi';

export interface MaintenanceLog {
  id: string;
  itemName: string;
  reportedBy: string;
  damageDescription: string;
  estimatedCost: number;
  status: MaintenanceStatus;
  resolutionNotes?: string;
  dateReported: string;
  created_at?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}
