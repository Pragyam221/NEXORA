import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDashboard } from '../../context/DashboardContext';
import { Calendar, ChevronDown, Check, RotateCcw, X } from 'lucide-react';
import { formatDateCustom } from '../../utils/dates';
import { DateRangeOption } from '../../types';

export const DateFilterDropdown: React.FC = () => {
  const { 
    dateRangeOption, 
    setDateRangeOption, 
    customRange, 
    setCustomRange, 
    applyCustomRange, 
    resetDateRange,
    currentRange,
    previousRange,
    settings,
    addToast
  } = useDashboard();

  const [isOpen, setIsOpen] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [tempStart, setTempStart] = useState(customRange.startDate);
  const [tempEnd, setTempEnd] = useState(customRange.endDate);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectOption = (opt: DateRangeOption) => {
    if (opt === 'custom') {
      setShowCustomModal(true);
      setIsOpen(false);
    } else {
      setDateRangeOption(opt);
      setIsOpen(false);
      addToast('info', 'Date Range Changed', `Viewing data for ${getLabel(opt)}`);
    }
  };

  const getLabel = (opt: DateRangeOption) => {
    switch (opt) {
      case 'today': return 'Today';
      case 'last7': return 'Last 7 Days';
      case 'last30': return 'Last 30 Days';
      case 'custom': return 'Custom Range';
    }
  };

  const handleApplyCustom = () => {
    if (!tempStart || !tempEnd) {
      addToast('warning', 'Incomplete Range', 'Please select both start and end dates.');
      return;
    }
    if (tempEnd < tempStart) {
      addToast('danger', 'Invalid Date Range', 'End date cannot be earlier than start date.');
      return;
    }
    setCustomRange({ startDate: tempStart, endDate: tempEnd });
    applyCustomRange();
    setShowCustomModal(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-navy-900 hover:bg-navy-850 text-text-primary px-3.5 py-2 rounded-xl border border-navy-750 text-xs font-medium transition-all shadow-sm"
      >
        <Calendar className="w-3.5 h-3.5 text-accent-purple" />
        <span className="font-semibold text-text-primary">{getLabel(dateRangeOption)}:</span>
        <span className="text-text-secondary">
          {formatDateCustom(currentRange.startDate, settings.dateFormat)} – {formatDateCustom(currentRange.endDate, settings.dateFormat)}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-navy-900 border border-navy-750 rounded-2xl shadow-2xl z-40 p-2 animate-fade-in text-left">
          <div className="px-3 py-2 border-b border-navy-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Select Reporting Period
            </span>
          </div>

          <div className="py-1">
            {(['today', 'last7', 'last30', 'custom'] as DateRangeOption[]).map(opt => (
              <button
                key={opt}
                onClick={() => handleSelectOption(opt)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors ${
                  dateRangeOption === opt 
                    ? 'bg-accent-purple/15 text-accent-purple font-semibold' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-navy-800'
                }`}
              >
                <span>{getLabel(opt)}</span>
                {dateRangeOption === opt && <Check className="w-3.5 h-3.5 text-accent-purple" />}
              </button>
            ))}
          </div>

          {/* Quick info on current comparison */}
          <div className="mt-2 pt-2 border-t border-navy-800 px-3 py-2 bg-navy-950/50 rounded-xl text-[11px] space-y-1">
            <span className="text-text-muted block font-medium">Comparison Period:</span>
            <span className="text-text-secondary block font-mono text-[10px]">
              {formatDateCustom(previousRange.startDate, settings.dateFormat)} to {formatDateCustom(previousRange.endDate, settings.dateFormat)}
            </span>
          </div>

          <div className="mt-2 pt-1 border-t border-navy-800">
            <button
              onClick={() => {
                resetDateRange();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-1.5 py-1.5 text-xs text-text-muted hover:text-text-primary hover:bg-navy-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Default (Last 30 Days)</span>
            </button>
          </div>
        </div>
      )}

      {/* Custom Range Dialog portalled directly to document.body to prevent clipping by header containing blocks */}
      {showCustomModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-navy-900 border border-navy-700 rounded-2xl p-6 shadow-2xl space-y-5 text-left relative">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-accent-purple" />
                <h3 className="text-sm font-semibold text-text-primary">Select Custom Date Range</h3>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-navy-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                  className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                  className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
                />
              </div>
            </div>

            <div className="bg-navy-850 p-3.5 rounded-xl border border-navy-800 text-xs text-text-secondary space-y-1">
              <span className="font-semibold text-text-primary block">Comparison Period Logic:</span>
              <p className="text-[11px] leading-relaxed text-text-muted">
                Your selected range will automatically compare against an immediately preceding period of identical duration.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-2 border-t border-navy-800">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-text-primary bg-navy-800 hover:bg-navy-750 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCustom}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-accent-purple hover:bg-accent-purpleHover transition-colors shadow-lg"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
