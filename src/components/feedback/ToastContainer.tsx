import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useDashboard();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        let Icon = Info;
        let borderClass = 'border-status-info/30 bg-navy-850/95 text-status-info';
        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderClass = 'border-status-success/40 bg-navy-850/95 text-status-success';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-status-warning/40 bg-navy-850/95 text-status-warning';
        } else if (toast.type === 'danger') {
          Icon = AlertCircle;
          borderClass = 'border-status-danger/40 bg-navy-850/95 text-status-danger';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-3.5 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-0 ${borderClass}`}
          >
            <Icon className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1 mr-2 text-left">
              <h4 className="text-sm font-semibold text-text-primary leading-tight">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-text-muted hover:text-text-primary p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
