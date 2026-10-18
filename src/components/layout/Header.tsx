import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';
import { DateFilterDropdown } from '../filters/DateFilterDropdown';
import { 
  Search, Bell, RefreshCw, User, ShieldAlert, CheckCheck, 
  Trash2, ExternalLink, Menu, X, ChevronRight, Settings, LogOut, Check
} from 'lucide-react';
import { formatDateTime } from '../../utils/dates';
import { formatINR } from '../../utils/currency';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    globalSearchQuery, 
    setGlobalSearchQuery,
    leads,
    deals,
    quotations,
    orders,
    payments,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    refreshDashboard,
    openDetail,
    addToast,
    resetDemoData,
  } = useDashboard();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshDashboard();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Route title breadcrumb resolution
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') return [{ label: 'Analytics', path: '/' }, { label: 'Overview', path: '/' }];
    if (path === '/leads') return [{ label: 'CRM', path: '/leads' }, { label: 'Lead Analytics', path: '/leads' }];
    if (path === '/quotations') return [{ label: 'Commercial', path: '/quotations' }, { label: 'Quotations', path: '/quotations' }];
    if (path === '/deals') return [{ label: 'Revenue', path: '/deals' }, { label: 'Deals & Revenue', path: '/deals' }];
    if (path === '/orders') return [{ label: 'Operations', path: '/orders' }, { label: 'Orders Fulfillment', path: '/orders' }];
    if (path === '/payments') return [{ label: 'Treasury', path: '/payments' }, { label: 'Payments & Collections', path: '/payments' }];
    if (path === '/reports') return [{ label: 'Intelligence', path: '/reports' }, { label: 'Business Reports', path: '/reports' }];
    if (path === '/settings') return [{ label: 'System', path: '/settings' }, { label: 'Settings & Preferences', path: '/settings' }];
    return [{ label: 'NEXORA', path: '/' }, { label: 'Dashboard', path: '/' }];
  };

  const breadcrumbs = getBreadcrumbs();

  // Search Results
  const matchingLeads = globalSearchQuery.trim()
    ? leads.filter(l => 
        l.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        l.company.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        l.id.toLowerCase().includes(globalSearchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const matchingDeals = globalSearchQuery.trim()
    ? deals.filter(d => 
        d.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        d.leadName.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        d.id.toLowerCase().includes(globalSearchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const matchingQuotations = globalSearchQuery.trim()
    ? quotations.filter(q => 
        q.id.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        q.serviceCategory.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        q.leadName.toLowerCase().includes(globalSearchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-navy-900/90 backdrop-blur-md border-b border-navy-800 sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-navy-800 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="hidden sm:flex items-center space-x-2 text-xs">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.label}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-text-muted" />}
              <span className={idx === breadcrumbs.length - 1 ? 'text-text-primary font-semibold' : 'text-text-secondary'}>
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 relative" ref={searchRef}>
        <div className="relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={globalSearchQuery}
            onChange={(e) => {
              setGlobalSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            placeholder="Search leads, deals, quotations, IDs..."
            className="w-full bg-navy-950/80 text-text-primary placeholder:text-text-muted text-xs pl-9 pr-8 py-2 rounded-xl border border-navy-750 focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-all"
          />
          {globalSearchQuery && (
            <button
              onClick={() => {
                setGlobalSearchQuery('');
                setShowSearchDropdown(false);
              }}
              className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Global Live Search Dropdown */}
        {showSearchDropdown && globalSearchQuery.trim().length > 1 && (
          <div className="absolute left-0 right-0 mt-2 bg-navy-900 border border-navy-750 rounded-2xl shadow-2xl z-50 p-3 max-h-96 overflow-y-auto animate-fade-in text-left">
            <div className="space-y-3">
              {matchingLeads.length === 0 && matchingDeals.length === 0 && matchingQuotations.length === 0 && (
                <p className="text-xs text-text-muted text-center py-4">No matching records found.</p>
              )}

              {matchingLeads.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent-purple px-2 block mb-1">
                    Leads
                  </span>
                  {matchingLeads.map(l => (
                    <div
                      key={l.id}
                      onClick={() => {
                        openDetail('lead', l.id);
                        setShowSearchDropdown(false);
                      }}
                      className="p-2 rounded-lg hover:bg-navy-850 cursor-pointer flex justify-between items-center transition-colors"
                    >
                      <div>
                        <span className="text-xs font-semibold text-text-primary block">{l.company}</span>
                        <span className="text-[11px] text-text-secondary">{l.name} • {l.id}</span>
                      </div>
                      <span className="text-xs font-semibold text-accent-purple">{formatINR(l.estimatedValue)}</span>
                    </div>
                  ))}
                </div>
              )}

              {matchingDeals.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent-blue px-2 block mb-1">
                    Deals
                  </span>
                  {matchingDeals.map(d => (
                    <div
                      key={d.id}
                      onClick={() => {
                        openDetail('deal', d.id);
                        setShowSearchDropdown(false);
                      }}
                      className="p-2 rounded-lg hover:bg-navy-850 cursor-pointer flex justify-between items-center transition-colors"
                    >
                      <div>
                        <span className="text-xs font-semibold text-text-primary block">{d.title}</span>
                        <span className="text-[11px] text-text-secondary">{d.leadName} • {d.id}</span>
                      </div>
                      <span className="text-xs font-semibold text-status-success">{formatINR(d.dealValue)}</span>
                    </div>
                  ))}
                </div>
              )}

              {matchingQuotations.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-status-warning px-2 block mb-1">
                    Quotations
                  </span>
                  {matchingQuotations.map(q => (
                    <div
                      key={q.id}
                      onClick={() => {
                        openDetail('quotation', q.id);
                        setShowSearchDropdown(false);
                      }}
                      className="p-2 rounded-lg hover:bg-navy-850 cursor-pointer flex justify-between items-center transition-colors"
                    >
                      <div>
                        <span className="text-xs font-semibold text-text-primary block">{q.id} - {q.serviceCategory}</span>
                        <span className="text-[11px] text-text-secondary">{q.leadName}</span>
                      </div>
                      <span className="text-xs font-semibold text-text-primary">{formatINR(q.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Actions: Date Filter, Refresh, Notifications, Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Demo Data indicator */}
        <div 
          className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-[11px] font-medium text-accent-purple cursor-default"
          title="This enterprise dashboard operates on realistic in-memory business data."
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse" />
          <span>DEMO DATA</span>
        </div>

        {/* Global Reporting Date Selector */}
        <DateFilterDropdown />

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-navy-850 border border-transparent hover:border-navy-750 transition-all"
          title="Recalculate and refresh dashboard views"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-accent-purple' : ''}`} />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-navy-850 border border-transparent hover:border-navy-750 relative transition-all"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-status-danger ring-2 ring-navy-900" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-navy-900 border border-navy-750 rounded-2xl shadow-2xl z-50 p-4 animate-fade-in text-left">
              <div className="flex items-center justify-between pb-3 border-b border-navy-800">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                    Notifications
                  </h3>
                  {unreadNotifCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-status-danger/20 text-status-danger">
                      {unreadNotifCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="p-1 rounded text-text-muted hover:text-text-primary text-[11px] flex items-center space-x-1 hover:bg-navy-800"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Read all</span>
                  </button>
                  <button
                    onClick={clearNotifications}
                    className="p-1 rounded text-text-muted hover:text-status-danger text-[11px] hover:bg-navy-800"
                    title="Clear all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-navy-800/60 max-h-80 overflow-y-auto my-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-text-muted py-6 text-center">No notifications right now.</p>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        if (notif.link) {
                          navigate(notif.link);
                          setShowNotifications(false);
                        }
                      }}
                      className={`p-3 cursor-pointer rounded-xl transition-colors ${
                        notif.read ? 'opacity-70 hover:bg-navy-850/50' : 'bg-navy-850/80 hover:bg-navy-850 font-medium'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-semibold text-text-primary leading-snug">{notif.title}</h4>
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-accent-purple ml-2 mt-1 flex-shrink-0" />}
                      </div>
                      <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-text-muted mt-2 block font-mono">
                        {formatDateTime(notif.timestamp)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-navy-850 border border-transparent hover:border-navy-750 transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent-purple to-accent-blue flex items-center justify-center text-white font-bold text-xs shadow-md">
              PA
            </div>
            <div className="hidden xl:block text-left">
              <span className="text-xs font-semibold text-text-primary block leading-none">Prgya (Admin)</span>
              <span className="text-[10px] text-text-muted leading-none">Senior Director</span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-navy-900 border border-navy-750 rounded-2xl shadow-2xl z-50 p-2 animate-fade-in text-left">
              <div className="px-3 py-2 border-b border-navy-800">
                <p className="text-xs font-bold text-text-primary">Prgya (Admin)</p>
                <p className="text-[11px] text-text-secondary truncate">admin@nexora.bi.corp</p>
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-status-success/15 text-status-success font-medium">
                  Verified Executive
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs rounded-xl text-text-secondary hover:text-text-primary hover:bg-navy-800 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-accent-purple" />
                  <span>Platform Settings</span>
                </button>
                <button
                  onClick={() => {
                    resetDemoData();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs rounded-xl text-text-secondary hover:text-status-warning hover:bg-navy-800 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-status-warning" />
                  <span>Restore Demo Fixtures</span>
                </button>
              </div>

              <div className="pt-1 border-t border-navy-800">
                <button
                  onClick={() => {
                    addToast('info', 'Demo Session', 'Logged out of demo session. Session refreshed.');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs rounded-xl text-status-danger hover:bg-navy-800 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Demo Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
