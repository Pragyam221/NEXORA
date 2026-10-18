import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { MetricCard } from '../components/cards/MetricCard';
import { CreateDealModal } from '../components/forms/CreateDealModal';
import { 
  TrendingUp, Award, XCircle, Clock, Percent, IndianRupee, 
  Wallet, ShieldCheck, Download, Search, Plus, ChevronLeft, ChevronRight, 
  ArrowUpDown, Trash2, Eye, ExternalLink, RotateCcw, AlertCircle
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import { formatDateCustom } from '../utils/dates';
import { exportToCSV } from '../utils/csv';
import { Deal, DealStatus, DealPriority } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, PieChart, Pie, Cell 
} from 'recharts';

const STATUS_COLORS: Record<DealStatus, string> = {
  New: '#8E9AAF',
  Proposal: '#4F8CFF',
  Negotiation: '#F5B942',
  Won: '#20D6A0',
  Lost: '#FF647C',
};

const PRIORITY_COLORS: Record<DealPriority, string> = {
  High: '#FF647C',
  Medium: '#F5B942',
  Low: '#4F8CFF',
};

const PALETTE = ['#7C5CFC', '#4F8CFF', '#20D6A0', '#F5B942', '#FF647C', '#8E9AAF'];

export const DealsRevenue: React.FC = () => {
  const { 
    filteredDeals, 
    filteredPayments, 
    filteredOrders,
    kpis, 
    settings, 
    openDetail, 
    deleteDeal, 
    updateDealStatus, 
    updateDealPriority, 
    addToast 
  } = useDashboard();

  const [showCreateModal, setShowCreateModal] = useState(false);

  // Table Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [ownerFilter, setOwnerFilter] = useState<string>('All');

  // Sorting
  const [sortField, setSortField] = useState<keyof Deal>('dealValue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(settings.pageSize || 10);

  // Filtered & Sorted Deals
  const processedDeals = useMemo(() => {
    let result = [...filteredDeals];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.id.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.leadName.toLowerCase().includes(q) ||
        d.serviceCategory.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(d => d.status === statusFilter);
    }

    if (priorityFilter !== 'All') {
      result = result.filter(d => d.priority === priorityFilter);
    }

    if (ownerFilter !== 'All') {
      result = result.filter(d => d.owner === ownerFilter);
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
  }, [filteredDeals, searchQuery, statusFilter, priorityFilter, ownerFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedDeals.length / pageSize) || 1;
  const paginatedDeals = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedDeals.slice(start, start + pageSize);
  }, [processedDeals, currentPage, pageSize]);

  const handleSort = (field: keyof Deal) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    const exportData = processedDeals.map(d => ({
      DealID: d.id,
      Client: d.leadName,
      Title: d.title,
      Category: d.serviceCategory,
      DealValue: d.dealValue,
      Status: d.status,
      Priority: d.priority,
      Owner: d.owner,
      ExpectedCloseDate: d.expectedCloseDate,
      ActualCloseDate: d.actualCloseDate || '',
      LinkedQuotationID: d.quotationId || '',
    }));
    exportToCSV(exportData, `nexora-deals-${new Date().toISOString().slice(0, 10)}.csv`);
    addToast('success', 'CSV Downloaded', `Exported ${exportData.length} deals.`);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setOwnerFilter('All');
    setCurrentPage(1);
    addToast('info', 'Filters Cleared', 'Deal table filters reset.');
  };

  const uniqueOwners = useMemo(() => {
    return Array.from(new Set(filteredDeals.map(d => d.owner))).sort();
  }, [filteredDeals]);

  // Charts
  // 1. Deal Value by Status
  const dealValueByStatusData = useMemo(() => {
    const map: Record<string, number> = { New: 0, Proposal: 0, Negotiation: 0, Won: 0, Lost: 0 };
    filteredDeals.forEach(d => {
      if (map[d.status] !== undefined) map[d.status] += d.dealValue;
    });
    return Object.entries(map).map(([status, value]) => ({ status, value }));
  }, [filteredDeals]);

  // 2. Revenue by Deal Owner
  const revenueByOwnerData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredDeals.filter(d => d.status === 'Won').forEach(d => {
      map[d.owner] = (map[d.owner] || 0) + d.dealValue;
    });
    return Object.entries(map).map(([owner, value]) => ({ owner, value }));
  }, [filteredDeals]);

  // 3. Priority distribution
  const priorityDistData = useMemo(() => {
    const counts: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    filteredDeals.forEach(d => {
      if (counts[d.priority] !== undefined) counts[d.priority]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredDeals]);

  return (
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Deals Pipeline & Revenue Intelligence</h1>
          <p className="text-xs text-text-secondary mt-1">
            Contracted deals pipeline, closed-won win rates, and audited cash realization
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
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-accent-blue hover:bg-accent-blueHover transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Create Deal</span>
          </button>
        </div>
      </div>

      {/* Financial Accounting Disclosure Banner */}
      <div className="bg-navy-900/80 border border-navy-750 p-4 rounded-2xl flex items-start space-x-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-accent-blue flex-shrink-0 mt-0.5" />
        <div className="text-text-secondary leading-relaxed">
          <strong className="text-text-primary font-semibold block mb-0.5">Strict Revenue Recognition Standard</strong>
          Total Deal Value represents the cumulative contractual commitments. 
          <strong> Collected Revenue</strong> strictly accounts for confirmed successful payment transactions credited to bank accounts. 
          Lost deals and pending invoices are not counted toward collected revenue.
        </div>
      </div>

      {/* KPI Cards (8 metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Deals"
          value={kpis.totalDeals.currentValue}
          comparison={kpis.totalDeals}
          icon={TrendingUp}
          iconColor="text-accent-purple"
          tooltip="Total deal pipeline opportunities in active date filter"
        />
        <MetricCard
          title="Closed Won Deals"
          value={kpis.wonDeals.currentValue}
          comparison={kpis.wonDeals}
          icon={Award}
          iconColor="text-status-success"
          tooltip="Deals successfully signed and closed"
        />
        <MetricCard
          title="Lost Deals"
          value={kpis.lostDeals.currentValue}
          comparison={kpis.lostDeals}
          icon={XCircle}
          iconColor="text-status-danger"
          tooltip="Deals disqualified or rejected during negotiation"
        />
        <MetricCard
          title="Win Rate"
          value={`${kpis.winRate.currentValue.toFixed(1)}%`}
          comparison={kpis.winRate}
          icon={Percent}
          iconColor="text-status-success"
          tooltip="Won deals divided by total closed deals in period"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Pipeline Deals"
          value={kpis.openDeals.currentValue}
          comparison={kpis.openDeals}
          icon={Clock}
          iconColor="text-accent-blue"
          tooltip="Deals currently under proposal or active pricing negotiations"
        />
        <MetricCard
          title="Total Deal Value"
          value={formatINR(kpis.totalDealValue.currentValue, true)}
          comparison={kpis.totalDealValue}
          icon={IndianRupee}
          iconColor="text-accent-purple"
          tooltip="Total monetary size of all deal records in period"
        />
        <MetricCard
          title="Collected Revenue"
          value={formatINR(kpis.collectedRevenue.currentValue, true)}
          comparison={kpis.collectedRevenue}
          icon={Wallet}
          iconColor="text-status-success"
          tooltip="Real cash collected via successful payments within period"
        />
        <MetricCard
          title="Outstanding Balance"
          value={formatINR(kpis.outstandingBalance.currentValue, true)}
          comparison={kpis.outstandingBalance}
          icon={AlertCircle}
          iconColor="text-status-warning"
          tooltip="Contracted won deal amounts remaining to be settled"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deal Value by Status */}
        <div className="lg:col-span-2 bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <h2 className="text-sm font-bold text-text-primary mb-1">Pipeline Monetary Value by Stage</h2>
          <p className="text-xs text-text-secondary mb-4">Capital allocation across sales stages</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dealValueByStatusData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2640" />
                <XAxis dataKey="status" stroke="#616E8E" fontSize={11} />
                <YAxis stroke="#616E8E" fontSize={10} tickFormatter={(v) => formatINR(v, true)} />
                <Tooltip formatter={(val: any) => [formatINR(Number(val)), 'Total Value']} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {dealValueByStatusData.map(entry => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status as DealStatus] || '#7C5CFC'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <h2 className="text-sm font-bold text-text-primary mb-1">Deal Priority Breakdown</h2>
          <p className="text-xs text-text-secondary mb-4">Urgency distribution of pipeline</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityDistData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  <Cell fill="#FF647C" /> {/* High */}
                  <Cell fill="#F5B942" /> {/* Medium */}
                  <Cell fill="#4F8CFF" /> {/* Low */}
                </Pie>
                <Tooltip formatter={(val: any) => [val, 'Deals']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around text-xs mt-1 pt-2 border-t border-navy-800">
            <span className="text-status-danger font-semibold">High: {priorityDistData.find(d => d.name === 'High')?.value || 0}</span>
            <span className="text-status-warning font-semibold">Med: {priorityDistData.find(d => d.name === 'Medium')?.value || 0}</span>
            <span className="text-accent-blue font-semibold">Low: {priorityDistData.find(d => d.name === 'Low')?.value || 0}</span>
          </div>
        </div>
      </div>

      {/* Deals Table */}
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
                placeholder="Search deal title, client, ID..."
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
              <option value="All">All Stages</option>
              <option value="New">New</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <select
              value={ownerFilter}
              onChange={(e) => {
                setOwnerFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
            >
              <option value="All">All Deal Owners</option>
              {uniqueOwners.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>

            {(searchQuery || statusFilter !== 'All' || priorityFilter !== 'All' || ownerFilter !== 'All') && (
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
            <span>Showing <strong className="text-text-primary">{processedDeals.length}</strong> deals</span>
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
                    <span>Deal ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('title')}>
                  <div className="flex items-center space-x-1">
                    <span>Deal Title & Client</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('serviceCategory')}>
                  <div className="flex items-center space-x-1">
                    <span>Service</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary text-right" onClick={() => handleSort('dealValue')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Contract Value</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('status')}>
                  <div className="flex items-center space-x-1">
                    <span>Stage Status</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('priority')}>
                  <div className="flex items-center space-x-1">
                    <span>Priority</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('owner')}>
                  <div className="flex items-center space-x-1">
                    <span>Owner</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary text-right" onClick={() => handleSort('expectedCloseDate')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Target Close</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {paginatedDeals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-text-muted">
                    No deals match the active filters.
                  </td>
                </tr>
              ) : (
                paginatedDeals.map(deal => (
                  <tr key={deal.id} className="hover:bg-navy-850/60 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-semibold text-accent-blue">
                      <button
                        onClick={() => openDetail('deal', deal.id)}
                        className="hover:underline"
                      >
                        {deal.id}
                      </button>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-text-primary block">{deal.title}</span>
                      <button
                        onClick={() => openDetail('lead', deal.leadId)}
                        className="text-[11px] text-text-secondary hover:text-accent-blue block text-left"
                      >
                        {deal.leadName}
                      </button>
                    </td>

                    <td className="py-3.5 px-3 text-text-secondary">
                      {deal.serviceCategory}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-bold text-text-primary">
                      {formatINR(deal.dealValue)}
                    </td>

                    <td className="py-3.5 px-3">
                      <select
                        value={deal.status}
                        onChange={(e) => updateDealStatus(deal.id, e.target.value as DealStatus)}
                        className="text-[11px] font-semibold rounded-lg px-2 py-1 bg-navy-800 border border-navy-750 focus:outline-none"
                        style={{ color: STATUS_COLORS[deal.status] }}
                      >
                        <option value="New">New</option>
                        <option value="Proposal">Proposal</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Won">Won</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-3">
                      <select
                        value={deal.priority}
                        onChange={(e) => updateDealPriority(deal.id, e.target.value as DealPriority)}
                        className="text-[11px] font-semibold rounded-lg px-2 py-0.5 bg-navy-800 border border-navy-750 focus:outline-none"
                        style={{ color: PRIORITY_COLORS[deal.priority] }}
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-3 text-text-secondary">
                      {deal.owner}
                    </td>

                    <td className="py-3.5 px-3 text-right text-text-muted font-mono text-[11px]">
                      {formatDateCustom(deal.expectedCloseDate, settings.dateFormat)}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => openDetail('deal', deal.id)}
                          className="p-1 rounded-lg text-text-muted hover:text-accent-purple hover:bg-navy-800 transition-colors"
                          title="View Deal Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete deal ${deal.title} (${deal.id})?`)) {
                              deleteDeal(deal.id);
                            }
                          }}
                          className="p-1 rounded-lg text-text-muted hover:text-status-danger hover:bg-navy-800 transition-colors"
                          title="Delete Deal"
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

      <CreateDealModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};
