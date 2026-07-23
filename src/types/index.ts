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
  imageUrl?: string;
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
  imageUrl?: string;
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
  imageUrl?: string;
  created_at?: string;
}

export interface PoskoRoomLayout {
  id: string;
  roomName: string;
  capacity: number;
  occupants: string[];
  assignedEquipment: string[];
  imageUrl?: string;
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
  imageUrl?: string;
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
  imageUrl?: string;
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
  imageUrl?: string;
  created_at?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

export type UserRole = 'Admin' | 'PJ Perkab' | 'Anggota';

export interface UserAccount {
  id: string;
  name: string;
  nim: string;
  role: UserRole;
  position?: string;
  avatarUrl?: string;
  created_at?: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
}

export type ThemeMode = 'dark' | 'light';
