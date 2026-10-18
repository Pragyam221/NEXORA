import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/feedback/ToastContainer';
import { GlobalDetailModal } from './components/dialogs/GlobalDetailModal';

// Pages
import { Overview } from './pages/Overview';
import { LeadAnalytics } from './pages/LeadAnalytics';
import { Quotations } from './pages/Quotations';
import { DealsRevenue } from './pages/DealsRevenue';
import { Orders } from './pages/Orders';
import { Payments } from './pages/Payments';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { settings } = useDashboard();

  return (
    <div className={`min-h-screen flex bg-navy-950 text-text-primary ${settings.density === 'compact' ? 'text-xs' : 'text-sm'}`}>
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Header */}
        <Header onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />

        {/* Page View Container */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/leads" element={<LeadAnalytics />} />
            <Route path="/quotations" element={<Quotations />} />
            <Route path="/deals" element={<DealsRevenue />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Interactive Overlays */}
      <ToastContainer />
      <GlobalDetailModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <DashboardProvider>
        <AppLayout />
      </DashboardProvider>
    </BrowserRouter>
  );
};

export default App;
