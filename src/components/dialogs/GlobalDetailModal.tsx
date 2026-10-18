import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { 
  X, ExternalLink, Calendar, User, Building, Mail, Phone, 
  CreditCard, CheckCircle2, Clock, AlertCircle, RefreshCw, FileText, Briefcase, ShoppingBag
} from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { formatDateCustom, formatDateTime } from '../../utils/dates';
import { calculateLeadFinancials } from '../../utils/relationships';
import { LeadStatus, QuotationStatus, DealStatus, OrderStatus, PaymentStatus } from '../../types';

export const GlobalDetailModal: React.FC = () => {
  const { 
    activeEntity, 
    closeDetail, 
    openDetail,
    leads, 
    quotations, 
    deals, 
    orders, 
    payments, 
    settings,
    updateLeadStatus,
    updateQuotationStatus,
    updateDealStatus,
    updateOrderStatus,
    updatePaymentStatus,
  } = useDashboard();

  if (!activeEntity) return null;

  const { type, id } = activeEntity;

  const leadRecord = leads.find(l => l.id === id);
  const quotationRecord = quotations.find(q => q.id === id);
  const dealRecord = deals.find(d => d.id === id);
  const orderRecord = orders.find(o => o.id === id);
  const paymentRecord = payments.find(p => p.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl h-full bg-navy-900 border-l border-navy-750 shadow-2xl overflow-y-auto flex flex-col text-left transition-transform duration-300"
        role="dialog"
      >
        {/* Top Header */}
        <div className="p-6 border-b border-navy-800 flex items-center justify-between sticky top-0 bg-navy-900/95 backdrop-blur-md z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-navy-800 text-text-secondary border border-navy-700">
                {type.toUpperCase()}
              </span>
              <span className="text-xs font-mono text-accent-purple font-medium">{id}</span>
            </div>
            <h2 className="text-xl font-bold text-text-primary mt-1">
              {type === 'lead' && (leadRecord?.company || 'Lead Details')}
              {type === 'quotation' && (quotationRecord?.serviceCategory || 'Quotation Details')}
              {type === 'deal' && (dealRecord?.title || 'Deal Details')}
              {type === 'order' && (orderRecord?.serviceCategory || 'Order Details')}
              {type === 'payment' && (`Payment: ${formatINR(paymentRecord?.amount || 0)}`)}
            </h2>
          </div>
          <button
            onClick={closeDetail}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* ===================== LEAD DETAIL ===================== */}
          {type === 'lead' && leadRecord && (() => {
            const financials = calculateLeadFinancials(leadRecord.id, quotations, deals, orders, payments);
            const leadQuotes = quotations.filter(q => q.leadId === leadRecord.id);
            const leadDeals = deals.filter(d => d.leadId === leadRecord.id);
            const leadOrders = orders.filter(o => o.leadId === leadRecord.id);
            const leadPayments = payments.filter(p => p.leadId === leadRecord.id);

            return (
              <div className="space-y-6">
                {/* Status bar */}
                <div className="flex items-center justify-between bg-navy-850 p-4 rounded-xl border border-navy-800">
                  <div>
                    <span className="text-xs text-text-secondary block">Current Lead Status</span>
                    <span className="text-sm font-semibold text-text-primary">{leadRecord.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-text-muted">Change:</span>
                    <select
                      value={leadRecord.status}
                      onChange={(e) => updateLeadStatus(leadRecord.id, e.target.value as LeadStatus)}
                      className="bg-navy-800 text-text-primary text-xs border border-navy-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-accent-purple"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Unqualified">Unqualified</option>
                      <option value="Converted">Converted</option>
                    </select>
                  </div>
                </div>

                {/* Contact & Meta Info */}
                <div className="grid grid-cols-2 gap-4 bg-navy-850 p-4 rounded-xl border border-navy-800">
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted flex items-center">
                      <User className="w-3.5 h-3.5 mr-1 text-accent-purple" /> Primary Contact
                    </span>
                    <p className="text-sm font-medium text-text-primary">{leadRecord.name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted flex items-center">
                      <Building className="w-3.5 h-3.5 mr-1 text-accent-blue" /> Company & Industry
                    </span>
                    <p className="text-sm font-medium text-text-primary">{leadRecord.company}</p>
                    <p className="text-xs text-text-secondary">{leadRecord.industry} • {leadRecord.city}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted flex items-center">
                      <Mail className="w-3.5 h-3.5 mr-1 text-status-warning" /> Email Address
                    </span>
                    <a href={`mailto:${leadRecord.email}`} className="text-xs text-accent-blue hover:underline block truncate">
                      {leadRecord.email}
                    </a>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted flex items-center">
                      <Phone className="w-3.5 h-3.5 mr-1 text-status-success" /> Phone
                    </span>
                    <p className="text-xs font-mono text-text-primary">{leadRecord.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted">Lead Source</span>
                    <p className="text-xs font-medium text-text-primary">{leadRecord.source}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted">Assigned Account Owner</span>
                    <p className="text-xs font-medium text-text-primary">{leadRecord.assignedOwner}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted">Estimated Potential Value</span>
                    <p className="text-sm font-bold text-accent-purple">{formatINR(leadRecord.estimatedValue)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted">Created Date</span>
                    <p className="text-xs text-text-secondary">{formatDateCustom(leadRecord.createdAt, settings.dateFormat)}</p>
                  </div>
                </div>

                {leadRecord.notes && (
                  <div className="bg-navy-850 p-4 rounded-xl border border-navy-800">
                    <span className="text-xs text-text-muted block mb-1">Internal Notes</span>
                    <p className="text-xs text-text-secondary leading-relaxed">{leadRecord.notes}</p>
                  </div>
                )}

                {/* Financial Summary */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
                    Aggregated Financials & Pipeline
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-navy-850 p-3 rounded-xl border border-navy-800">
                      <span className="text-xs text-text-muted">Total Quoted Value</span>
                      <p className="text-sm font-bold text-text-primary mt-1">{formatINR(financials.totalQuotationValue)}</p>
                      <span className="text-[11px] text-text-secondary">{financials.totalQuotationsCount} quotation(s)</span>
                    </div>
                    <div className="bg-navy-850 p-3 rounded-xl border border-navy-800">
                      <span className="text-xs text-text-muted">Converted Deal Value</span>
                      <p className="text-sm font-bold text-status-success mt-1">{formatINR(financials.wonDealValue)}</p>
                      <span className="text-[11px] text-text-secondary">{financials.wonDealsCount} won deal(s)</span>
                    </div>
                    <div className="bg-navy-850 p-3 rounded-xl border border-navy-800">
                      <span className="text-xs text-text-muted">Collected Revenue</span>
                      <p className="text-sm font-bold text-accent-blue mt-1">{formatINR(financials.totalCollectedPayment)}</p>
                      <span className="text-[11px] text-text-secondary">{financials.completedOrdersCount} orders done</span>
                    </div>
                  </div>
                </div>

                {/* Associated Quotations */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center">
                      <FileText className="w-3.5 h-3.5 mr-1.5 text-accent-purple" /> Associated Quotations ({leadQuotes.length})
                    </h4>
                  </div>
                  {leadQuotes.length === 0 ? (
                    <p className="text-xs text-text-muted bg-navy-850 p-3 rounded-xl">No quotations issued yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {leadQuotes.map(q => (
                        <div
                          key={q.id}
                          onClick={() => openDetail('quotation', q.id)}
                          className="flex items-center justify-between p-3 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-800 cursor-pointer transition-colors"
                        >
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono text-accent-purple font-semibold">{q.id}</span>
                              <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                                q.status === 'Accepted' ? 'bg-status-success/10 text-status-success' :
                                q.status === 'Sent' ? 'bg-status-info/10 text-status-info' :
                                q.status === 'Draft' ? 'bg-navy-750 text-text-secondary' : 'bg-status-danger/10 text-status-danger'
                              }`}>
                                {q.status}
                              </span>
                            </div>
                            <span className="text-xs text-text-secondary mt-0.5 block">{q.serviceCategory}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-text-primary">{formatINR(q.amount)}</span>
                            <span className="text-[10px] text-text-muted block">{formatDateCustom(q.createdAt, settings.dateFormat)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Associated Deals */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 flex items-center">
                    <Briefcase className="w-3.5 h-3.5 mr-1.5 text-accent-blue" /> Associated Deals ({leadDeals.length})
                  </h4>
                  {leadDeals.length === 0 ? (
                    <p className="text-xs text-text-muted bg-navy-850 p-3 rounded-xl">No deals linked to this lead.</p>
                  ) : (
                    <div className="space-y-2">
                      {leadDeals.map(d => (
                        <div
                          key={d.id}
                          onClick={() => openDetail('deal', d.id)}
                          className="flex items-center justify-between p-3 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-800 cursor-pointer transition-colors"
                        >
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono text-accent-blue font-semibold">{d.id}</span>
                              <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                                d.status === 'Won' ? 'bg-status-success/10 text-status-success' :
                                d.status === 'Lost' ? 'bg-status-danger/10 text-status-danger' : 'bg-accent-purple/10 text-accent-purple'
                              }`}>
                                {d.status}
                              </span>
                            </div>
                            <span className="text-xs text-text-primary mt-0.5 block font-medium">{d.title}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-text-primary">{formatINR(d.dealValue)}</span>
                            <span className="text-[10px] text-text-muted block">Priority: {d.priority}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Associated Orders & Payments */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 flex items-center">
                    <ShoppingBag className="w-3.5 h-3.5 mr-1.5 text-status-success" /> Related Orders ({leadOrders.length}) & Payments ({leadPayments.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-navy-850 p-3 rounded-xl border border-navy-800">
                      <span className="text-xs text-text-muted">Total Orders Placed</span>
                      <p className="text-sm font-bold text-text-primary mt-1">{leadOrders.length} Order(s)</p>
                      <div className="mt-2 space-y-1">
                        {leadOrders.slice(0, 3).map(o => (
                          <div 
                            key={o.id}
                            onClick={() => openDetail('order', o.id)}
                            className="text-xs text-accent-blue hover:underline cursor-pointer flex justify-between"
                          >
                            <span>{o.id}</span>
                            <span className="text-text-secondary">{o.progress}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-navy-850 p-3 rounded-xl border border-navy-800">
                      <span className="text-xs text-text-muted">Total Payments Recorded</span>
                      <p className="text-sm font-bold text-text-primary mt-1">{leadPayments.length} Payment(s)</p>
                      <div className="mt-2 space-y-1">
                        {leadPayments.slice(0, 3).map(p => (
                          <div 
                            key={p.id}
                            onClick={() => openDetail('payment', p.id)}
                            className="text-xs text-accent-purple hover:underline cursor-pointer flex justify-between"
                          >
                            <span>{p.id}</span>
                            <span className="text-text-primary">{formatINR(p.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ===================== QUOTATION DETAIL ===================== */}
          {type === 'quotation' && quotationRecord && (() => {
            const linkedLead = leads.find(l => l.id === quotationRecord.leadId);
            const linkedDeal = deals.find(d => d.id === quotationRecord.linkedDealId);

            return (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-navy-850 p-4 rounded-xl border border-navy-800">
                  <div>
                    <span className="text-xs text-text-secondary block">Quotation Status</span>
                    <span className="text-sm font-semibold text-text-primary">{quotationRecord.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-text-muted">Change:</span>
                    <select
                      value={quotationRecord.status}
                      onChange={(e) => updateQuotationStatus(quotationRecord.id, e.target.value as QuotationStatus)}
                      className="bg-navy-800 text-text-primary text-xs border border-navy-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-accent-purple"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-navy-850 p-4 rounded-xl border border-navy-800">
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted">Quoted Amount</span>
                    <p className="text-lg font-bold text-accent-purple">{formatINR(quotationRecord.amount)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted">Service Category</span>
                    <p className="text-sm font-medium text-text-primary">{quotationRecord.serviceCategory}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted">Created Date</span>
                    <p className="text-xs text-text-secondary">{formatDateCustom(quotationRecord.createdAt, settings.dateFormat)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted">Expiry Date</span>
                    <p className="text-xs text-text-secondary">{formatDateCustom(quotationRecord.expiryDate, settings.dateFormat)}</p>
                  </div>
                </div>

                {quotationRecord.terms && (
                  <div className="bg-navy-850 p-4 rounded-xl border border-navy-800">
                    <span className="text-xs text-text-muted block mb-1">Commercial Terms & Scope</span>
                    <p className="text-xs text-text-secondary leading-relaxed">{quotationRecord.terms}</p>
                  </div>
                )}

                {/* Linked Lead Card */}
                {linkedLead && (
                  <div className="bg-navy-850 p-4 rounded-xl border border-navy-800">
                    <span className="text-xs text-text-muted block mb-2">Associated Lead Account</span>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary">{linkedLead.company}</h4>
                        <p className="text-xs text-text-secondary">{linkedLead.name} • {linkedLead.email}</p>
                      </div>
                      <button
                        onClick={() => openDetail('lead', linkedLead.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-800 hover:bg-navy-750 text-accent-blue border border-navy-700 flex items-center space-x-1"
                      >
                        <span>View Lead</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Linked Deal Card */}
                {linkedDeal && (
                  <div className="bg-navy-850 p-4 rounded-xl border border-navy-800">
                    <span className="text-xs text-text-muted block mb-2">Associated Deal Record</span>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary">{linkedDeal.title}</h4>
                        <p className="text-xs text-text-secondary">Value: {formatINR(linkedDeal.dealValue)} • Status: {linkedDeal.status}</p>
                      </div>
                      <button
                        onClick={() => openDetail('deal', linkedDeal.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-800 hover:bg-navy-750 text-accent-purple border border-navy-700 flex items-center space-x-1"
                      >
                        <span>View Deal</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ===================== DEAL DETAIL ===================== */}
          {type === 'deal' && dealRecord && (() => {
            const linkedLead = leads.find(l => l.id === dealRecord.leadId);
            const dealOrders = orders.filter(o => o.dealId === dealRecord.id);
            const dealPayments = payments.filter(p => p.dealId === dealRecord.id);
            const collectedDealRevenue = dealPayments
              .filter(p => p.status === 'Successful')
              .reduce((acc, p) => acc + p.amount, 0);

            return (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-navy-850 p-4 rounded-xl border border-navy-800">
                  <div>
                    <span className="text-xs text-text-secondary block">Deal Status</span>
                    <span className="text-sm font-semibold text-text-primary">{dealRecord.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-text-muted">Change:</span>
                    <select
                      value={dealRecord.status}
                      onChange={(e) => updateDealStatus(dealRecord.id, e.target.value as DealStatus)}
                      className="bg-navy-800 text-text-primary text-xs border border-navy-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-accent-purple"
                    >
                      <option value="New">New</option>
                      <option value="Proposal">Proposal</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Won">Won</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-navy-850 p-4 rounded-xl border border-navy-800">
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted">Deal Contract Value</span>
                    <p className="text-lg font-bold text-status-success">{formatINR(dealRecord.dealValue)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted">Collected Revenue</span>
                    <p className="text-lg font-bold text-accent-blue">{formatINR(collectedDealRevenue)}</p>
                    <span className="text-[11px] text-text-secondary">
                      Remaining: {formatINR(Math.max(0, dealRecord.dealValue - collectedDealRevenue))}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted">Deal Priority</span>
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${
                      dealRecord.priority === 'High' ? 'bg-status-danger/10 text-status-danger' :
                      dealRecord.priority === 'Medium' ? 'bg-status-warning/10 text-status-warning' : 'bg-status-info/10 text-status-info'
                    }`}>
                      {dealRecord.priority}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted">Deal Owner</span>
                    <p className="text-xs font-medium text-text-primary">{dealRecord.owner}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted">Expected Close</span>
                    <p className="text-xs text-text-secondary">{formatDateCustom(dealRecord.expectedCloseDate, settings.dateFormat)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted">Actual Close Date</span>
                    <p className="text-xs text-text-secondary">{dealRecord.actualCloseDate ? formatDateCustom(dealRecord.actualCloseDate, settings.dateFormat) : 'In Progress'}</p>
                  </div>
                </div>

                {dealRecord.notes && (
                  <div className="bg-navy-850 p-4 rounded-xl border border-navy-800">
                    <span className="text-xs text-text-muted block mb-1">Deal Notes</span>
                    <p className="text-xs text-text-secondary leading-relaxed">{dealRecord.notes}</p>
                  </div>
                )}

                {/* Linked Lead */}
                {linkedLead && (
                  <div className="bg-navy-850 p-4 rounded-xl border border-navy-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-text-muted block">Client Lead Account</span>
                      <h4 className="text-sm font-semibold text-text-primary">{linkedLead.company}</h4>
                      <p className="text-xs text-text-secondary">{linkedLead.name} • {linkedLead.city}</p>
                    </div>
                    <button
                      onClick={() => openDetail('lead', linkedLead.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-800 hover:bg-navy-750 text-accent-blue border border-navy-700 flex items-center space-x-1"
                    >
                      <span>View Lead</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Related Orders */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    Orders Belonging to this Deal ({dealOrders.length})
                  </h4>
                  {dealOrders.length === 0 ? (
                    <p className="text-xs text-text-muted bg-navy-850 p-3 rounded-xl">No orders executed under this deal.</p>
                  ) : (
                    <div className="space-y-2">
                      {dealOrders.map(o => (
                        <div
                          key={o.id}
                          onClick={() => openDetail('order', o.id)}
                          className="flex items-center justify-between p-3 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-800 cursor-pointer transition-colors"
                        >
                          <div>
                            <span className="text-xs font-mono text-status-success font-semibold">{o.id}</span>
                            <span className="text-xs text-text-primary font-medium block">{o.serviceCategory}</span>
                            <span className="text-[10px] text-text-muted">Progress: {o.progress}% • {o.status}</span>
                          </div>
                          <span className="text-sm font-semibold text-text-primary">{formatINR(o.orderAmount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Related Payments */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    Payments Received or Scheduled ({dealPayments.length})
                  </h4>
                  {dealPayments.length === 0 ? (
                    <p className="text-xs text-text-muted bg-navy-850 p-3 rounded-xl">No payments logged yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {dealPayments.map(p => (
                        <div
                          key={p.id}
                          onClick={() => openDetail('payment', p.id)}
                          className="flex items-center justify-between p-3 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-800 cursor-pointer transition-colors"
                        >
                          <div>
                            <span className="text-xs font-mono text-accent-purple font-semibold">{p.id}</span>
                            <span className="text-xs text-text-secondary block">{p.paymentMethod} • {formatDateCustom(p.paymentDate, settings.dateFormat)}</span>
                            <span className={`text-[10px] font-medium ${
                              p.status === 'Successful' ? 'text-status-success' :
                              p.status === 'Pending' ? 'text-status-warning' : 'text-status-danger'
                            }`}>{p.status}</span>
                          </div>
                          <span className="text-sm font-semibold text-text-primary">{formatINR(p.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ===================== ORDER DETAIL ===================== */}
          {type === 'order' && orderRecord && (() => {
            const linkedDeal = deals.find(d => d.id === orderRecord.dealId);
            const linkedLead = leads.find(l => l.id === orderRecord.leadId);
            const orderPayments = payments.filter(p => p.orderId === orderRecord.id);

            return (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-navy-850 p-4 rounded-xl border border-navy-800">
                  <div>
                    <span className="text-xs text-text-secondary block">Order Status</span>
                    <span className="text-sm font-semibold text-text-primary">{orderRecord.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-text-muted">Change:</span>
                    <select
                      value={orderRecord.status}
                      onChange={(e) => updateOrderStatus(orderRecord.id, e.target.value as OrderStatus)}
                      className="bg-navy-800 text-text-primary text-xs border border-navy-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-accent-purple"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-navy-850 p-4 rounded-xl border border-navy-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-muted">Execution Progress</span>
                    <span className="font-semibold text-text-primary">{orderRecord.progress}%</span>
                  </div>
                  <div className="w-full bg-navy-950 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-accent-purple to-accent-blue h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${orderRecord.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-navy-850 p-4 rounded-xl border border-navy-800">
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted">Order Amount</span>
                    <p className="text-lg font-bold text-text-primary">{formatINR(orderRecord.orderAmount)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted">Service Scope</span>
                    <p className="text-sm font-medium text-text-primary">{orderRecord.serviceCategory}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted">Start Date</span>
                    <p className="text-xs text-text-secondary">{formatDateCustom(orderRecord.startDate, settings.dateFormat)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted">Target Due Date</span>
                    <p className="text-xs text-text-secondary">{formatDateCustom(orderRecord.dueDate, settings.dateFormat)}</p>
                  </div>
                  {orderRecord.completionDate && (
                    <div className="space-y-1 col-span-2">
                      <span className="text-xs text-text-muted">Delivered On</span>
                      <p className="text-xs text-status-success font-semibold">{formatDateCustom(orderRecord.completionDate, settings.dateFormat)}</p>
                    </div>
                  )}
                </div>

                {orderRecord.deliveryNotes && (
                  <div className="bg-navy-850 p-4 rounded-xl border border-navy-800">
                    <span className="text-xs text-text-muted block mb-1">Delivery Notes</span>
                    <p className="text-xs text-text-secondary leading-relaxed">{orderRecord.deliveryNotes}</p>
                  </div>
                )}

                {/* Linked Deal and Lead cards */}
                <div className="grid grid-cols-2 gap-3">
                  {linkedDeal && (
                    <div className="bg-navy-850 p-3 rounded-xl border border-navy-800">
                      <span className="text-xs text-text-muted block">Linked Deal</span>
                      <h4 className="text-xs font-semibold text-text-primary mt-1 truncate">{linkedDeal.title}</h4>
                      <button
                        onClick={() => openDetail('deal', linkedDeal.id)}
                        className="text-xs text-accent-blue hover:underline mt-2 inline-flex items-center space-x-1"
                      >
                        <span>Open Deal ({linkedDeal.id})</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                  {linkedLead && (
                    <div className="bg-navy-850 p-3 rounded-xl border border-navy-800">
                      <span className="text-xs text-text-muted block">Customer Account</span>
                      <h4 className="text-xs font-semibold text-text-primary mt-1 truncate">{linkedLead.company}</h4>
                      <button
                        onClick={() => openDetail('lead', linkedLead.id)}
                        className="text-xs text-accent-purple hover:underline mt-2 inline-flex items-center space-x-1"
                      >
                        <span>Open Lead ({linkedLead.id})</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Associated Payments */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    Direct Payments Against this Order ({orderPayments.length})
                  </h4>
                  {orderPayments.length === 0 ? (
                    <p className="text-xs text-text-muted bg-navy-850 p-3 rounded-xl">No payments directly tagged to this order.</p>
                  ) : (
                    <div className="space-y-2">
                      {orderPayments.map(p => (
                        <div
                          key={p.id}
                          onClick={() => openDetail('payment', p.id)}
                          className="flex items-center justify-between p-3 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-800 cursor-pointer transition-colors"
                        >
                          <div>
                            <span className="text-xs font-mono text-accent-purple font-semibold">{p.id}</span>
                            <span className="text-xs text-text-secondary block">{p.paymentMethod} • {formatDateCustom(p.paymentDate, settings.dateFormat)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-text-primary">{formatINR(p.amount)}</span>
                            <span className="text-[10px] text-status-success block">{p.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ===================== PAYMENT DETAIL ===================== */}
          {type === 'payment' && paymentRecord && (() => {
            const linkedDeal = deals.find(d => d.id === paymentRecord.dealId);
            const linkedOrder = orders.find(o => o.id === paymentRecord.orderId);
            const linkedLead = leads.find(l => l.id === paymentRecord.leadId);

            return (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-navy-850 p-4 rounded-xl border border-navy-800">
                  <div>
                    <span className="text-xs text-text-secondary block">Transaction Status</span>
                    <span className={`text-sm font-semibold ${
                      paymentRecord.status === 'Successful' ? 'text-status-success' :
                      paymentRecord.status === 'Pending' ? 'text-status-warning' : 'text-status-danger'
                    }`}>
                      {paymentRecord.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-text-muted">Change:</span>
                    <select
                      value={paymentRecord.status}
                      onChange={(e) => updatePaymentStatus(paymentRecord.id, e.target.value as PaymentStatus)}
                      className="bg-navy-800 text-text-primary text-xs border border-navy-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-accent-purple"
                    >
                      <option value="Successful">Successful</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-navy-850 p-4 rounded-xl border border-navy-800">
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted">Payment Amount</span>
                    <p className="text-xl font-bold text-accent-purple">{formatINR(paymentRecord.amount)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted">Payment Method</span>
                    <p className="text-sm font-medium text-text-primary">{paymentRecord.paymentMethod}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted">Payment Date</span>
                    <p className="text-xs text-text-secondary">{formatDateCustom(paymentRecord.paymentDate, settings.dateFormat)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted">Due Date</span>
                    <p className="text-xs text-text-secondary">{formatDateCustom(paymentRecord.dueDate, settings.dateFormat)}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-xs text-text-muted">Transaction Reference ID</span>
                    <p className="text-xs font-mono text-accent-blue bg-navy-900 p-2 rounded-lg border border-navy-800 truncate">
                      {paymentRecord.transactionRef}
                    </p>
                  </div>
                </div>

                {paymentRecord.notes && (
                  <div className="bg-navy-850 p-4 rounded-xl border border-navy-800">
                    <span className="text-xs text-text-muted block mb-1">Transaction Remarks</span>
                    <p className="text-xs text-text-secondary leading-relaxed">{paymentRecord.notes}</p>
                  </div>
                )}

                {/* Related entities */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Linked Commercial Records
                  </h4>
                  {linkedLead && (
                    <div className="bg-navy-850 p-3 rounded-xl border border-navy-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-text-muted">Client Lead</span>
                        <h5 className="text-xs font-semibold text-text-primary">{linkedLead.company}</h5>
                      </div>
                      <button
                        onClick={() => openDetail('lead', linkedLead.id)}
                        className="text-xs text-accent-blue hover:underline flex items-center space-x-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                  {linkedDeal && (
                    <div className="bg-navy-850 p-3 rounded-xl border border-navy-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-text-muted">Deal Reference</span>
                        <h5 className="text-xs font-semibold text-text-primary">{linkedDeal.title}</h5>
                      </div>
                      <button
                        onClick={() => openDetail('deal', linkedDeal.id)}
                        className="text-xs text-accent-purple hover:underline flex items-center space-x-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                  {linkedOrder && (
                    <div className="bg-navy-850 p-3 rounded-xl border border-navy-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-text-muted">Order Reference</span>
                        <h5 className="text-xs font-semibold text-text-primary">{linkedOrder.id} ({linkedOrder.serviceCategory})</h5>
                      </div>
                      <button
                        onClick={() => openDetail('order', linkedOrder.id)}
                        className="text-xs text-status-success hover:underline flex items-center space-x-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-navy-800 bg-navy-900/95 sticky bottom-0 flex justify-end">
          <button
            onClick={closeDetail}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-navy-800 hover:bg-navy-750 text-text-primary border border-navy-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
