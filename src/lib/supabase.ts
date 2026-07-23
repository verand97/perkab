import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../types';

const STORAGE_KEY = 'perkab_supabase_config';

export function getStoredSupabaseConfig(): SupabaseConfig {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return {
    url: '',
    anonKey: '',
    isConnected: false,
  };
}

export function saveSupabaseConfig(config: SupabaseConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;
  
  const config = getStoredSupabaseConfig();
  if (config.url && config.anonKey) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey);
      return supabaseInstance;
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return null;
}

export function resetSupabaseClient() {
  supabaseInstance = null;
}

// SQL Generator Script for Supabase Table Initialization
export const SUPABASE_SQL_SCHEMA = `-- SKEMA DATABASE SUPABASE UNTUK PERKAB KKN
-- Jalankan perintah ini di Supabase SQL Editor

-- 1. Tabel Inventaris Logistik
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INT DEFAULT 1,
  available_qty INT DEFAULT 1,
  unit TEXT DEFAULT 'Unit',
  condition TEXT DEFAULT 'Bagus',
  ownership TEXT DEFAULT 'Kelompok',
  lender_name TEXT,
  location TEXT DEFAULT 'Posko',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Peminjaman Alat
CREATE TABLE IF NOT EXISTS borrowings (
  id TEXT PRIMARY KEY,
  item_name TEXT NOT NULL,
  inventory_id TEXT REFERENCES inventory(id) ON DELETE SET NULL,
  lender_name TEXT NOT NULL,
  lender_phone TEXT,
  borrower_name TEXT NOT NULL,
  borrow_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  quantity INT DEFAULT 1,
  deposit_cost NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Dipinjam',
  condition_on_return TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Fasilitas Posko
CREATE TABLE IF NOT EXISTS posko_facilities (
  id TEXT PRIMARY KEY,
  facility_name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'Sangat Baik',
  details TEXT,
  last_checked DATE,
  pic_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Layout Kamar Posko
CREATE TABLE IF NOT EXISTS posko_rooms (
  id TEXT PRIMARY KEY,
  room_name TEXT NOT NULL,
  capacity INT DEFAULT 0,
  occupants TEXT[] DEFAULT '{}',
  assigned_equipment TEXT[] DEFAULT '{}',
  notes TEXT
);

-- 5. Tabel Event Setup Proker
CREATE TABLE IF NOT EXISTS event_setups (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_date TEXT NOT NULL,
  location TEXT NOT NULL,
  pic_name TEXT NOT NULL,
  setup_status TEXT DEFAULT 'Perencanaan',
  required_items JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Transportasi Logistik
CREATE TABLE IF NOT EXISTS transports (
  id TEXT PRIMARY KEY,
  vehicle_name TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  departure_date TEXT NOT NULL,
  return_date TEXT NOT NULL,
  cargo_details TEXT,
  cost NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Jadwal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabel Maintenance & Damage Logs
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id TEXT PRIMARY KEY,
  item_name TEXT NOT NULL,
  reported_by TEXT NOT NULL,
  damage_description TEXT NOT NULL,
  estimated_cost NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Dilaporkan',
  resolution_notes TEXT,
  date_reported DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Allow Anonymous Access for KKN Team
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowings ENABLE ROW LEVEL SECURITY;
ALTER TABLE posko_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE posko_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE transports ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read/Write Inventory" ON inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Borrowings" ON borrowings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Facilities" ON posko_facilities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Rooms" ON posko_rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Events" ON event_setups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Transports" ON transports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Maintenance" ON maintenance_logs FOR ALL USING (true) WITH CHECK (true);
`;
