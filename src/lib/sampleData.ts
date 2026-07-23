import {
  InventoryItem,
  BorrowingRecord,
  PoskoFacility,
  PoskoRoomLayout,
  EventSetup,
  TransportRecord,
  MaintenanceLog,
  UserAccount,
} from '../types';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-admin',
    name: 'muhammad verri andika pratama',
    nim: '231240001452',
    role: 'Admin',
    position: 'Koordinator Utama Perkab (Admin)',
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [];

export const INITIAL_BORROWINGS: BorrowingRecord[] = [];

export const INITIAL_POSKO_FACILITIES: PoskoFacility[] = [];

export const INITIAL_ROOM_LAYOUTS: PoskoRoomLayout[] = [];

export const INITIAL_EVENT_SETUPS: EventSetup[] = [];

export const INITIAL_TRANSPORTS: TransportRecord[] = [];

export const INITIAL_MAINTENANCE_LOGS: MaintenanceLog[] = [];
