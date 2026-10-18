import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { ConfirmationModal } from '../components/dialogs/ConfirmationModal';
import { 
  Settings as SettingsIcon, Moon, Sun, Layout, IndianRupee, 
  Calendar, Rows, RotateCcw, ShieldCheck, Check, Sparkles, HardDrive
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { settings, updateSettings, resetDemoData, addToast } = useDashboard();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearPrefConfirm, setShowClearPrefConfirm] = useState(false);

  const handleClearPreferences = () => {
    updateSettings({
      theme: 'dark',
      density: 'comfortable',
      dateFormat: 'DD/MM/YYYY',
      pageSize: 10,
    });
    setShowClearPrefConfirm(false);
    addToast('info', 'Preferences Cleared', 'UI preferences reset to defaults.');
  };

  const handleResetAllData = () => {
    resetDemoData();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6 text-left pb-12 animate-fade-in max-w-4xl">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Platform Settings & Preferences</h1>
        <p className="text-xs text-text-secondary mt-1">
          Customize enterprise dark mode styling, date formatting standards, and demo data state
        </p>
      </div>

      {/* LocalStorage Notice */}
      <div className="bg-navy-900/80 border border-navy-750 p-4 rounded-2xl flex items-start space-x-3 text-xs">
        <HardDrive className="w-5 h-5 text-accent-purple flex-shrink-0 mt-0.5" />
        <div className="text-text-secondary leading-relaxed">
          <strong className="text-text-primary font-semibold block mb-0.5">Client-Side Persistence Standard</strong>
          All configuration parameters, active filters, and interactive demo additions are maintained in your browser’s secure local storage. No remote database or external authentication is required.
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Appearance & Theme */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-navy-800">
            <Moon className="w-4 h-4 text-accent-purple" />
            <h2 className="text-sm font-bold text-text-primary">Visual Theme & Interface Styling</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => updateSettings({ theme: 'dark' })}
              className={`flex items-start justify-between p-4 rounded-xl border text-left transition-all ${
                settings.theme === 'dark'
                  ? 'bg-accent-purple/10 border-accent-purple text-text-primary'
                  : 'bg-navy-850 border-navy-800 hover:border-navy-700 text-text-secondary'
              }`}
            >
              <div>
                <div className="flex items-center space-x-2">
                  <Moon className="w-4 h-4 text-accent-purple" />
                  <span className="text-xs font-bold text-text-primary">Enterprise Dark Navy (Default)</span>
                </div>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                  Deep navy canvas (#0B1020) with violet (#7C5CFC) and electric blue accents.
                </p>
              </div>
              {settings.theme === 'dark' && <Check className="w-4 h-4 text-accent-purple flex-shrink-0 ml-2" />}
            </button>

            <button
              onClick={() => updateSettings({ theme: 'light' })}
              className={`flex items-start justify-between p-4 rounded-xl border text-left transition-all ${
                settings.theme === 'light'
                  ? 'bg-accent-purple/10 border-accent-purple text-text-primary'
                  : 'bg-navy-850 border-navy-800 hover:border-navy-700 text-text-secondary'
              }`}
            >
              <div>
                <div className="flex items-center space-x-2">
                  <Sun className="w-4 h-4 text-status-warning" />
                  <span className="text-xs font-bold text-text-primary">Modern Light Mode</span>
                </div>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                  High-contrast crisp palette for well-lit workstation environments.
                </p>
              </div>
              {settings.theme === 'light' && <Check className="w-4 h-4 text-accent-purple flex-shrink-0 ml-2" />}
            </button>
          </div>

          {/* Density selection */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-text-secondary block mb-2">Display Density</label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <button
                onClick={() => updateSettings({ density: 'comfortable' })}
                className={`px-4 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                  settings.density === 'comfortable'
                    ? 'bg-accent-purple text-white border-accent-purple font-semibold shadow-md'
                    : 'bg-navy-850 text-text-secondary border-navy-750 hover:bg-navy-800'
                }`}
              >
                Comfortable (Standard)
              </button>
              <button
                onClick={() => updateSettings({ density: 'compact' })}
                className={`px-4 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                  settings.density === 'compact'
                    ? 'bg-accent-purple text-white border-accent-purple font-semibold shadow-md'
                    : 'bg-navy-850 text-text-secondary border-navy-750 hover:bg-navy-800'
                }`}
              >
                Compact (High Density)
              </button>
            </div>
          </div>
        </div>

        {/* Localization & Formatting */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-navy-800">
            <Calendar className="w-4 h-4 text-accent-blue" />
            <h2 className="text-sm font-bold text-text-primary">Localization & Date Standards</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1.5">Currency Format</label>
              <div className="flex items-center space-x-2 bg-navy-850 p-2.5 rounded-xl border border-navy-750">
                <IndianRupee className="w-4 h-4 text-status-success" />
                <span className="text-xs font-bold text-text-primary">INR (₹) Indian Rupee</span>
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">Full Lakhs (L) and Crores (Cr) grouping</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1.5">Date Display Format</label>
              <select
                value={settings.dateFormat}
                onChange={(e) => updateSettings({ dateFormat: e.target.value as any })}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-accent-purple font-mono"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (Indian Standard)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Standard)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (US Format)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1.5">Default Table Page Size</label>
              <select
                value={settings.pageSize}
                onChange={(e) => updateSettings({ pageSize: Number(e.target.value) })}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-accent-purple"
              >
                <option value={10}>10 records / page</option>
                <option value={25}>25 records / page</option>
                <option value={50}>50 records / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management & Demo Reset Actions */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-navy-800">
            <RotateCcw className="w-4 h-4 text-status-warning" />
            <h2 className="text-sm font-bold text-text-primary">Data Management & Factory Restoration</h2>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-navy-850 rounded-xl border border-navy-750 gap-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary">Clear UI Preferences</h3>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Restores default table sizes, date formats, and theme settings without altering data records.
                </p>
              </div>
              <button
                onClick={() => setShowClearPrefConfirm(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-text-primary bg-navy-800 hover:bg-navy-750 border border-navy-700 transition-colors flex-shrink-0"
              >
                Reset Preferences
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-status-danger/5 rounded-xl border border-status-danger/20 gap-3">
              <div>
                <h3 className="text-xs font-bold text-status-danger">Restore Canonical Demo Fixtures</h3>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Resets all Leads, Quotations, Deals, Orders, and Payments back to original baseline fixtures. Custom changes will be cleared.
                </p>
              </div>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-status-danger hover:bg-status-danger/90 transition-colors shadow-lg flex-shrink-0"
              >
                Reset Demo Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showClearPrefConfirm}
        title="Reset UI Preferences?"
        message="This will restore default display density, page sizes, and date formatting options."
        confirmLabel="Reset Preferences"
        variant="warning"
        onConfirm={handleClearPreferences}
        onCancel={() => setShowClearPrefConfirm(false)}
      />

      <ConfirmationModal
        isOpen={showResetConfirm}
        title="Restore Canonical Demo Fixtures?"
        message="Are you sure you want to revert all records to their original starting demo values? Any leads, quotations, deals, or payments created during this session will be replaced."
        confirmLabel="Restore Canonical Data"
        variant="danger"
        onConfirm={handleResetAllData}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
