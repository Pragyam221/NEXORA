import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { 
  BarChart3, Download, Printer, Users, FileText, 
  TrendingUp, Wallet, PackageCheck, CreditCard, CheckCircle2
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import { formatDateCustom } from '../utils/dates';
import { exportToCSV } from '../utils/csv';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, PieChart, Pie, Cell 
} from 'recharts';

type ReportTab = 'leads' | 'quotations' | 'deals' | 'revenue' | 'orders' | 'payments';

const PALETTE = ['#7C5CFC', '#4F8CFF', '#20D6A0', '#F5B942', '#FF647C', '#8E9AAF'];

export const Reports: React.FC = () => {
  const { 
    filteredLeads, 
    filteredQuotations, 
    filteredDeals, 
    filteredOrders, 
    filteredPayments,
    kpis, 
    settings,
    currentRange,
    addToast 
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<ReportTab>('revenue');

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // CSV Export for active report
  const handleExportReportCSV = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    if (activeTab === 'leads') {
      const data = filteredLeads.map(l => ({
        ID: l.id,
        Company: l.company,
        Name: l.name,
        Status: l.status,
        Source: l.source,
        Owner: l.assignedOwner,
        EstimatedValue: l.estimatedValue,
        CreatedAt: l.createdAt,
      }));
      exportToCSV(data, `nexora-lead-report-${timestamp}.csv`);
    } else if (activeTab === 'quotations') {
      const data = filteredQuotations.map(q => ({
        ID: q.id,
        Client: q.leadName,
        Service: q.serviceCategory,
        Amount: q.amount,
        Status: q.status,
        CreatedAt: q.createdAt,
        ExpiryDate: q.expiryDate,
      }));
      exportToCSV(data, `nexora-quotation-report-${timestamp}.csv`);
    } else if (activeTab === 'deals') {
      const data = filteredDeals.map(d => ({
        ID: d.id,
        Title: d.title,
        Client: d.leadName,
        Value: d.dealValue,
        Status: d.status,
        Priority: d.priority,
        Owner: d.owner,
        ExpectedClose: d.expectedCloseDate,
      }));
      exportToCSV(data, `nexora-deals-report-${timestamp}.csv`);
    } else if (activeTab === 'revenue') {
      const data = filteredPayments.filter(p => p.status === 'Successful').map(p => ({
        PaymentID: p.id,
        Client: p.leadName,
        Amount: p.amount,
        Method: p.paymentMethod,
        Date: p.paymentDate,
        Reference: p.transactionRef,
      }));
      exportToCSV(data, `nexora-revenue-report-${timestamp}.csv`);
    } else if (activeTab === 'orders') {
      const data = filteredOrders.map(o => ({
        OrderID: o.id,
        Client: o.leadName,
        Service: o.serviceCategory,
        Amount: o.orderAmount,
        Status: o.status,
        Progress: o.progress,
        DueDate: o.dueDate,
      }));
      exportToCSV(data, `nexora-orders-report-${timestamp}.csv`);
    } else if (activeTab === 'payments') {
      const data = filteredPayments.map(p => ({
        ID: p.id,
        Client: p.leadName,
        Amount: p.amount,
        Status: p.status,
        Method: p.paymentMethod,
        Date: p.paymentDate,
        DueDate: p.dueDate,
      }));
      exportToCSV(data, `nexora-payment-audit-report-${timestamp}.csv`);
    }
    addToast('success', 'Report Exported', `Downloaded ${activeTab.toUpperCase()} CSV dataset.`);
  };

  // Aggregated data for Revenue Report
  const revenueByMethod = useMemo(() => {
    const map: Record<string, number> = {};
    filteredPayments.filter(p => p.status === 'Successful').forEach(p => {
      map[p.paymentMethod] = (map[p.paymentMethod] || 0) + p.amount;
    });
    return Object.entries(map).map(([method, amount]) => ({ method, amount }));
  }, [filteredPayments]);

  const dealsByOwner = useMemo(() => {
    const map: Record<string, { won: number; total: number; value: number }> = {};
    filteredDeals.forEach(d => {
      if (!map[d.owner]) map[d.owner] = { won: 0, total: 0, value: 0 };
      map[d.owner].total++;
      if (d.status === 'Won') {
        map[d.owner].won++;
        map[d.owner].value += d.dealValue;
      }
    });
    return Object.entries(map).map(([owner, stat]) => ({ owner, ...stat }));
  }, [filteredDeals]);

  return (
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Executive Business Intelligence Reports</h1>
          <p className="text-xs text-text-secondary mt-1">
            Official operational reporting, revenue reconciliation, and audit statements
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-navy-900 hover:bg-navy-850 text-text-primary border border-navy-750 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-accent-purple" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportReportCSV}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-accent-purple hover:bg-accent-purpleHover transition-colors shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>Export Report CSV</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-navy-800">
        {[
          { id: 'revenue', label: 'Revenue Report', icon: Wallet },
          { id: 'leads', label: 'Lead Performance', icon: Users },
          { id: 'quotations', label: 'Quotation Conversion', icon: FileText },
          { id: 'deals', label: 'Deal Velocity', icon: TrendingUp },
          { id: 'orders', label: 'Order Completion', icon: PackageCheck },
          { id: 'payments', label: 'Payment Reconciliation', icon: CreditCard },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ReportTab)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/20'
                  : 'bg-navy-900 text-text-secondary hover:text-text-primary hover:bg-navy-850 border border-navy-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Report Content Container */}
      <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
        {/* Report Metadata Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-navy-800 gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent-purple">
              NEXORA CORPORATE REPORTING
            </span>
            <h2 className="text-lg font-bold text-text-primary capitalize mt-0.5">
              {activeTab} Performance Analysis & Audit
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-text-secondary block font-mono">
              Period: {formatDateCustom(currentRange.startDate, settings.dateFormat)} to {formatDateCustom(currentRange.endDate, settings.dateFormat)}
            </span>
            <span className="text-[10px] text-text-muted">Generated deterministically from active ledger</span>
          </div>
        </div>

        {/* ================= REVENUE REPORT ================= */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
                <span className="text-xs text-text-muted">Total Realized Cash</span>
                <p className="text-xl font-bold text-status-success mt-1">{formatINR(kpis.collectedRevenue.currentValue)}</p>
                <span className="text-[11px] text-text-secondary">Confirmed successful receipts</span>
              </div>
              <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
                <span className="text-xs text-text-muted">Outstanding Book Balance</span>
                <p className="text-xl font-bold text-status-warning mt-1">{formatINR(kpis.outstandingBalance.currentValue)}</p>
                <span className="text-[11px] text-text-secondary">Won contracts pending collection</span>
              </div>
              <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
                <span className="text-xs text-text-muted">Total Contracted Deal Bookings</span>
                <p className="text-xl font-bold text-text-primary mt-1">{formatINR(kpis.totalDealValue.currentValue)}</p>
                <span className="text-[11px] text-text-secondary">Across {filteredDeals.length} deals</span>
              </div>
            </div>

            <div className="bg-navy-850 p-5 rounded-xl border border-navy-750">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
                Cash Realization by Payment Channel
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByMethod} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2640" />
                    <XAxis dataKey="method" stroke="#616E8E" fontSize={11} />
                    <YAxis stroke="#616E8E" fontSize={10} tickFormatter={(v) => formatINR(v, true)} />
                    <Tooltip formatter={(val: any) => [formatINR(Number(val)), 'Collected Cash']} />
                    <Bar dataKey="amount" fill="#20D6A0" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ================= LEAD REPORT ================= */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
                <span className="text-xs text-text-muted">Total Acquired Leads</span>
                <p className="text-xl font-bold text-text-primary mt-1">{filteredLeads.length}</p>
              </div>
              <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
                <span className="text-xs text-text-muted">Qualified Prospects</span>
                <p className="text-xl font-bold text-accent-blue mt-1">{kpis.qualifiedLeads.currentValue}</p>
              </div>
              <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
                <span className="text-xs text-text-muted">Converted Customers</span>
                <p className="text-xl font-bold text-status-success mt-1">{kpis.convertedLeads.currentValue}</p>
              </div>
              <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
                <span className="text-xs text-text-muted">Conversion Ratio</span>
                <p className="text-xl font-bold text-accent-purple mt-1">{kpis.leadConversionRate.currentValue.toFixed(1)}%</p>
              </div>
            </div>

            <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
                Lead Performance Summary
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-navy-800 text-text-muted uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Company</th>
                      <th className="py-2.5 px-3">Lead Source</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Account Owner</th>
                      <th className="py-2.5 px-3 text-right">Potential Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800/60">
                    {filteredLeads.slice(0, 8).map(l => (
                      <tr key={l.id}>
                        <td className="py-2.5 px-3 font-semibold text-text-primary">{l.company}</td>
                        <td className="py-2.5 px-3 text-text-secondary">{l.source}</td>
                        <td className="py-2.5 px-3 text-accent-purple">{l.status}</td>
                        <td className="py-2.5 px-3 text-text-secondary">{l.assignedOwner}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-text-primary">{formatINR(l.estimatedValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= QUOTATIONS REPORT ================= */}
        {activeTab === 'quotations' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
                <span className="text-xs text-text-muted">Quotations Issued</span>
                <p className="text-xl font-bold text-text-primary mt-1">{filteredQuotations.length}</p>
              </div>
              <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
                <span className="text-xs text-text-muted">Total Proposed Value</span>
                <p className="text-xl font-bold text-accent-purple mt-1">{formatINR(kpis.totalQuotedValue.currentValue)}</p>
              </div>
              <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
                <span className="text-xs text-text-muted">Quote-to-Deal Conversion</span>
                <p className="text-xl font-bold text-status-success mt-1">{kpis.quoteConversionRate.currentValue.toFixed(1)}%</p>
              </div>
            </div>

            <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
                Key Proposals Audit
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-navy-800 text-text-muted uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">Client</th>
                      <th className="py-2.5 px-3">Discipline</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800/60">
                    {filteredQuotations.slice(0, 8).map(q => (
                      <tr key={q.id}>
                        <td className="py-2.5 px-3 font-mono text-accent-purple">{q.id}</td>
                        <td className="py-2.5 px-3 font-medium text-text-primary">{q.leadName}</td>
                        <td className="py-2.5 px-3 text-text-secondary">{q.serviceCategory}</td>
                        <td className="py-2.5 px-3">{q.status}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">{formatINR(q.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= DEALS REPORT ================= */}
        {activeTab === 'deals' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
                <span className="text-xs text-text-muted">Deals in Pipeline</span>
                <p className="text-xl font-bold text-text-primary mt-1">{filteredDeals.length}</p>
              </div>
              <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
                <span className="text-xs text-text-muted">Won Deals</span>
                <p className="text-xl font-bold text-status-success mt-1">{kpis.wonDeals.currentValue}</p>
              </div>
              <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
                <span className="text-xs text-text-muted">Win Rate</span>
                <p className="text-xl font-bold text-accent-blue mt-1">{kpis.winRate.currentValue.toFixed(1)}%</p>
              </div>
              <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
                <span className="text-xs text-text-muted">Total Contract Value</span>
                <p className="text-xl font-bold text-accent-purple mt-1">{formatINR(kpis.totalDealValue.currentValue)}</p>
              </div>
            </div>

            <div className="bg-navy-850 p-5 rounded-xl border border-navy-750">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
                Closed-Won Bookings by Deal Owner (₹)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dealsByOwner} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2640" />
                    <XAxis dataKey="owner" stroke="#616E8E" fontSize={11} />
                    <YAxis stroke="#616E8E" fontSize={10} tickFormatter={(v) => formatINR(v, true)} />
                    <Tooltip formatter={(val: any) => [formatINR(Number(val)), 'Won Deal Value']} />
                    <Bar dataKey="value" fill="#4F8CFF" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ================= ORDERS REPORT ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
                <span className="text-xs text-text-muted">Total Work Orders</span>
                <p className="text-xl font-bold text-text-primary mt-1">{filteredOrders.length}</p>
              </div>
              <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
                <span className="text-xs text-text-muted">Completed Deliverables</span>
                <p className="text-xl font-bold text-status-success mt-1">{kpis.completedOrders.currentValue}</p>
              </div>
              <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
                <span className="text-xs text-text-muted">In Progress</span>
                <p className="text-xl font-bold text-status-info mt-1">{kpis.inProgressOrders.currentValue}</p>
              </div>
              <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
                <span className="text-xs text-text-muted">Total Fulfillment Value</span>
                <p className="text-xl font-bold text-accent-purple mt-1">
                  {formatINR(filteredOrders.reduce((acc, o) => acc + o.orderAmount, 0))}
                </p>
              </div>
            </div>

            <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
                Execution Velocity Summary
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-navy-800 text-text-muted uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Client</th>
                      <th className="py-2.5 px-3">Practice</th>
                      <th className="py-2.5 px-3">Progress</th>
                      <th className="py-2.5 px-3">Target Due</th>
                      <th className="py-2.5 px-3 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800/60">
                    {filteredOrders.slice(0, 8).map(o => (
                      <tr key={o.id}>
                        <td className="py-2.5 px-3 font-mono text-status-info">{o.id}</td>
                        <td className="py-2.5 px-3 font-medium text-text-primary">{o.leadName}</td>
                        <td className="py-2.5 px-3 text-text-secondary">{o.serviceCategory}</td>
                        <td className="py-2.5 px-3 font-mono">{o.progress}% ({o.status})</td>
                        <td className="py-2.5 px-3 text-text-muted">{formatDateCustom(o.dueDate, settings.dateFormat)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">{formatINR(o.orderAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= PAYMENTS AUDIT REPORT ================= */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
                <span className="text-xs text-text-muted">Total Payment Records</span>
                <p className="text-xl font-bold text-text-primary mt-1">{filteredPayments.length}</p>
              </div>
              <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
                <span className="text-xs text-text-muted">Successful Collections</span>
                <p className="text-xl font-bold text-status-success mt-1">{formatINR(kpis.collectedAmount.currentValue)}</p>
              </div>
              <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
                <span className="text-xs text-text-muted">Pending Invoices</span>
                <p className="text-xl font-bold text-status-warning mt-1">{formatINR(kpis.pendingAmount.currentValue)}</p>
              </div>
              <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
                <span className="text-xs text-text-muted">Overdue Balance</span>
                <p className="text-xl font-bold text-status-danger mt-1">{formatINR(kpis.overdueAmount.currentValue)}</p>
              </div>
            </div>

            <div className="bg-navy-850 p-4 rounded-xl border border-navy-750">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
                Transaction Reconciliation Ledger
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-navy-800 text-text-muted uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Payment ID</th>
                      <th className="py-2.5 px-3">Client Customer</th>
                      <th className="py-2.5 px-3">Channel</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800/60">
                    {filteredPayments.slice(0, 8).map(p => (
                      <tr key={p.id}>
                        <td className="py-2.5 px-3 font-mono text-accent-purple">{p.id}</td>
                        <td className="py-2.5 px-3 font-medium text-text-primary">{p.leadName}</td>
                        <td className="py-2.5 px-3 text-text-secondary">{p.paymentMethod}</td>
                        <td className={`py-2.5 px-3 font-semibold ${
                          p.status === 'Successful' ? 'text-status-success' :
                          p.status === 'Pending' ? 'text-status-warning' : 'text-status-danger'
                        }`}>{p.status}</td>
                        <td className="py-2.5 px-3 text-text-muted font-mono">{formatDateCustom(p.paymentDate, settings.dateFormat)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">{formatINR(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
