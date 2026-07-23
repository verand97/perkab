import * as XLSX from 'xlsx';
import {
  InventoryItem,
  BorrowingRecord,
  PoskoFacility,
  PoskoRoomLayout,
  EventSetup,
  TransportRecord,
  MaintenanceLog,
} from '../types';

export interface PerkabDataExport {
  inventory: InventoryItem[];
  borrowings: BorrowingRecord[];
  facilities: PoskoFacility[];
  rooms: PoskoRoomLayout[];
  eventSetups: EventSetup[];
  transports: TransportRecord[];
  maintenance: MaintenanceLog[];
}

export function exportToExcel(data: PerkabDataExport, filename = 'Recap_Perkab_KKN') {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Inventaris Logistik
  const inventoryRows = data.inventory.map((item, idx) => ({
    'No': idx + 1,
    'Kode Barang': item.code,
    'Nama Barang': item.name,
    'Kategori': item.category,
    'Total Jumlah': item.quantity,
    'Tersedia': item.availableQty,
    'Satuan': item.unit,
    'Kondisi': item.condition,
    'Kepemilikan': item.ownership,
    'Pemilik / Pemberi Pinjaman': item.lenderName || '-',
    'Lokasi Penyimpanan': item.location,
    'Catatan Khusus': item.notes || '-',
  }));
  const wsInventory = XLSX.utils.json_to_sheet(inventoryRows);
  XLSX.utils.book_append_sheet(wb, wsInventory, 'Inventaris Logistik');

  // 2. Sheet Peminjaman & Pengembalian
  const borrowingRows = data.borrowings.map((bor, idx) => ({
    'No': idx + 1,
    'Nama Barang': bor.itemName,
    'Pemberi Pinjaman': bor.lenderName,
    'Kontak HP/WA': bor.lenderPhone,
    'Penanggungjawab (Anggota)': bor.borrowerName,
    'Jumlah Pinjam': bor.quantity,
    'Tanggal Pinjam': bor.borrowDate,
    'Tenggat Pengembalian': bor.dueDate,
    'Tanggal Dikembalikan': bor.returnDate || '-',
    'Biaya Sewa/Deposit (Rp)': bor.depositCost,
    'Status': bor.status,
    'Kondisi Saat Kembali': bor.conditionOnReturn || '-',
    'Catatan': bor.notes || '-',
  }));
  const wsBorrowings = XLSX.utils.json_to_sheet(borrowingRows);
  XLSX.utils.book_append_sheet(wb, wsBorrowings, 'Peminjaman Alat');

  // 3. Sheet Akomodasi Posko
  const facilityRows = data.facilities.map((fac, idx) => ({
    'No': idx + 1,
    'Fasilitas Posko': fac.facilityName,
    'Kategori': fac.category,
    'Status Kelayakan': fac.status,
    'Detail & Kondisi': fac.details,
    'Pengecekan Terakhir': fac.lastChecked,
    'PIC Penanggungjawab': fac.picName,
  }));
  const wsFacilities = XLSX.utils.json_to_sheet(facilityRows);
  XLSX.utils.book_append_sheet(wb, wsFacilities, 'Fasilitas Posko');

  // 4. Sheet Layout Kamar
  const roomRows = data.rooms.map((room, idx) => ({
    'No': idx + 1,
    'Nama Ruangan / Kamar': room.roomName,
    'Kapasitas Orang': room.capacity,
    'Daftar Penghuni': room.occupants.join(', ') || '-',
    'Inventaris Terpasang': room.assignedEquipment.join(', ') || '-',
    'Catatan': room.notes || '-',
  }));
  const wsRooms = XLSX.utils.json_to_sheet(roomRows);
  XLSX.utils.book_append_sheet(wb, wsRooms, 'Layout Posko');

  // 5. Sheet Persiapan Tempat & Proker
  const eventRows = data.eventSetups.map((evt, idx) => ({
    'No': idx + 1,
    'Nama Program Kerja': evt.eventName,
    'Tanggal & Waktu': evt.eventDate,
    'Lokasi Acara': evt.location,
    'PIC Acara': evt.picName,
    'Status Persiapan': evt.setupStatus,
    'Daftar Alat Needed': evt.requiredItems.map(i => `${i.itemName} (${i.qty}) [${i.isReady ? 'SIAP' : 'BELUM'}]`).join('; '),
    'Catatan': evt.notes || '-',
  }));
  const wsEvents = XLSX.utils.json_to_sheet(eventRows);
  XLSX.utils.book_append_sheet(wb, wsEvents, 'Persiapan Proker');

  // 6. Sheet Transportasi
  const transportRows = data.transports.map((trp, idx) => ({
    'No': idx + 1,
    'Nama Kendaraan': trp.vehicleName,
    'Jenis Armada': trp.vehicleType,
    'Pengemudi / PJ': trp.driverName,
    'Tujuan / Keperluan': trp.purpose,
    'Waktu Berangkat': trp.departureDate,
    'Waktu Kembali': trp.returnDate,
    'Muatan Barang/Anggota': trp.cargoDetails,
    'Biaya Bensin/Sewa (Rp)': trp.cost,
    'Status': trp.status,
  }));
  const wsTransports = XLSX.utils.json_to_sheet(transportRows);
  XLSX.utils.book_append_sheet(wb, wsTransports, 'Transportasi');

  // 7. Sheet Pemeliharaan & Kerusakan
  const maintenanceRows = data.maintenance.map((mt, idx) => ({
    'No': idx + 1,
    'Nama Barang': mt.itemName,
    'Pelapor Kerusakan': mt.reportedBy,
    'Tanggal Lapor': mt.dateReported,
    'Deskripsi Kerusakan': mt.damageDescription,
    'Estimasi Biaya (Rp)': mt.estimatedCost,
    'Status Penanganan': mt.status,
    'Catatan Penyelesaian': mt.resolutionNotes || '-',
  }));
  const wsMaintenance = XLSX.utils.json_to_sheet(maintenanceRows);
  XLSX.utils.book_append_sheet(wb, wsMaintenance, 'Laporan Kerusakan');

  // Write file .xlsx
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${filename}_${dateStr}.xlsx`);
}

export function exportToCSV(dataList: Record<string, any>[], moduleName: string) {
  if (!dataList || dataList.length === 0) return;
  const ws = XLSX.utils.json_to_sheet(dataList);
  const csvOutput = XLSX.utils.sheet_to_csv(ws);
  
  const dateStr = new Date().toISOString().split('T')[0];
  const blob = new Blob(['\ufeff' + csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Recap_${moduleName}_Perkab_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
