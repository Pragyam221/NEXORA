import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { MetricCard } from '../components/cards/MetricCard';
import { CreateOrderModal } from '../components/forms/CreateOrderModal';
import { 
  Package, Clock, RefreshCw, CheckCircle2, XCircle, 
  Download, Search, Plus, ChevronLeft, ChevronRight, 
  ArrowUpDown, Trash2, Eye, ExternalLink, RotateCcw
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import { formatDateCustom } from '../utils/dates';
import { exportToCSV } from '../utils/csv';
import { Order, OrderStatus } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, PieChart, Pie, Cell 
} from 'recharts';

const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending: '#F5B942',
  'In Progress': '#4F8CFF',
  Completed: '#20D6A0',
  Cancelled: '#FF647C',
};

export const Orders: React.FC = () => {
  const { 
    filteredOrders, 
    kpis, 
    settings, 
    openDetail, 
    deleteOrder, 
    updateOrderStatus, 
    updateOrderProgress, 
    addToast 
  } = useDashboard();

  const [showCreateModal, setShowCreateModal] = useState(false);

  // Table Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [serviceFilter, setServiceFilter] = useState<string>('All');

  // Sorting
  const [sortField, setSortField] = useState<keyof Order>('startDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(settings.pageSize || 10);

  // Filtered & Sorted Orders
  const processedOrders = useMemo(() => {
    let result = [...filteredOrders];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.leadName.toLowerCase().includes(q) ||
        o.dealId.toLowerCase().includes(q) ||
        o.serviceCategory.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(o => o.status === statusFilter);
    }

    if (serviceFilter !== 'All') {
      result = result.filter(o => o.serviceCategory === serviceFilter);
    }

    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal! < bVal!) return sortDirection === 'asc' ? -1 : 1;
      if (aVal! > bVal!) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [filteredOrders, searchQuery, statusFilter, serviceFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedOrders.slice(start, start + pageSize);
  }, [processedOrders, currentPage, pageSize]);

  const handleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    const exportData = processedOrders.map(o => ({
      OrderID: o.id,
      DealID: o.dealId,
      Client: o.leadName,
      Service: o.serviceCategory,
      Amount: o.orderAmount,
      Status: o.status,
      ProgressPct: o.progress,
      StartDate: o.startDate,
      DueDate: o.dueDate,
      CompletionDate: o.completionDate || '',
      Notes: o.deliveryNotes || '',
    }));
    exportToCSV(exportData, `nexora-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    addToast('success', 'CSV Exported', `Exported ${exportData.length} client orders.`);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setServiceFilter('All');
    setCurrentPage(1);
    addToast('info', 'Filters Cleared', 'Order table filters reset.');
  };

  const uniqueServices = useMemo(() => {
    return Array.from(new Set(filteredOrders.map(o => o.serviceCategory))).sort();
  }, [filteredOrders]);

  // Charts
  // 1. Orders by status
  const orderStatusChartData = useMemo(() => {
    const counts: Record<string, number> = { Pending: 0, 'In Progress': 0, Completed: 0, Cancelled: 0 };
    filteredOrders.forEach(o => {
      if (counts[o.status] !== undefined) counts[o.status]++;
    });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [filteredOrders]);

  // 2. Orders by service
  const ordersByServiceData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredOrders.forEach(o => {
      map[o.serviceCategory] = (map[o.serviceCategory] || 0) + 1;
    });
    return Object.entries(map).map(([service, count]) => ({ service, count }));
  }, [filteredOrders]);

  return (
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Fulfillment Orders & Delivery Operations</h1>
          <p className="text-xs text-text-secondary mt-1">
            Tracking execution milestones, progress velocity, and delivery SLA compliance
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-navy-900 hover:bg-navy-850 text-text-primary border border-navy-750 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-accent-purple" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-accent-purple hover:bg-accent-purpleHover transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (5 metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Orders"
          value={kpis.totalOrders.currentValue}
          comparison={kpis.totalOrders}
          icon={Package}
          iconColor="text-accent-purple"
          tooltip="Total client delivery work orders in period"
        />
        <MetricCard
          title="In Progress"
          value={kpis.inProgressOrders.currentValue}
          comparison={kpis.inProgressOrders}
          icon={RefreshCw}
          iconColor="text-status-info"
          tooltip="Orders actively under engineering execution"
        />
        <MetricCard
          title="Completed Orders"
          value={kpis.completedOrders.currentValue}
          comparison={kpis.completedOrders}
          icon={CheckCircle2}
          iconColor="text-status-success"
          tooltip="Orders verified and delivered at 100% completion"
        />
        <MetricCard
          title="Pending Kickoff"
          value={kpis.pendingOrders.currentValue}
          comparison={kpis.pendingOrders}
          icon={Clock}
          iconColor="text-status-warning"
          tooltip="Orders approved awaiting resource onboarding or API credentials"
        />
        <MetricCard
          title="Cancelled Orders"
          value={kpis.cancelledOrders.currentValue}
          comparison={kpis.cancelledOrders}
          icon={XCircle}
          iconColor="text-status-danger"
          tooltip="Work orders cancelled or scope retracted"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <h2 className="text-sm font-bold text-text-primary mb-1">Operational Order Distribution</h2>
          <p className="text-xs text-text-secondary mb-4">Volume breakdown across completion states</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderStatusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2640" />
                <XAxis dataKey="status" stroke="#616E8E" fontSize={11} />
                <YAxis stroke="#616E8E" fontSize={11} allowDecimals={false} />
                <Tooltip formatter={(val: any) => [val, 'Orders']} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {orderStatusChartData.map(entry => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status as OrderStatus] || '#7C5CFC'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by Service */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <h2 className="text-sm font-bold text-text-primary mb-1">Delivery Volume by Practice</h2>
          <p className="text-xs text-text-secondary mb-4">Work orders distributed by discipline</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={ordersByServiceData} 
                layout="vertical"
                margin={{ top: 10, right: 20, left: 30, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2640" />
                <XAxis type="number" stroke="#616E8E" fontSize={10} allowDecimals={false} />
                <YAxis dataKey="service" type="category" stroke="#616E8E" fontSize={9} width={90} />
                <Tooltip formatter={(val: any) => [val, 'Orders']} />
                <Bar dataKey="count" fill="#4F8CFF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
        {/* Table Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-navy-800">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search Order ID, Deal ID, client..."
                className="w-full bg-navy-850 text-text-primary placeholder:text-text-muted text-xs pl-8 pr-3 py-2 rounded-xl border border-navy-750 focus:outline-none focus:border-accent-purple"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
            >
              <option value="All">All Practices</option>
              {uniqueServices.map(srv => (
                <option key={srv} value={srv}>{srv}</option>
              ))}
            </select>

            {(searchQuery || statusFilter !== 'All' || serviceFilter !== 'All') && (
              <button
                onClick={handleClearFilters}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs text-text-muted hover:text-text-primary hover:bg-navy-850 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3 text-xs text-text-secondary">
            <span>Showing <strong className="text-text-primary">{processedOrders.length}</strong> orders</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-navy-850 text-text-primary border border-navy-750 rounded-lg px-2 py-1 text-xs focus:outline-none"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-navy-800 text-text-muted uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('id')}>
                  <div className="flex items-center space-x-1">
                    <span>Order ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Linked Deal</th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('leadName')}>
                  <div className="flex items-center space-x-1">
                    <span>Client Customer</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('serviceCategory')}>
                  <div className="flex items-center space-x-1">
                    <span>Service Practice</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary text-right" onClick={() => handleSort('orderAmount')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Order Amount</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('status')}>
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 w-32 cursor-pointer hover:text-text-primary" onClick={() => handleSort('progress')}>
                  <div className="flex items-center space-x-1">
                    <span>Progress</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary text-right" onClick={() => handleSort('dueDate')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Target Due</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-text-muted">
                    No orders match the current criteria.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map(order => (
                  <tr key={order.id} className="hover:bg-navy-850/60 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-semibold text-status-info">
                      <button
                        onClick={() => openDetail('order', order.id)}
                        className="hover:underline"
                      >
                        {order.id}
                      </button>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <button
                        onClick={() => openDetail('deal', order.dealId)}
                        className="text-accent-blue hover:underline flex items-center space-x-1"
                      >
                        <span>{order.dealId}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </td>

                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => openDetail('lead', order.leadId)}
                        className="font-semibold text-text-primary hover:text-accent-blue block text-left"
                      >
                        {order.leadName}
                      </button>
                    </td>

                    <td className="py-3.5 px-3 text-text-secondary">
                      {order.serviceCategory}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-bold text-text-primary">
                      {formatINR(order.orderAmount)}
                    </td>

                    <td className="py-3.5 px-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="text-[11px] font-semibold rounded-lg px-2 py-1 bg-navy-800 border border-navy-750 focus:outline-none"
                        style={{ color: STATUS_COLORS[order.status] }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-text-muted">Progress</span>
                          <span className="font-bold text-text-primary">{order.progress}%</span>
                        </div>
                        <div className="w-full bg-navy-950 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full ${
                              order.status === 'Completed' ? 'bg-status-success' :
                              order.status === 'Cancelled' ? 'bg-status-danger' : 'bg-status-info'
                            }`}
                            style={{ width: `${order.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right text-text-muted font-mono text-[11px]">
                      {formatDateCustom(order.dueDate, settings.dateFormat)}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => openDetail('order', order.id)}
                          className="p-1 rounded-lg text-text-muted hover:text-accent-purple hover:bg-navy-800 transition-colors"
                          title="View Order Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove order ${order.id}?`)) {
                              deleteOrder(order.id);
                            }
                          }}
                          className="p-1 rounded-lg text-text-muted hover:text-status-danger hover:bg-navy-800 transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-navy-800 text-xs text-text-secondary">
          <span>
            Page <strong className="text-text-primary">{currentPage}</strong> of <strong className="text-text-primary">{totalPages}</strong>
          </span>

          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1.5 rounded-lg border border-navy-750 bg-navy-850 hover:bg-navy-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs px-2">{currentPage}</span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1.5 rounded-lg border border-navy-750 bg-navy-850 hover:bg-navy-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <CreateOrderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};
