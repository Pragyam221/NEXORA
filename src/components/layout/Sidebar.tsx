import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';
import { 
  LayoutDashboard, Users, FileText, TrendingUp, 
  Package, CreditCard, BarChart3, Settings, 
  ChevronLeft, ChevronRight, X, Sparkles, Building2
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { filteredLeads, filteredQuotations, filteredDeals, filteredOrders } = useDashboard();

  // Dynamic counter badges
  const newLeadsCount = filteredLeads.filter(l => l.status === 'New').length;
  const pendingQuotesCount = filteredQuotations.filter(q => q.status === 'Sent' || q.status === 'Draft').length;
  const activeDealsCount = filteredDeals.filter(d => d.status === 'Negotiation' || d.status === 'Proposal').length;
  const inProgressOrdersCount = filteredOrders.filter(o => o.status === 'In Progress').length;

  const navItems = [
    {
      label: 'Overview',
      to: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: 'Lead Analytics',
      to: '/leads',
      icon: Users,
      badge: newLeadsCount > 0 ? newLeadsCount : null,
      badgeColor: 'bg-accent-purple/20 text-accent-purple',
    },
    {
      label: 'Quotations',
      to: '/quotations',
      icon: FileText,
      badge: pendingQuotesCount > 0 ? pendingQuotesCount : null,
      badgeColor: 'bg-status-warning/20 text-status-warning',
    },
    {
      label: 'Deals & Revenue',
      to: '/deals',
      icon: TrendingUp,
      badge: activeDealsCount > 0 ? activeDealsCount : null,
      badgeColor: 'bg-accent-blue/20 text-accent-blue',
    },
    {
      label: 'Orders',
      to: '/orders',
      icon: Package,
      badge: inProgressOrdersCount > 0 ? inProgressOrdersCount : null,
      badgeColor: 'bg-status-success/20 text-status-success',
    },
    {
      label: 'Payments',
      to: '/payments',
      icon: CreditCard,
      badge: null,
    },
    {
      label: 'Reports',
      to: '/reports',
      icon: BarChart3,
      badge: null,
    },
    {
      label: 'Settings',
      to: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-navy-900 border-r border-navy-800 text-left select-none">
      {/* Brand Header */}
      <div className={`h-16 flex items-center px-4 border-b border-navy-800 justify-between ${collapsed ? 'justify-center' : ''}`}>
        <NavLink to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-purple via-indigo-500 to-accent-blue flex items-center justify-center text-white font-black shadow-lg shadow-accent-purple/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-white font-sans flex items-center space-x-1">
                <span>NEXORA</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-accent-purple/20 text-accent-purple uppercase tracking-wider ml-1">
                  BI
                </span>
              </span>
              <span className="text-[10px] text-text-muted uppercase tracking-wider -mt-0.5">
                Intelligence Suite
              </span>
            </div>
          )}
        </NavLink>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-navy-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? '•••' : 'Core Business Modules'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-accent-purple/20 to-accent-blue/10 text-white font-semibold border-l-2 border-accent-purple'
                    : 'text-text-secondary hover:text-text-primary hover:bg-navy-850'
                } ${collapsed ? 'justify-center px-2' : 'justify-between'}`
              }
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 transition-colors group-hover:text-accent-purple`} />
                {!collapsed && <span>{item.label}</span>}
              </div>

              {!collapsed && item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-navy-800 text-text-secondary'}`}>
                  {item.badge}
                </span>
              )}

              {/* Collapsed active dot indicator */}
              {collapsed && (
                <span className="sr-only">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Collapse button for desktop */}
      <div className="p-3 border-t border-navy-800 hidden lg:block">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center space-x-2 p-2 rounded-xl text-xs text-text-secondary hover:text-text-primary hover:bg-navy-850 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>

      {/* System info footer */}
      {!collapsed && (
        <div className="px-4 py-3 bg-navy-950/40 border-t border-navy-800/80 text-[11px] text-text-muted flex justify-between items-center">
          <span>Enterprise v1.0</span>
          <span className="flex items-center space-x-1 text-status-success font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
            <span>Operational</span>
          </span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden lg:block sticky top-0 h-screen transition-all duration-300 z-20 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop and Slide-over */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-navy-900 shadow-2xl z-50 animate-slide-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
