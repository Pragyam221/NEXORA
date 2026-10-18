import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { MetricCard } from '../components/cards/MetricCard';
import { CreateLeadModal } from '../components/forms/CreateLeadModal';
import { 
  Users, UserCheck, Award, UserX, Percent, Download, 
  Search, Filter, Plus, ChevronLeft, ChevronRight, ArrowUpDown, 
  Trash2, Eye, Edit2, RotateCcw
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import { formatDateCustom } from '../utils/dates';
import { exportToCSV } from '../utils/csv';
import { Lead, LeadStatus, LeadSource } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

const STATUS_COLORS: Record<LeadStatus, string> = {
  New: '#7C5CFC',
  Contacted: '#4F8CFF',
  Qualified: '#20D6A0',
  Unqualified: '#FF647C',
  Converted: '#F5B942',
};

export const LeadAnalytics: React.FC = () => {
  const { 
    filteredLeads, 
    kpis, 
    settings, 
    openDetail, 
    deleteLead, 
    updateLeadStatus, 
    addToast 
  } = useDashboard();

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Table Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [ownerFilter, setOwnerFilter] = useState<string>('All');

  // Sorting
  const [sortField, setSortField] = useState<keyof Lead>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(settings.pageSize || 10);

  // Filtered & Sorted Leads
  const processedLeads = useMemo(() => {
    let result = [...filteredLeads];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => 
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(l => l.status === statusFilter);
    }

    // Source filter
    if (sourceFilter !== 'All') {
      result = result.filter(l => l.source === sourceFilter);
    }

    // Owner filter
    if (ownerFilter !== 'All') {
      result = result.filter(l => l.assignedOwner === ownerFilter);
    }

    // Sorting
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
  }, [filteredLeads, searchQuery, statusFilter, sourceFilter, ownerFilter, sortField, sortDirection]);

  // Paginated records
  const totalPages = Math.ceil(processedLeads.length / pageSize) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedLeads.slice(start, start + pageSize);
  }, [processedLeads, currentPage, pageSize]);

  // Handle Sort Click
  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const exportData = processedLeads.map(l => ({
      ID: l.id,
      Name: l.name,
      Company: l.company,
      Email: l.email,
      Phone: l.phone,
      Source: l.source,
      Status: l.status,
      AssignedOwner: l.assignedOwner,
      EstimatedValue: l.estimatedValue,
      CreatedAt: l.createdAt,
      Industry: l.industry || '',
      City: l.city || '',
    }));
    exportToCSV(exportData, `nexora-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    addToast('success', 'CSV Downloaded', `Exported ${exportData.length} leads.`);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setSourceFilter('All');
    setOwnerFilter('All');
    setCurrentPage(1);
    addToast('info', 'Filters Reset', 'All lead table filters cleared.');
  };

  // Unique owners for filter
  const uniqueOwners = useMemo(() => {
    return Array.from(new Set(filteredLeads.map(l => l.assignedOwner))).sort();
  }, [filteredLeads]);

  // Charts
  // 1. Leads by status
  const leadsByStatusData = useMemo(() => {
    const counts: Record<string, number> = { New: 0, Contacted: 0, Qualified: 0, Unqualified: 0, Converted: 0 };
    filteredLeads.forEach(l => {
      if (counts[l.status] !== undefined) counts[l.status]++;
    });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [filteredLeads]);

  // 2. Conversion rate by source
  const sourceConversionData = useMemo(() => {
    const map: Record<string, { total: number; converted: number }> = {};
    filteredLeads.forEach(l => {
      if (!map[l.source]) map[l.source] = { total: 0, converted: 0 };
      map[l.source].total++;
      if (l.status === 'Converted') map[l.source].converted++;
    });

    return Object.entries(map).map(([source, data]) => ({
      source,
      rate: data.total > 0 ? Number(((data.converted / data.total) * 100).toFixed(1)) : 0,
      total: data.total,
    }));
  }, [filteredLeads]);

  return (
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Lead Intelligence & Acquisition</h1>
          <p className="text-xs text-text-secondary mt-1">
            Enterprise prospect qualification, lifecycle progression, and acquisition attribution
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
            <span>Create Lead</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Leads"
          value={kpis.totalLeads.currentValue}
          comparison={kpis.totalLeads}
          icon={Users}
          iconColor="text-accent-purple"
          tooltip="Total leads created in active reporting period"
        />
        <MetricCard
          title="Qualified Leads"
          value={kpis.qualifiedLeads.currentValue}
          comparison={kpis.qualifiedLeads}
          icon={UserCheck}
          iconColor="text-accent-blue"
          tooltip="Leads evaluated and verified for enterprise procurement"
        />
        <MetricCard
          title="Converted Leads"
          value={kpis.convertedLeads.currentValue}
          comparison={kpis.convertedLeads}
          icon={Award}
          iconColor="text-status-success"
          tooltip="Leads converted into active deal clients"
        />
        <MetricCard
          title="Unqualified Leads"
          value={kpis.unqualifiedLeads.currentValue}
          comparison={kpis.unqualifiedLeads}
          icon={UserX}
          iconColor="text-status-danger"
          tooltip="Leads stalled, non-responsive, or budget disqualified"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${kpis.leadConversionRate.currentValue.toFixed(1)}%`}
          comparison={kpis.leadConversionRate}
          icon={Percent}
          iconColor="text-status-success"
          tooltip="Percentage of leads converted to won customers"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by Status Bar Chart */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <h2 className="text-sm font-bold text-text-primary mb-1">Leads by Qualification Stage</h2>
          <p className="text-xs text-text-secondary mb-4">Volume distribution across active pipeline statuses</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsByStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2640" />
                <XAxis dataKey="status" stroke="#616E8E" fontSize={11} />
                <YAxis stroke="#616E8E" fontSize={11} allowDecimals={false} />
                <Tooltip formatter={(val: any) => [val, 'Leads']} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {leadsByStatusData.map(entry => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status as LeadStatus] || '#7C5CFC'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Rate by Source */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <h2 className="text-sm font-bold text-text-primary mb-1">Conversion Rate by Lead Channel (%)</h2>
          <p className="text-xs text-text-secondary mb-4">Attribution conversion efficiency by origin</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceConversionData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2640" />
                <XAxis dataKey="source" stroke="#616E8E" fontSize={10} />
                <YAxis stroke="#616E8E" fontSize={11} unit="%" />
                <Tooltip formatter={(val: any) => [`${val}%`, 'Conversion Rate']} />
                <Bar dataKey="rate" fill="#20D6A0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Table Card */}
      <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
        {/* Table Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-navy-800">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search name, company, email, ID..."
                className="w-full bg-navy-850 text-text-primary placeholder:text-text-muted text-xs pl-8 pr-3 py-2 rounded-xl border border-navy-750 focus:outline-none focus:border-accent-purple"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Unqualified">Unqualified</option>
              <option value="Converted">Converted</option>
            </select>

            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
            >
              <option value="All">All Sources</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Social Media">Social Media</option>
              <option value="Paid Ads">Paid Ads</option>
              <option value="Direct">Direct</option>
              <option value="Other">Other</option>
            </select>

            {/* Owner Filter */}
            <select
              value={ownerFilter}
              onChange={(e) => {
                setOwnerFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
            >
              <option value="All">All Owners</option>
              {uniqueOwners.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>

            {/* Reset Filters */}
            {(searchQuery || statusFilter !== 'All' || sourceFilter !== 'All' || ownerFilter !== 'All') && (
              <button
                onClick={handleClearFilters}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs text-text-muted hover:text-text-primary hover:bg-navy-850 transition-colors"
                title="Clear table filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Records count & page size */}
          <div className="flex items-center space-x-3 text-xs text-text-secondary">
            <span>Showing <strong className="text-text-primary">{processedLeads.length}</strong> leads</span>
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

        {/* Leads Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-navy-800 text-text-muted uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('id')}>
                  <div className="flex items-center space-x-1">
                    <span>Lead ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('company')}>
                  <div className="flex items-center space-x-1">
                    <span>Company & Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('source')}>
                  <div className="flex items-center space-x-1">
                    <span>Source</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('status')}>
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('assignedOwner')}>
                  <div className="flex items-center space-x-1">
                    <span>Owner</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary text-right" onClick={() => handleSort('estimatedValue')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Est. Value</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-text-primary text-right" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Created</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-text-muted">
                    No leads match the active search and filters.
                  </td>
                </tr>
              ) : (
                paginatedLeads.map(lead => (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-navy-850/60 transition-colors group"
                  >
                    <td className="py-3.5 px-3 font-mono font-semibold text-accent-purple">
                      <button
                        onClick={() => openDetail('lead', lead.id)}
                        className="hover:underline"
                      >
                        {lead.id}
                      </button>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-text-primary block">{lead.company}</span>
                      <span className="text-[11px] text-text-secondary">{lead.name}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="text-text-primary block truncate max-w-[140px]">{lead.email}</span>
                      <span className="text-[11px] text-text-muted font-mono">{lead.phone}</span>
                    </td>

                    <td className="py-3.5 px-3 text-text-secondary">
                      {lead.source}
                    </td>

                    <td className="py-3.5 px-3">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                        className="text-[11px] font-semibold rounded-lg px-2 py-1 bg-navy-800 border border-navy-750 focus:outline-none"
                        style={{ color: STATUS_COLORS[lead.status] }}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Unqualified">Unqualified</option>
                        <option value="Converted">Converted</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-3 text-text-secondary">
                      {lead.assignedOwner}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-text-primary">
                      {formatINR(lead.estimatedValue)}
                    </td>

                    <td className="py-3.5 px-3 text-right text-text-muted font-mono text-[11px]">
                      {formatDateCustom(lead.createdAt, settings.dateFormat)}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => openDetail('lead', lead.id)}
                          className="p-1 rounded-lg text-text-muted hover:text-accent-purple hover:bg-navy-800 transition-colors"
                          title="View Lead Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete lead ${lead.company} (${lead.id})?`)) {
                              deleteLead(lead.id);
                            }
                          }}
                          className="p-1 rounded-lg text-text-muted hover:text-status-danger hover:bg-navy-800 transition-colors"
                          title="Delete Lead"
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

        {/* Pagination Controls */}
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

      {/* Modal */}
      <CreateLeadModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};
