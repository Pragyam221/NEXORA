import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { MetricCard } from '../components/cards/MetricCard';
import { CreateQuotationModal } from '../components/forms/CreateQuotationModal';
import { 
  FileText, IndianRupee, CheckCircle2, Clock, XCircle, 
  Percent, Download, Search, Plus, ChevronLeft, ChevronRight, 
  ArrowUpDown, Trash2, Eye, ExternalLink, RotateCcw
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import { formatDateCustom } from '../utils/dates';
import { exportToCSV } from '../utils/csv';
import { Quotation, QuotationStatus } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

const STATUS_COLORS: Record<QuotationStatus, string> = {
  Draft: '#8E9AAF',
  Sent: '#4F8CFF',
  Accepted: '#20D6A0',
  Rejected: '#FF647C',
  Expired: '#F5B942',
};

const PALETTE = ['#7C5CFC', '#4F8CFF', '#20D6A0', '#F5B942', '#FF647C', '#8E9AAF'];

export const Quotations: React.FC = () => {
  const { 
    filteredQuotations, 
    kpis, 
    settings, 
    openDetail, 
    deleteQuotation, 
    updateQuotationStatus, 
    addToast 
  } = useDashboard();

  const [showCreateModal, setShowCreateModal] = useState(false);

  // Table Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Sorting
  const [sortField, setSortField] = useState<keyof Quotation>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(settings.pageSize || 10);

  // Filtered & Sorted Quotations
  const processedQuotations = useMemo(() => {
    let result = [...filteredQuotations];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.id.toLowerCase().includes(q) ||
        item.leadName.toLowerCase().includes(q) ||
        item.serviceCategory.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(item => item.status === statusFilter);
    }

    if (categoryFilter !== 'All') {
      result = result.filter(item => item.serviceCategory === categoryFilter);
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
  }, [filteredQuotations, searchQuery, statusFilter, categoryFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedQuotations.length / pageSize) || 1;
  const paginatedQuotations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedQuotations.slice(start, start + pageSize);
  }, [processedQuotations, currentPage, pageSize]);

  const handleSort = (field: keyof Quotation) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    const exportData = processedQuotations.map(q => ({
      ID: q.id,
      LeadID: q.leadId,
      Client: q.leadName,
      Category: q.serviceCategory,
      Amount: q.amount,
      Status: q.status,
      CreatedAt: q.createdAt,
      ExpiryDate: q.expiryDate,
      LinkedDealID: q.linkedDealId || '',
      Terms: q.terms || '',
    }));
    exportToCSV(exportData, `nexora-quotations-${new Date().toISOString().slice(0, 10)}.csv`);
    addToast('success', 'CSV Downloaded', `Exported ${exportData.length} quotations.`);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setCurrentPage(1);
    addToast('info', 'Filters Cleared', 'Quotation table filters restored.');
  };

  // Distinct categories
  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(filteredQuotations.map(q => q.serviceCategory))).sort();
  }, [filteredQuotations]);

  // Charts
  // 1. Quotations by status
  const statusDistData = useMemo(() => {
    const counts: Record<string, number> = { Draft: 0, Sent: 0, Accepted: 0, Rejected: 0, Expired: 0 };
    filteredQuotations.forEach(q => {
      if (counts[q.status] !== undefined) counts[q.status]++;
    });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [filteredQuotations]);

  // 2. Value by Category
  const categoryValueData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredQuotations.forEach(q => {
      map[q.serviceCategory] = (map[q.serviceCategory] || 0) + q.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredQuotations]);

  return (
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Quotation Intelligence & Proposals</h1>
          <p className="text-xs text-text-secondary mt-1">
            Enterprise proposal pricing, turnaround speed, and quote-to-deal conversion ratios
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
            <span>Create Quotation</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (6 metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total Quotations"
          value={kpis.totalQuotations.currentValue}
          comparison={kpis.totalQuotations}
          icon={FileText}
          iconColor="text-accent-purple"
          tooltip="Total commercial proposals logged in period"
        />
        <MetricCard
          title="Total Quoted Value"
          value={formatINR(kpis.totalQuotedValue.currentValue, true)}
          comparison={kpis.totalQuotedValue}
          icon={IndianRupee}
          iconColor="text-accent-blue"
          tooltip="Cumulative monetary value of all quotations in scope"
        />
        <MetricCard
          title="Accepted Quotes"
          value={kpis.acceptedQuotations.currentValue}
          comparison={kpis.acceptedQuotations}
          icon={CheckCircle2}
          iconColor="text-status-success"
          tooltip="Quotations officially accepted by enterprise clients"
        />
        <MetricCard
          title="Pending Quotes"
          value={kpis.pendingQuotations.currentValue}
          comparison={kpis.pendingQuotations}
          icon={Clock}
          iconColor="text-status-warning"
          tooltip="Quotations currently in Draft or Sent awaiting client review"
        />
        <MetricCard
          title="Rejected / Expired"
          value={kpis.rejectedQuotations.currentValue}
          comparison={kpis.rejectedQuotations}
          icon={XCircle}
          iconColor="text-status-danger"
          tooltip="Proposals rejected by customer or past validity date"
        />
        <MetricCard
          title="Quote Win Rate"
          value={`${kpis.quoteConversionRate.currentValue.toFixed(1)}%`}
          comparison={kpis.quoteConversionRate}
          icon={Percent}
          iconColor="text-status-success"
          tooltip="Accepted quotations divided by eligible (non-draft) proposals"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <h2 className="text-sm font-bold text-text-primary mb-1">Quotation Status Breakdown</h2>
          <p className="text-xs text-text-secondary mb-4">Volume split by client response status</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusDistData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2640" />
                <XAxis dataKey="status" stroke="#616E8E" fontSize={11} />
                <YAxis stroke="#616E8E" fontSize={11} allowDecimals={false} />
                <Tooltip formatter={(val: any) => [val, 'Quotations']} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {statusDistData.map(entry => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status as QuotationStatus] || '#7C5CFC'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quoted Value by Category */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <h2 className="text-sm font-bold text-text-primary mb-1">Quoted Pipeline Value by Practice</h2>
          <p className="text-xs text-text-secondary mb-4">Monetary volume by service discipline</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={categoryValueData} 
                layout="vertical"
                margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2640" />
                <XAxis type="number" stroke="#616E8E" fontSize={10} tickFormatter={(v) => formatINR(v, true)} />
                <YAxis dataKey="name" type="category" stroke="#616E8E" fontSize={9} width={90} />
                <Tooltip formatter={(val: any) => [formatINR(Number(val)), 'Quoted Value']} />
                <Bar dataKey="value" fill="#7C5CFC" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
        {/* Controls */}
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
                placeholder="Search ID, client, category..."
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
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Expired">Expired</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
            >
              <option value="All">All Service Disciplines</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {(searchQuery || statusFilter !== 'All' || categoryFilter !== 'All') && (
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
            <span>Showing <strong className="text-text-primary">{processedQuotations.length}</strong> quotations</span>
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
                    <span>Quote ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('leadName')}>
                  <div className="flex items-center space-x-1">
                    <span>Customer Lead</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('serviceCategory')}>
                  <div className="flex items-center space-x-1">
                    <span>Service Practice</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary text-right" onClick={() => handleSort('amount')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Quoted Amount</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('status')}>
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center space-x-1">
                    <span>Created Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('expiryDate')}>
                  <div className="flex items-center space-x-1">
                    <span>Expiry Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Linked Deal</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {paginatedQuotations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-text-muted">
                    No quotations match the active criteria.
                  </td>
                </tr>
              ) : (
                paginatedQuotations.map(quote => (
                  <tr key={quote.id} className="hover:bg-navy-850/60 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-semibold text-accent-purple">
                      <button
                        onClick={() => openDetail('quotation', quote.id)}
                        className="hover:underline"
                      >
                        {quote.id}
                      </button>
                    </td>

                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => openDetail('lead', quote.leadId)}
                        className="font-semibold text-text-primary hover:text-accent-blue text-left block"
                      >
                        {quote.leadName}
                      </button>
                      <span className="text-[10px] text-text-muted font-mono">{quote.leadId}</span>
                    </td>

                    <td className="py-3.5 px-3 text-text-secondary">
                      {quote.serviceCategory}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-bold text-text-primary">
                      {formatINR(quote.amount)}
                    </td>

                    <td className="py-3.5 px-3">
                      <select
                        value={quote.status}
                        onChange={(e) => updateQuotationStatus(quote.id, e.target.value as QuotationStatus)}
                        className="text-[11px] font-semibold rounded-lg px-2 py-1 bg-navy-800 border border-navy-750 focus:outline-none"
                        style={{ color: STATUS_COLORS[quote.status] }}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Expired">Expired</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-3 text-text-muted font-mono text-[11px]">
                      {formatDateCustom(quote.createdAt, settings.dateFormat)}
                    </td>

                    <td className="py-3.5 px-3 text-text-muted font-mono text-[11px]">
                      {formatDateCustom(quote.expiryDate, settings.dateFormat)}
                    </td>

                    <td className="py-3.5 px-3">
                      {quote.linkedDealId ? (
                        <button
                          onClick={() => openDetail('deal', quote.linkedDealId!)}
                          className="font-mono text-accent-blue hover:underline flex items-center space-x-1"
                        >
                          <span>{quote.linkedDealId}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      ) : (
                        <span className="text-text-muted text-[11px]">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => openDetail('quotation', quote.id)}
                          className="p-1 rounded-lg text-text-muted hover:text-accent-purple hover:bg-navy-800 transition-colors"
                          title="View Quotation Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete quotation ${quote.id}?`)) {
                              deleteQuotation(quote.id);
                            }
                          }}
                          className="p-1 rounded-lg text-text-muted hover:text-status-danger hover:bg-navy-800 transition-colors"
                          title="Delete Quotation"
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

      <CreateQuotationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};
