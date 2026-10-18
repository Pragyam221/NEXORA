import React, { useMemo, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { MetricCard } from '../components/cards/MetricCard';
import { 
  Users, UserCheck, Award, Percent, FileText, 
  TrendingUp, IndianRupee, Wallet, Clock, PackageCheck,
  Sparkles, AlertCircle, ArrowUpRight, CheckCircle2, ChevronRight
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import { formatDateCustom, formatDateTime } from '../utils/dates';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, Legend
} from 'recharts';

const PALETTE = ['#7C5CFC', '#4F8CFF', '#20D6A0', '#F5B942', '#FF647C', '#8E9AAF'];

export const Overview: React.FC = () => {
  const { 
    kpis, 
    filteredLeads, 
    filteredQuotations, 
    filteredDeals, 
    filteredOrders, 
    filteredPayments,
    prevPayments,
    filteredActivities, 
    settings, 
    openDetail 
  } = useDashboard();

  // Series visibility toggles for Revenue chart
  const [showCurrentSeries, setShowCurrentSeries] = useState(true);
  const [showPreviousSeries, setShowPreviousSeries] = useState(true);

  // 1. Revenue Over Time chart dataset aggregated by date
  const revenueChartData = useMemo(() => {
    // Collect unique dates from payments
    const dateMap: Record<string, { date: string; current: number; previous: number }> = {};
    
    // Sort payments chronologically
    const sortedCur = [...filteredPayments]
      .filter(p => p.status === 'Successful')
      .sort((a, b) => a.paymentDate.localeCompare(b.paymentDate));

    sortedCur.forEach(p => {
      const d = p.paymentDate;
      if (!dateMap[d]) {
        dateMap[d] = { date: d, current: 0, previous: 0 };
      }
      dateMap[d].current += p.amount;
    });

    // Merge previous period amounts (for comparison overlay)
    const sortedPrev = [...prevPayments]
      .filter(p => p.status === 'Successful')
      .sort((a, b) => a.paymentDate.localeCompare(b.paymentDate));

    // Map by index or offset to align
    const curKeys = Object.keys(dateMap);
    sortedPrev.forEach((p, idx) => {
      const targetKey = curKeys[idx] || curKeys[curKeys.length - 1];
      if (targetKey && dateMap[targetKey]) {
        dateMap[targetKey].previous += p.amount;
      }
    });

    const result = Object.values(dateMap);
    if (result.length === 0) {
      return [
        { date: 'Day 1', current: 0, previous: 0 },
        { date: 'Day 2', current: 0, previous: 0 },
      ];
    }
    return result;
  }, [filteredPayments, prevPayments]);

  // 2. Lead Conversion Funnel
  const funnelData = useMemo(() => {
    const total = filteredLeads.length;
    const contacted = filteredLeads.filter(l => ['Contacted', 'Qualified', 'Converted'].includes(l.status)).length;
    const qualified = filteredLeads.filter(l => ['Qualified', 'Converted'].includes(l.status)).length;
    const quoted = filteredQuotations.length;
    const converted = filteredLeads.filter(l => l.status === 'Converted').length;

    return [
      { stage: 'New Inquiries', count: total, fill: '#7C5CFC' },
      { stage: 'Contacted', count: contacted, fill: '#6058F8' },
      { stage: 'Qualified', count: qualified, fill: '#4F8CFF' },
      { stage: 'Quoted', count: quoted, fill: '#2AD1B2' },
      { stage: 'Converted', count: converted, fill: '#20D6A0' },
    ];
  }, [filteredLeads, filteredQuotations]);

  // 3. Revenue by Service Category
  const revenueByCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredPayments
      .filter(p => p.status === 'Successful')
      .forEach(p => {
        const order = filteredOrders.find(o => o.id === p.orderId);
        const deal = filteredDeals.find(d => d.id === p.dealId);
        const cat = order?.serviceCategory || deal?.serviceCategory || 'Enterprise Services';
        map[cat] = (map[cat] || 0) + p.amount;
      });

    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredPayments, filteredOrders, filteredDeals]);

  // 4. Lead Source Breakdown
  const leadSourceData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredLeads.forEach(l => {
      map[l.source] = (map[l.source] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [filteredLeads]);

  // 5. Deal Priority Distribution
  const dealPriorityData = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    filteredDeals.forEach(d => {
      if (counts[d.priority] !== undefined) counts[d.priority]++;
    });
    return [
      { name: 'High', value: counts.High, color: '#FF647C' },
      { name: 'Medium', value: counts.Medium, color: '#F5B942' },
      { name: 'Low', value: counts.Low, color: '#4F8CFF' },
    ];
  }, [filteredDeals]);

  // 6. Order Status Distribution
  const orderStatusData = useMemo(() => {
    const counts: Record<string, number> = { Completed: 0, 'In Progress': 0, Pending: 0, Cancelled: 0 };
    filteredOrders.forEach(o => {
      if (counts[o.status] !== undefined) counts[o.status]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  // Dynamic AI Business Insights generated from underlying data
  const dynamicInsights = useMemo(() => {
    const insights: Array<{ title: string; desc: string; type: 'success' | 'warning' | 'info' }> = [];

    // 1. Highest converting lead source
    const sourceConversions: Record<string, { total: number; converted: number }> = {};
    filteredLeads.forEach(l => {
      if (!sourceConversions[l.source]) sourceConversions[l.source] = { total: 0, converted: 0 };
      sourceConversions[l.source].total++;
      if (l.status === 'Converted') sourceConversions[l.source].converted++;
    });

    let bestSource = '';
    let bestRate = -1;
    Object.entries(sourceConversions).forEach(([src, data]) => {
      const rate = data.total > 0 ? (data.converted / data.total) * 100 : 0;
      if (rate > bestRate && data.total >= 2) {
        bestRate = rate;
        bestSource = src;
      }
    });

    if (bestSource) {
      insights.push({
        title: `High ROI Channel: ${bestSource}`,
        desc: `${bestSource} leads yield the highest conversion efficiency at ${bestRate.toFixed(1)}% in this period.`,
        type: 'success',
      });
    }

    // 2. Revenue Momentum
    const revChange = kpis.collectedRevenue.percentageChange;
    if (revChange !== null && revChange > 0) {
      insights.push({
        title: 'Strong Top-line Momentum',
        desc: `Collected revenue grew by +${revChange.toFixed(1)}% compared to the prior baseline period.`,
        type: 'success',
      });
    } else if (revChange !== null && revChange < 0) {
      insights.push({
        title: 'Revenue Pace Contraction',
        desc: `Collected collections dipped by ${Math.abs(revChange).toFixed(1)}% vs previous interval. Accelerate invoice follow-ups.`,
        type: 'warning',
      });
    }

    // 3. Outstanding collections requiring immediate attention
    const overduePayments = filteredPayments.filter(p => p.status === 'Pending' && p.dueDate < '2026-10-18');
    if (overduePayments.length > 0) {
      const overdueTotal = overduePayments.reduce((acc, p) => acc + p.amount, 0);
      insights.push({
        title: 'Overdue Collections Watchlist',
        desc: `${overduePayments.length} invoices amounting to ${formatINR(overdueTotal)} have passed due date and require billing intervention.`,
        type: 'warning',
      });
    }

    // 4. In-progress deals aging
    const agingDeals = filteredDeals.filter(d => d.status === 'Negotiation' && d.priority === 'High');
    if (agingDeals.length > 0) {
      insights.push({
        title: `${agingDeals.length} High-Priority Deals In Negotiation`,
        desc: `Key enterprise opportunities are currently in final legal review with potential closure value of ${formatINR(agingDeals.reduce((a, b) => a + b.dealValue, 0))}.`,
        type: 'info',
      });
    }

    return insights;
  }, [filteredLeads, kpis, filteredPayments, filteredDeals]);

  return (
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Executive Intelligence Overview</h1>
          <p className="text-xs text-text-secondary mt-1">
            Real-time multi-dimensional pipeline metrics, collected revenue, and operational velocity
          </p>
        </div>
      </div>

      {/* Primary KPI Grid (Top 5 Essential Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Leads"
          value={kpis.totalLeads.currentValue}
          comparison={kpis.totalLeads}
          icon={Users}
          iconColor="text-accent-purple"
          tooltip="Total leads created in the active reporting interval"
          sparklineData={[4, 6, 8, 5, 9, 12, 14]}
        />
        <MetricCard
          title="Lead Conversion Rate"
          value={`${kpis.leadConversionRate.currentValue.toFixed(1)}%`}
          comparison={kpis.leadConversionRate}
          icon={Percent}
          iconColor="text-status-success"
          tooltip="Percentage of total inquiries converted into customers"
          sparklineData={[18, 22, 21, 26, 29, 31, 35]}
        />
        <MetricCard
          title="Active Deals"
          value={kpis.openDeals.currentValue}
          comparison={kpis.openDeals}
          icon={TrendingUp}
          iconColor="text-accent-blue"
          tooltip="Deals actively in Proposal or Negotiation stages"
          sparklineData={[5, 7, 6, 8, 10, 11, 9]}
        />
        <MetricCard
          title="Collected Revenue"
          value={formatINR(kpis.collectedRevenue.currentValue, true)}
          comparison={kpis.collectedRevenue}
          icon={Wallet}
          iconColor="text-status-success"
          tooltip="Actual cash collections from successful payments in period"
          sparklineData={[12, 19, 25, 22, 38, 45, 52]}
        />
        <MetricCard
          title="Outstanding Balance"
          value={formatINR(kpis.outstandingBalance.currentValue, true)}
          comparison={kpis.outstandingBalance}
          icon={Clock}
          iconColor="text-status-warning"
          tooltip="Won deal value yet to be collected through payments"
          sparklineData={[8, 12, 14, 15, 12, 10, 9]}
        />
      </div>

      {/* Secondary KPI Grid (Additional 5 Key Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Qualified Leads"
          value={kpis.qualifiedLeads.currentValue}
          comparison={kpis.qualifiedLeads}
          icon={UserCheck}
          iconColor="text-accent-blue"
          tooltip="Leads validated as viable enterprise opportunities"
        />
        <MetricCard
          title="Converted Leads"
          value={kpis.convertedLeads.currentValue}
          comparison={kpis.convertedLeads}
          icon={Award}
          iconColor="text-status-success"
          tooltip="Leads that have finalized deals and agreements"
        />
        <MetricCard
          title="Total Quotations"
          value={kpis.totalQuotations.currentValue}
          comparison={kpis.totalQuotations}
          icon={FileText}
          iconColor="text-status-info"
          tooltip="Quotations and formal proposals generated"
        />
        <MetricCard
          title="Total Deal Value"
          value={formatINR(kpis.totalDealValue.currentValue, true)}
          comparison={kpis.totalDealValue}
          icon={IndianRupee}
          iconColor="text-accent-purple"
          tooltip="Aggregate contracted value of all deals in scope"
        />
        <MetricCard
          title="Completed Orders"
          value={kpis.completedOrders.currentValue}
          comparison={kpis.completedOrders}
          icon={PackageCheck}
          iconColor="text-status-success"
          tooltip="Orders executed to 100% completion"
        />
      </div>

      {/* Charts Section: Row 1 (Revenue Over Time & Lead Funnel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Over Time (Area Chart - 2 cols) */}
        <div className="lg:col-span-2 bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-navy-800 gap-2">
            <div>
              <h2 className="text-sm font-bold text-text-primary">Revenue Collections Over Time</h2>
              <p className="text-xs text-text-secondary">Comparing successful payment receipts with previous baseline</p>
            </div>
            {/* Interactive series toggles */}
            <div className="flex items-center space-x-3 text-xs">
              <button
                onClick={() => setShowCurrentSeries(!showCurrentSeries)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                  showCurrentSeries 
                    ? 'bg-accent-purple/15 text-accent-purple border-accent-purple/30 font-medium' 
                    : 'bg-navy-850 text-text-muted border-navy-750 opacity-60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-accent-purple" />
                <span>Current Period</span>
              </button>
              <button
                onClick={() => setShowPreviousSeries(!showPreviousSeries)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                  showPreviousSeries 
                    ? 'bg-accent-blue/15 text-accent-blue border-accent-blue/30 font-medium' 
                    : 'bg-navy-850 text-text-muted border-navy-750 opacity-60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-accent-blue" />
                <span>Prior Period</span>
              </button>
            </div>
          </div>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCurRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPrevRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F8CFF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4F8CFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2640" />
                <XAxis 
                  dataKey="date" 
                  stroke="#616E8E" 
                  fontSize={10} 
                  tickFormatter={(val) => formatDateCustom(val, 'DD/MM/YYYY')}
                />
                <YAxis 
                  stroke="#616E8E" 
                  fontSize={10} 
                  tickFormatter={(val) => formatINR(val, true)}
                />
                <Tooltip 
                  formatter={(val: any) => [formatINR(Number(val)), 'Amount']}
                  labelFormatter={(lbl) => `Date: ${formatDateCustom(String(lbl), settings.dateFormat)}`}
                />
                {showCurrentSeries && (
                  <Area 
                    type="monotone" 
                    dataKey="current" 
                    name="Current Period" 
                    stroke="#7C5CFC" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorCurRev)" 
                  />
                )}
                {showPreviousSeries && (
                  <Area 
                    type="monotone" 
                    dataKey="previous" 
                    name="Prior Period" 
                    stroke="#4F8CFF" 
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPrevRev)" 
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Conversion Funnel (1 col) */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-text-primary">Lead Conversion Funnel</h2>
            <p className="text-xs text-text-secondary mt-0.5">Stage progression from inquiry to won customer</p>
          </div>

          <div className="space-y-3 my-4">
            {funnelData.map((stage, idx) => {
              const maxCount = Math.max(...funnelData.map(d => d.count), 1);
              const pctOfTop = ((stage.count / maxCount) * 100).toFixed(0);

              return (
                <div key={stage.stage} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-secondary font-medium">{stage.stage}</span>
                    <span className="text-text-primary font-bold font-mono">
                      {stage.count} <span className="text-[10px] text-text-muted font-normal">({pctOfTop}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-navy-950 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-2.5 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${pctOfTop}%`,
                        backgroundColor: stage.fill
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-navy-800 flex justify-between items-center text-xs text-text-muted">
            <span>Overall Conversion Efficiency:</span>
            <span className="font-bold text-status-success font-mono">{kpis.leadConversionRate.currentValue.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Charts Section: Row 2 (Category Donut, Source Bars, Order Status) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue by Service Category */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <h2 className="text-sm font-bold text-text-primary mb-1">Revenue by Service Category</h2>
          <p className="text-xs text-text-secondary mb-3">Breakdown of collected receipts by practice area</p>
          
          <div className="h-56 w-full">
            {revenueByCategoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-text-muted">No revenue collected in period</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {revenueByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [formatINR(Number(val)), 'Collected']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-2 space-y-1.5 max-h-24 overflow-y-auto">
            {revenueByCategoryData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 truncate mr-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PALETTE[idx % PALETTE.length] }} />
                  <span className="text-text-secondary truncate">{item.name}</span>
                </div>
                <span className="font-semibold text-text-primary flex-shrink-0 font-mono">{formatINR(item.value, true)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Source Breakdown */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <h2 className="text-sm font-bold text-text-primary mb-1">Lead Source Acquisition</h2>
          <p className="text-xs text-text-secondary mb-3">Origins of enterprise prospects</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadSourceData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2640" />
                <XAxis dataKey="name" stroke="#616E8E" fontSize={9} angle={-25} textAnchor="end" />
                <YAxis stroke="#616E8E" fontSize={10} allowDecimals={false} />
                <Tooltip formatter={(val: any) => [val, 'Leads']} />
                <Bar dataKey="count" fill="#4F8CFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 text-xs text-text-muted flex justify-between pt-2 border-t border-navy-800">
            <span>Primary Contributor:</span>
            <span className="font-semibold text-text-primary">
              {leadSourceData.sort((a, b) => b.count - a.count)[0]?.name || 'N/A'}
            </span>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <h2 className="text-sm font-bold text-text-primary mb-1">Order Execution Status</h2>
          <p className="text-xs text-text-secondary mb-3">Live operational fulfillment health</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="value"
                >
                  <Cell fill="#20D6A0" /> {/* Completed */}
                  <Cell fill="#4F8CFF" /> {/* In Progress */}
                  <Cell fill="#F5B942" /> {/* Pending */}
                  <Cell fill="#FF647C" /> {/* Cancelled */}
                </Pie>
                <Tooltip formatter={(val: any) => [val, 'Orders']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-navy-800 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-status-success" />
              <span className="text-text-secondary">Completed: {kpis.completedOrders.currentValue}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-status-info" />
              <span className="text-text-secondary">In Progress: {kpis.inProgressOrders.currentValue}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-status-warning" />
              <span className="text-text-secondary">Pending: {kpis.pendingOrders.currentValue}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-status-danger" />
              <span className="text-text-secondary">Cancelled: {kpis.cancelledOrders.currentValue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activity Stream & Dynamic AI Business Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-navy-800">
            <div>
              <h2 className="text-sm font-bold text-text-primary">Recent Operational Activity</h2>
              <p className="text-xs text-text-secondary">Audit log of key pipeline events & client transactions</p>
            </div>
            <span className="text-[11px] font-mono text-text-muted">Live Stream</span>
          </div>

          <div className="divide-y divide-navy-800/60 max-h-96 overflow-y-auto space-y-2 pr-1">
            {filteredActivities.length === 0 ? (
              <p className="text-xs text-text-muted py-6 text-center">No logged activity in this selected date window.</p>
            ) : (
              filteredActivities.map(act => (
                <div
                  key={act.id}
                  onClick={() => openDetail(act.relatedEntity.type, act.relatedEntity.id)}
                  className="pt-2.5 pb-2.5 flex items-start space-x-3 cursor-pointer hover:bg-navy-850/60 p-2 rounded-xl transition-colors group"
                >
                  <div className={`p-2 rounded-xl mt-0.5 ${
                    act.type.includes('payment') ? 'bg-status-success/10 text-status-success' :
                    act.type.includes('deal') ? 'bg-accent-blue/10 text-accent-blue' :
                    act.type.includes('order') ? 'bg-status-info/10 text-status-info' : 'bg-accent-purple/10 text-accent-purple'
                  }`}>
                    {act.type.includes('payment') ? <Wallet className="w-4 h-4" /> :
                     act.type.includes('deal') ? <TrendingUp className="w-4 h-4" /> :
                     act.type.includes('order') ? <PackageCheck className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-text-primary group-hover:text-accent-purple transition-colors truncate">
                        {act.title}
                      </h3>
                      <span className="text-[10px] text-text-muted font-mono flex-shrink-0 ml-2">
                        {formatDateTime(act.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">
                      {act.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-navy-800 text-text-muted border border-navy-750">
                        {act.relatedEntity.id}
                      </span>
                      {act.amount && (
                        <span className="text-[10px] font-semibold text-status-success font-mono">
                          {formatINR(act.amount)}
                        </span>
                      )}
                    </div>
                  </div>

                  <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-accent-purple transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dynamic Business Insights */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-navy-800">
              <div className="p-1.5 rounded-lg bg-accent-purple/15 text-accent-purple">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-text-primary">Dynamic Business Insights</h2>
                <p className="text-xs text-text-secondary">Synthesized automatically from filtered performance data</p>
              </div>
            </div>

            <div className="space-y-3">
              {dynamicInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border ${
                    insight.type === 'success' ? 'bg-status-success/5 border-status-success/20 text-status-success' :
                    insight.type === 'warning' ? 'bg-status-warning/5 border-status-warning/20 text-status-warning' :
                    'bg-status-info/5 border-status-info/20 text-status-info'
                  }`}
                >
                  <div className="flex items-start space-x-2.5">
                    {insight.type === 'success' && <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-status-success" />}
                    {insight.type === 'warning' && <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-status-warning" />}
                    {insight.type === 'info' && <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-status-info" />}
                    <div>
                      <h3 className="text-xs font-bold text-text-primary">{insight.title}</h3>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">{insight.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-navy-800 flex justify-between items-center text-xs text-text-muted">
            <span>Computed from {filteredLeads.length} leads & {filteredPayments.length} transactions</span>
            <span className="text-accent-purple font-medium flex items-center space-x-1">
              <span>Auto-synchronized</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
