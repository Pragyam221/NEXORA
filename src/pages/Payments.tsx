import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { MetricCard } from '../components/cards/MetricCard';
import { RecordPaymentModal } from '../components/forms/RecordPaymentModal';
import { 
  CreditCard, Wallet, Clock, AlertTriangle, AlertCircle, 
  Download, Search, Plus, ChevronLeft, ChevronRight, 
  ArrowUpDown, Trash2, Eye, ExternalLink, RotateCcw, ShieldCheck
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import { formatDateCustom } from '../utils/dates';
import { exportToCSV } from '../utils/csv';
import { Payment, PaymentStatus, PaymentMethod } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';

const STATUS_COLORS: Record<PaymentStatus, string> = {
  Successful: '#20D6A0',
  Pending: '#F5B942',
  Failed: '#FF647C',
  Refunded: '#8E9AAF',
};

const PALETTE = ['#7C5CFC', '#4F8CFF', '#20D6A0', '#F5B942', '#FF647C', '#8E9AAF'];

export const Payments: React.FC = () => {
  const { 
    filteredPayments, 
    kpis, 
    settings, 
    openDetail, 
    deletePayment, 
    updatePaymentStatus, 
    addToast 
  } = useDashboard();

  const [showRecordModal, setShowRecordModal] = useState(false);

  // Table Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [methodFilter, setMethodFilter] = useState<string>('All');

  // Sorting
  const [sortField, setSortField] = useState<keyof Payment>('paymentDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(settings.pageSize || 10);

  // Filtered & Sorted Payments
  const processedPayments = useMemo(() => {
    let result = [...filteredPayments];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.id.toLowerCase().includes(q) ||
        p.leadName.toLowerCase().includes(q) ||
        p.transactionRef.toLowerCase().includes(q) ||
        p.dealId.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(p => p.status === statusFilter);
    }

    if (methodFilter !== 'All') {
      result = result.filter(p => p.paymentMethod === methodFilter);
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
  }, [filteredPayments, searchQuery, statusFilter, methodFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedPayments.length / pageSize) || 1;
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedPayments.slice(start, start + pageSize);
  }, [processedPayments, currentPage, pageSize]);

  const handleSort = (field: keyof Payment) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    const exportData = processedPayments.map(p => ({
      PaymentID: p.id,
      DealID: p.dealId,
      OrderID: p.orderId || '',
      Client: p.leadName,
      Amount: p.amount,
      Method: p.paymentMethod,
      PaymentDate: p.paymentDate,
      DueDate: p.dueDate,
      Status: p.status,
      TransactionRef: p.transactionRef,
      Notes: p.notes || '',
    }));
    exportToCSV(exportData, `nexora-payments-${new Date().toISOString().slice(0, 10)}.csv`);
    addToast('success', 'CSV Exported', `Exported ${exportData.length} payment records.`);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setMethodFilter('All');
    setCurrentPage(1);
    addToast('info', 'Filters Cleared', 'Payment table filters reset.');
  };

  // Charts
  // 1. Payment status distribution
  const statusChartData = useMemo(() => {
    const counts: Record<string, number> = { Successful: 0, Pending: 0, Failed: 0, Refunded: 0 };
    filteredPayments.forEach(p => {
      if (counts[p.status] !== undefined) counts[p.status]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredPayments]);

  // 2. Collections by payment method
  const methodChartData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredPayments
      .filter(p => p.status === 'Successful')
      .forEach(p => {
        map[p.paymentMethod] = (map[p.paymentMethod] || 0) + p.amount;
      });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredPayments]);

  // 3. Daily collection trend
  const dailyCollectionData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredPayments
      .filter(p => p.status === 'Successful')
      .forEach(p => {
        map[p.paymentDate] = (map[p.paymentDate] || 0) + p.amount;
      });

    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, amount]) => ({ date, amount }));
  }, [filteredPayments]);

  return (
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Payments, Invoicing & Cash Collections</h1>
          <p className="text-xs text-text-secondary mt-1">
            Reconciled collections across UPI, RTGS/NEFT, corporate credit cards, and aging invoices
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
            onClick={() => setShowRecordModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-status-success hover:bg-status-success/90 transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Auditing Disclosure Banner */}
      <div className="bg-navy-900/80 border border-navy-750 p-4 rounded-2xl flex items-start space-x-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-status-success flex-shrink-0 mt-0.5" />
        <div className="text-text-secondary leading-relaxed">
          <strong className="text-text-primary font-semibold block mb-0.5">Audited Cash Realization Convention</strong>
          Only payments with verified <strong>Successful</strong> status count towards collected revenue. Pending invoices represent receivables awaiting clearance, while refunded payments are accounted separately and not double counted.
        </div>
      </div>

      {/* KPI Cards (5 metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Transactions"
          value={kpis.totalPayments.currentValue}
          comparison={kpis.totalPayments}
          icon={CreditCard}
          iconColor="text-accent-purple"
          tooltip="Total payment records logged in period"
        />
        <MetricCard
          title="Collected Revenue"
          value={formatINR(kpis.collectedAmount.currentValue, true)}
          comparison={kpis.collectedAmount}
          icon={Wallet}
          iconColor="text-status-success"
          tooltip="Total successfully settled collections"
        />
        <MetricCard
          title="Pending Receivables"
          value={formatINR(kpis.pendingAmount.currentValue, true)}
          comparison={kpis.pendingAmount}
          icon={Clock}
          iconColor="text-status-warning"
          tooltip="Invoices currently awaiting client clearance"
        />
        <MetricCard
          title="Overdue Balance"
          value={formatINR(kpis.overdueAmount.currentValue, true)}
          comparison={kpis.overdueAmount}
          icon={AlertCircle}
          iconColor="text-status-danger"
          tooltip="Pending payments that have passed their contractual due date"
        />
        <MetricCard
          title="Failed Attempts"
          value={kpis.failedPaymentsCount.currentValue}
          comparison={kpis.failedPaymentsCount}
          icon={AlertTriangle}
          iconColor="text-status-danger"
          tooltip="Transactions that failed due to bank timeouts or card limits"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Collection Trend */}
        <div className="lg:col-span-2 bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <h2 className="text-sm font-bold text-text-primary mb-1">Daily Realized Cash Inflow (₹)</h2>
          <p className="text-xs text-text-secondary mb-4">Confirmed successful receipts over time</p>
          <div className="h-64 w-full">
            {dailyCollectionData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-text-muted">No collections recorded in selected dates</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyCollectionData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#20D6A0" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#20D6A0" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2640" />
                  <XAxis dataKey="date" stroke="#616E8E" fontSize={10} tickFormatter={(d) => formatDateCustom(d, 'DD/MM/YYYY')} />
                  <YAxis stroke="#616E8E" fontSize={10} tickFormatter={(v) => formatINR(v, true)} />
                  <Tooltip formatter={(val: any) => [formatINR(Number(val)), 'Collected Cash']} />
                  <Area type="monotone" dataKey="amount" stroke="#20D6A0" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCash)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Collections by Payment Method */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <h2 className="text-sm font-bold text-text-primary mb-1">Channel Contribution</h2>
          <p className="text-xs text-text-secondary mb-4">Realized cash by payment instrument</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={methodChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {methodChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [formatINR(Number(val)), 'Total']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2">
            {methodChartData.map((m, idx) => (
              <div key={m.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PALETTE[idx % PALETTE.length] }} />
                  <span className="text-text-secondary truncate">{m.name}</span>
                </div>
                <span className="font-semibold text-text-primary font-mono">{formatINR(m.value, true)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payments Table */}
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
                placeholder="Search payment ID, ref, client..."
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
              <option value="Successful">Successful</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
            >
              <option value="All">All Payment Channels</option>
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
              <option value="UPI">UPI</option>
              <option value="Credit/Debit Card">Credit/Debit Card</option>
              <option value="Cash">Cash</option>
              <option value="Other">Other</option>
            </select>

            {(searchQuery || statusFilter !== 'All' || methodFilter !== 'All') && (
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
            <span>Showing <strong className="text-text-primary">{processedPayments.length}</strong> payments</span>
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
                    <span>Payment ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Linked Deal / Order</th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('leadName')}>
                  <div className="flex items-center space-x-1">
                    <span>Client Customer</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary text-right" onClick={() => handleSort('amount')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('paymentMethod')}>
                  <div className="flex items-center space-x-1">
                    <span>Channel</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('paymentDate')}>
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('status')}>
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Transaction Reference</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-text-muted">
                    No payment transactions match the active criteria.
                  </td>
                </tr>
              ) : (
                paginatedPayments.map(p => (
                  <tr key={p.id} className="hover:bg-navy-850/60 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-semibold text-accent-purple">
                      <button
                        onClick={() => openDetail('payment', p.id)}
                        className="hover:underline"
                      >
                        {p.id}
                      </button>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <button
                        onClick={() => openDetail('deal', p.dealId)}
                        className="text-accent-blue hover:underline block"
                      >
                        {p.dealId}
                      </button>
                      {p.orderId && (
                        <button
                          onClick={() => openDetail('order', p.orderId!)}
                          className="text-[10px] text-text-muted hover:underline block"
                        >
                          {p.orderId}
                        </button>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => openDetail('lead', p.leadId)}
                        className="font-semibold text-text-primary hover:text-accent-blue block text-left"
                      >
                        {p.leadName}
                      </button>
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-bold text-text-primary">
                      {formatINR(p.amount)}
                    </td>

                    <td className="py-3.5 px-3 text-text-secondary">
                      {p.paymentMethod}
                    </td>

                    <td className="py-3.5 px-3 text-text-muted font-mono text-[11px]">
                      {formatDateCustom(p.paymentDate, settings.dateFormat)}
                    </td>

                    <td className="py-3.5 px-3">
                      <select
                        value={p.status}
                        onChange={(e) => updatePaymentStatus(p.id, e.target.value as PaymentStatus)}
                        className="text-[11px] font-semibold rounded-lg px-2 py-1 bg-navy-800 border border-navy-750 focus:outline-none"
                        style={{ color: STATUS_COLORS[p.status] }}
                      >
                        <option value="Successful">Successful</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-text-muted text-[11px] max-w-[160px] truncate" title={p.transactionRef}>
                      {p.transactionRef}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => openDetail('payment', p.id)}
                          className="p-1 rounded-lg text-text-muted hover:text-accent-purple hover:bg-navy-800 transition-colors"
                          title="View Payment Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove payment record ${p.id}?`)) {
                              deletePayment(p.id);
                            }
                          }}
                          className="p-1 rounded-lg text-text-muted hover:text-status-danger hover:bg-navy-800 transition-colors"
                          title="Delete Payment"
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

      <RecordPaymentModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
      />
    </div>
  );
};
