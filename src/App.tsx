import React, { useState } from 'react';
import { PerkabProvider, usePerkab } from './context/PerkabContext';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { BorrowingView } from './components/BorrowingView';
import { PoskoView } from './components/PoskoView';
import { EventLogisticsView } from './components/EventLogisticsView';
import { TransportView } from './components/TransportView';
import { MaintenanceView } from './components/MaintenanceView';
import { UserManagementView } from './components/UserManagementView';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer } from './components/ToastContainer';
import { ConfirmModal } from './components/ConfirmModal';
import { PersonalLogisticsView } from './components/PersonalLogisticsView';
import { PublicLandingPage } from './components/PublicLandingPage';

const GlobalOverlay: React.FC = () => {
  const { toasts, removeToast, confirmOptions, closeConfirm } = usePerkab();
  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <ConfirmModal options={confirmOptions} onClose={closeConfirm} />
    </>
  );
};

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab]       = useState<TabType>('dashboard');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const {
    currentUser,
    inventory,
    borrowings,
    eventSetups,
    maintenanceLogs,
  } = usePerkab();

  // Pre-login: show public landing page + login modal
  if (!currentUser) {
    return (
      <>
        <PublicLandingPage onLoginClick={() => setShowLoginModal(true)} />
        {showLoginModal && (
          <LoginScreen asModal onClose={() => setShowLoginModal(false)} />
        )}
        <GlobalOverlay />
      </>
    );
  }

  const activeBorrowingsCount = borrowings.filter(b => b.status === 'Dipinjam').length;
  const upcomingEventsCount = eventSetups.filter(e => e.setupStatus !== 'Selesai').length;
  const pendingMaintenanceCount = maintenanceLogs.filter(m => m.status !== 'Selesai Perbaikan').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Header Navbar */}
      <Navbar
        onOpenExport={() => setIsExportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Layout Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          badgeCounts={{
            inventory: inventory.length,
            borrowingsPending: activeBorrowingsCount,
            eventsUpcoming: upcomingEventsCount,
            maintenanceIssues: pendingMaintenanceCount,
          }}
        />

        {/* Content Area */}
        <section className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={setActiveTab}
              onOpenExport={() => setIsExportOpen(true)}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView onOpenExport={() => setIsExportOpen(true)} />
          )}

          {activeTab === 'borrowings' && <BorrowingView />}

          {activeTab === 'posko' && <PoskoView />}

          {activeTab === 'events' && <EventLogisticsView />}

          {activeTab === 'transport' && <TransportView />}

          {activeTab === 'maintenance' && <MaintenanceView />}

          {activeTab === 'users' && <UserManagementView />}

          {activeTab === 'personal-logistics' && <PersonalLogisticsView />}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Perkab System</strong> — Perlengkapan, Akomodasi & Logistik Kelompok KKN 2026
          </div>
          <div className="text-[11px] text-slate-400">
            User Aktif: <strong className="text-emerald-400 font-semibold capitalize">{currentUser.name}</strong> ({currentUser.role})
          </div>
        </div>
      </footer>

      {/* Modals & Global Toast / Confirm Overlays */}
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <GlobalOverlay />
    </div>
  );
};

export function App() {
  return (
    <PerkabProvider>
      <AppContent />
    </PerkabProvider>
  );
}

export default App;
