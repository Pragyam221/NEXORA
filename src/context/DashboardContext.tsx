import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Lead, Quotation, Deal, Order, Payment, ActivityEvent, 
  DateRangeOption, DateRange, UserSettings, NotificationItem,
  LeadStatus, QuotationStatus, DealStatus, DealPriority, OrderStatus, PaymentStatus, MetricComparison
} from '../types';
import { initialLeads } from '../data/leads';
import { initialQuotations } from '../data/quotations';
import { initialDeals } from '../data/deals';
import { initialOrders } from '../data/orders';
import { initialPayments } from '../data/payments';
import { initialActivities } from '../data/activity';
import { initialNotifications } from '../data/notifications';
import { resolveDateRange, isDateInRange, ANCHOR_DATE } from '../utils/dates';
import { calculateComparison } from '../utils/analytics';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'danger';
  title: string;
  message?: string;
}

export interface UnifiedKPIs {
  // Leads
  totalLeads: MetricComparison;
  qualifiedLeads: MetricComparison;
  convertedLeads: MetricComparison;
  unqualifiedLeads: MetricComparison;
  leadConversionRate: MetricComparison; // percentage

  // Quotations
  totalQuotations: MetricComparison;
  totalQuotedValue: MetricComparison;
  acceptedQuotations: MetricComparison;
  pendingQuotations: MetricComparison;
  rejectedQuotations: MetricComparison;
  quoteConversionRate: MetricComparison; // percentage

  // Deals & Revenue
  totalDeals: MetricComparison;
  wonDeals: MetricComparison;
  lostDeals: MetricComparison;
  openDeals: MetricComparison;
  winRate: MetricComparison; // percentage
  totalDealValue: MetricComparison; // sum of all deal values
  collectedRevenue: MetricComparison; // sum of successful payments
  outstandingBalance: MetricComparison; // won deal value - collected revenue

  // Orders
  totalOrders: MetricComparison;
  pendingOrders: MetricComparison;
  inProgressOrders: MetricComparison;
  completedOrders: MetricComparison;
  cancelledOrders: MetricComparison;

  // Payments
  totalPayments: MetricComparison;
  collectedAmount: MetricComparison;
  pendingAmount: MetricComparison;
  failedPaymentsCount: MetricComparison;
  overdueAmount: MetricComparison;
}

interface ActiveEntityModal {
  type: 'lead' | 'quotation' | 'deal' | 'order' | 'payment';
  id: string;
}

interface DashboardContextType {
  // Raw Data
  leads: Lead[];
  quotations: Quotation[];
  deals: Deal[];
  orders: Order[];
  payments: Payment[];
  activities: ActivityEvent[];
  notifications: NotificationItem[];
  settings: UserSettings;

  // Date Filter
  dateRangeOption: DateRangeOption;
  customRange: { startDate: string; endDate: string };
  appliedCustomRange: { startDate: string; endDate: string };
  currentRange: DateRange;
  previousRange: DateRange;
  setDateRangeOption: (opt: DateRangeOption) => void;
  setCustomRange: (range: { startDate: string; endDate: string }) => void;
  applyCustomRange: () => boolean;
  resetDateRange: () => void;

  // Search & Global Navigation
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  activeEntity: ActiveEntityModal | null;
  openDetail: (type: 'lead' | 'quotation' | 'deal' | 'order' | 'payment', id: string) => void;
  closeDetail: () => void;

  // Filtered Datasets based on current active date range
  filteredLeads: Lead[];
  filteredQuotations: Quotation[];
  filteredDeals: Deal[];
  filteredOrders: Order[];
  filteredPayments: Payment[];
  filteredActivities: ActivityEvent[];

  // Previous period filtered datasets
  prevLeads: Lead[];
  prevQuotations: Quotation[];
  prevDeals: Deal[];
  prevOrders: Order[];
  prevPayments: Payment[];

  // Calculated Unified KPIs
  kpis: UnifiedKPIs;

  // CRUD Actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => string;
  updateLead: (lead: Lead) => void;
  deleteLead: (id: string) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;

  addQuotation: (quotation: Omit<Quotation, 'id' | 'createdAt'>) => string;
  updateQuotation: (quotation: Quotation) => void;
  deleteQuotation: (id: string) => void;
  updateQuotationStatus: (id: string, status: QuotationStatus) => void;

  addDeal: (deal: Omit<Deal, 'id'>) => string;
  updateDeal: (deal: Deal) => void;
  deleteDeal: (id: string) => void;
  updateDealStatus: (id: string, status: DealStatus) => void;
  updateDealPriority: (id: string, priority: DealPriority) => void;

  addOrder: (order: Omit<Order, 'id'>) => string;
  updateOrder: (order: Order) => void;
  deleteOrder: (id: string) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateOrderProgress: (id: string, progress: number) => void;

  addPayment: (payment: Omit<Payment, 'id'>) => string;
  updatePaymentStatus: (id: string, status: PaymentStatus) => void;
  deletePayment: (id: string) => void;

  // Notifications & Feedback
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  dismissToast: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  // Settings & Demo State
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetDemoData: () => void;
  refreshDashboard: () => void;
  refreshCount: number;
}

const STORAGE_KEY_PREFIX = 'nexora_v1_';

const defaultSettings: UserSettings = {
  theme: 'dark',
  density: 'comfortable',
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  pageSize: 10,
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or fall back to fixtures
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}leads`);
    return saved ? JSON.parse(saved) : initialLeads;
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}quotations`);
    return saved ? JSON.parse(saved) : initialQuotations;
  });

  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}deals`);
    return saved ? JSON.parse(saved) : initialDeals;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}orders`);
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}payments`);
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [activities, setActivities] = useState<ActivityEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}activities`);
    return saved ? JSON.parse(saved) : initialActivities;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}notifications`);
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}settings`);
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // Date Filter State
  const [dateRangeOption, setDateRangeOption] = useState<DateRangeOption>('last30');
  const [customRange, setCustomRange] = useState({
    startDate: '2026-09-01',
    endDate: ANCHOR_DATE,
  });
  const [appliedCustomRange, setAppliedCustomRange] = useState({
    startDate: '2026-09-01',
    endDate: ANCHOR_DATE,
  });

  // Navigation & Search
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [activeEntity, setActiveEntity] = useState<ActiveEntityModal | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}leads`, JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}quotations`, JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}deals`, JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}orders`, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}payments`, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}activities`, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}settings`, JSON.stringify(settings));
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Toast Helpers
  const addToast = useCallback((type: ToastMessage['type'], title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Date Range Resolutions
  const { current: currentRange, previous: previousRange } = useMemo(() => {
    return resolveDateRange(dateRangeOption, dateRangeOption === 'custom' ? appliedCustomRange : undefined);
  }, [dateRangeOption, appliedCustomRange]);

  const applyCustomRange = useCallback(() => {
    if (!customRange.startDate || !customRange.endDate) {
      addToast('warning', 'Invalid Date Range', 'Please select both start and end dates.');
      return false;
    }
    if (customRange.endDate < customRange.startDate) {
      addToast('danger', 'Invalid Range Order', 'End date cannot be earlier than start date.');
      return false;
    }
    setAppliedCustomRange(customRange);
    setDateRangeOption('custom');
    addToast('success', 'Custom Date Filter Applied', `${customRange.startDate} to ${customRange.endDate}`);
    return true;
  }, [customRange, addToast]);

  const resetDateRange = useCallback(() => {
    setDateRangeOption('last30');
    setCustomRange({ startDate: '2026-09-01', endDate: ANCHOR_DATE });
    setAppliedCustomRange({ startDate: '2026-09-01', endDate: ANCHOR_DATE });
    addToast('info', 'Date Range Reset', 'Reporting period set to Last 30 Days.');
  }, [addToast]);

  // Open and close detail views
  const openDetail = useCallback((type: 'lead' | 'quotation' | 'deal' | 'order' | 'payment', id: string) => {
    setActiveEntity({ type, id });
  }, []);

  const closeDetail = useCallback(() => {
    setActiveEntity(null);
  }, []);

  // Filtered Datasets based on date range
  const filteredLeads = useMemo(() => {
    return leads.filter(l => isDateInRange(l.createdAt, currentRange.startDate, currentRange.endDate));
  }, [leads, currentRange]);

  const prevLeads = useMemo(() => {
    return leads.filter(l => isDateInRange(l.createdAt, previousRange.startDate, previousRange.endDate));
  }, [leads, previousRange]);

  const filteredQuotations = useMemo(() => {
    return quotations.filter(q => isDateInRange(q.createdAt, currentRange.startDate, currentRange.endDate));
  }, [quotations, currentRange]);

  const prevQuotations = useMemo(() => {
    return quotations.filter(q => isDateInRange(q.createdAt, previousRange.startDate, previousRange.endDate));
  }, [quotations, previousRange]);

  const filteredDeals = useMemo(() => {
    // A deal is in scope if its expected or actual close date or creation aligns
    return deals.filter(d => {
      const targetDate = d.actualCloseDate || d.expectedCloseDate;
      return isDateInRange(targetDate, currentRange.startDate, currentRange.endDate);
    });
  }, [deals, currentRange]);

  const prevDeals = useMemo(() => {
    return deals.filter(d => {
      const targetDate = d.actualCloseDate || d.expectedCloseDate;
      return isDateInRange(targetDate, previousRange.startDate, previousRange.endDate);
    });
  }, [deals, previousRange]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => isDateInRange(o.startDate, currentRange.startDate, currentRange.endDate));
  }, [orders, currentRange]);

  const prevOrders = useMemo(() => {
    return orders.filter(o => isDateInRange(o.startDate, previousRange.startDate, previousRange.endDate));
  }, [orders, previousRange]);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => isDateInRange(p.paymentDate, currentRange.startDate, currentRange.endDate));
  }, [payments, currentRange]);

  const prevPayments = useMemo(() => {
    return payments.filter(p => isDateInRange(p.paymentDate, previousRange.startDate, previousRange.endDate));
  }, [payments, previousRange]);

  const filteredActivities = useMemo(() => {
    return activities.filter(a => isDateInRange(a.timestamp.slice(0, 10), currentRange.startDate, currentRange.endDate));
  }, [activities, currentRange]);

  // Unified Canonical KPIs Calculation
  const kpis = useMemo<UnifiedKPIs>(() => {
    // 1. Leads
    const totalLeadsCur = filteredLeads.length;
    const totalLeadsPrev = prevLeads.length;
    const qualLeadsCur = filteredLeads.filter(l => l.status === 'Qualified' || l.status === 'Converted').length;
    const qualLeadsPrev = prevLeads.filter(l => l.status === 'Qualified' || l.status === 'Converted').length;
    const convLeadsCur = filteredLeads.filter(l => l.status === 'Converted').length;
    const convLeadsPrev = prevLeads.filter(l => l.status === 'Converted').length;
    const unqualLeadsCur = filteredLeads.filter(l => l.status === 'Unqualified').length;
    const unqualLeadsPrev = prevLeads.filter(l => l.status === 'Unqualified').length;
    
    const leadConvRateCur = totalLeadsCur > 0 ? (convLeadsCur / totalLeadsCur) * 100 : 0;
    const leadConvRatePrev = totalLeadsPrev > 0 ? (convLeadsPrev / totalLeadsPrev) * 100 : 0;

    // 2. Quotations
    const totalQuotesCur = filteredQuotations.length;
    const totalQuotesPrev = prevQuotations.length;
    const totalQuotedValCur = filteredQuotations.reduce((acc, q) => acc + q.amount, 0);
    const totalQuotedValPrev = prevQuotations.reduce((acc, q) => acc + q.amount, 0);
    const accQuotesCur = filteredQuotations.filter(q => q.status === 'Accepted').length;
    const accQuotesPrev = prevQuotations.filter(q => q.status === 'Accepted').length;
    const pendQuotesCur = filteredQuotations.filter(q => q.status === 'Sent' || q.status === 'Draft').length;
    const pendQuotesPrev = prevQuotations.filter(q => q.status === 'Sent' || q.status === 'Draft').length;
    const rejQuotesCur = filteredQuotations.filter(q => q.status === 'Rejected' || q.status === 'Expired').length;
    const rejQuotesPrev = prevQuotations.filter(q => q.status === 'Rejected' || q.status === 'Expired').length;

    // Eligible quotations denominator: exclude Drafts for official quote-to-deal conversion
    const eligibleQuotesCur = filteredQuotations.filter(q => q.status !== 'Draft').length;
    const eligibleQuotesPrev = prevQuotations.filter(q => q.status !== 'Draft').length;
    const quoteConvRateCur = eligibleQuotesCur > 0 ? (accQuotesCur / eligibleQuotesCur) * 100 : 0;
    const quoteConvRatePrev = eligibleQuotesPrev > 0 ? (accQuotesPrev / eligibleQuotesPrev) * 100 : 0;

    // 3. Deals & Revenue
    const totalDealsCur = filteredDeals.length;
    const totalDealsPrev = prevDeals.length;
    const wonDealsCur = filteredDeals.filter(d => d.status === 'Won').length;
    const wonDealsPrev = prevDeals.filter(d => d.status === 'Won').length;
    const lostDealsCur = filteredDeals.filter(d => d.status === 'Lost').length;
    const lostDealsPrev = prevDeals.filter(d => d.status === 'Lost').length;
    const openDealsCur = filteredDeals.filter(d => d.status === 'New' || d.status === 'Proposal' || d.status === 'Negotiation').length;
    const openDealsPrev = prevDeals.filter(d => d.status === 'New' || d.status === 'Proposal' || d.status === 'Negotiation').length;

    const closedDealsCur = wonDealsCur + lostDealsCur;
    const closedDealsPrev = wonDealsPrev + lostDealsPrev;
    const winRateCur = closedDealsCur > 0 ? (wonDealsCur / closedDealsCur) * 100 : (totalDealsCur > 0 ? (wonDealsCur / totalDealsCur) * 100 : 0);
    const winRatePrev = closedDealsPrev > 0 ? (wonDealsPrev / closedDealsPrev) * 100 : (totalDealsPrev > 0 ? (wonDealsPrev / totalDealsPrev) * 100 : 0);

    const totalDealValCur = filteredDeals.reduce((acc, d) => acc + d.dealValue, 0);
    const totalDealValPrev = prevDeals.reduce((acc, d) => acc + d.dealValue, 0);

    // Revenue Rule: Collected Revenue is solely from Successful payments in period (minus refunds if any)
    const collectedRevCur = filteredPayments
      .filter(p => p.status === 'Successful')
      .reduce((acc, p) => acc + p.amount, 0);
    const collectedRevPrev = prevPayments
      .filter(p => p.status === 'Successful')
      .reduce((acc, p) => acc + p.amount, 0);

    // Won Deal Value in period
    const wonDealValCur = filteredDeals.filter(d => d.status === 'Won').reduce((acc, d) => acc + d.dealValue, 0);
    const wonDealValPrev = prevDeals.filter(d => d.status === 'Won').reduce((acc, d) => acc + d.dealValue, 0);

    // Outstanding Balance = Won Deal Value - Collected Payments (non-negative)
    const outstandingCur = Math.max(0, wonDealValCur - collectedRevCur);
    const outstandingPrev = Math.max(0, wonDealValPrev - collectedRevPrev);

    // 4. Orders
    const totalOrdersCur = filteredOrders.length;
    const totalOrdersPrev = prevOrders.length;
    const pendingOrdersCur = filteredOrders.filter(o => o.status === 'Pending').length;
    const pendingOrdersPrev = prevOrders.filter(o => o.status === 'Pending').length;
    const inProgOrdersCur = filteredOrders.filter(o => o.status === 'In Progress').length;
    const inProgOrdersPrev = prevOrders.filter(o => o.status === 'In Progress').length;
    const compOrdersCur = filteredOrders.filter(o => o.status === 'Completed').length;
    const compOrdersPrev = prevOrders.filter(o => o.status === 'Completed').length;
    const cancOrdersCur = filteredOrders.filter(o => o.status === 'Cancelled').length;
    const cancOrdersPrev = prevOrders.filter(o => o.status === 'Cancelled').length;

    // 5. Payments
    const totalPaymentsCur = filteredPayments.length;
    const totalPaymentsPrev = prevPayments.length;
    const pendAmountCur = filteredPayments.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0);
    const pendAmountPrev = prevPayments.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0);
    const failedCountCur = filteredPayments.filter(p => p.status === 'Failed').length;
    const failedCountPrev = prevPayments.filter(p => p.status === 'Failed').length;
    
    // Overdue is pending payments where dueDate is earlier than current anchor date
    const overdueCur = filteredPayments
      .filter(p => p.status === 'Pending' && p.dueDate < ANCHOR_DATE)
      .reduce((acc, p) => acc + p.amount, 0);
    const overduePrev = prevPayments
      .filter(p => p.status === 'Pending' && p.dueDate < previousRange.endDate)
      .reduce((acc, p) => acc + p.amount, 0);

    return {
      totalLeads: calculateComparison(totalLeadsCur, totalLeadsPrev, true),
      qualifiedLeads: calculateComparison(qualLeadsCur, qualLeadsPrev, true),
      convertedLeads: calculateComparison(convLeadsCur, convLeadsPrev, true),
      unqualifiedLeads: calculateComparison(unqualLeadsCur, unqualLeadsPrev, false),
      leadConversionRate: calculateComparison(leadConvRateCur, leadConvRatePrev, true),

      totalQuotations: calculateComparison(totalQuotesCur, totalQuotesPrev, true),
      totalQuotedValue: calculateComparison(totalQuotedValCur, totalQuotedValPrev, true),
      acceptedQuotations: calculateComparison(accQuotesCur, accQuotesPrev, true),
      pendingQuotations: calculateComparison(pendQuotesCur, pendQuotesPrev, false),
      rejectedQuotations: calculateComparison(rejQuotesCur, rejQuotesPrev, false),
      quoteConversionRate: calculateComparison(quoteConvRateCur, quoteConvRatePrev, true),

      totalDeals: calculateComparison(totalDealsCur, totalDealsPrev, true),
      wonDeals: calculateComparison(wonDealsCur, wonDealsPrev, true),
      lostDeals: calculateComparison(lostDealsCur, lostDealsPrev, false),
      openDeals: calculateComparison(openDealsCur, openDealsPrev, true),
      winRate: calculateComparison(winRateCur, winRatePrev, true),
      totalDealValue: calculateComparison(totalDealValCur, totalDealValPrev, true),
      collectedRevenue: calculateComparison(collectedRevCur, collectedRevPrev, true),
      outstandingBalance: calculateComparison(outstandingCur, outstandingPrev, false),

      totalOrders: calculateComparison(totalOrdersCur, totalOrdersPrev, true),
      pendingOrders: calculateComparison(pendingOrdersCur, pendingOrdersPrev, false),
      inProgressOrders: calculateComparison(inProgOrdersCur, inProgOrdersPrev, true),
      completedOrders: calculateComparison(compOrdersCur, compOrdersPrev, true),
      cancelledOrders: calculateComparison(cancOrdersCur, cancOrdersPrev, false),

      totalPayments: calculateComparison(totalPaymentsCur, totalPaymentsPrev, true),
      collectedAmount: calculateComparison(collectedRevCur, collectedRevPrev, true),
      pendingAmount: calculateComparison(pendAmountCur, pendAmountPrev, false),
      failedPaymentsCount: calculateComparison(failedCountCur, failedCountPrev, false),
      overdueAmount: calculateComparison(overdueCur, overduePrev, false),
    };
  }, [
    filteredLeads, prevLeads,
    filteredQuotations, prevQuotations,
    filteredDeals, prevDeals,
    filteredOrders, prevOrders,
    filteredPayments, prevPayments,
    previousRange
  ]);

  // CRUD Implementations

  // Leads
  const addLead = useCallback((data: Omit<Lead, 'id' | 'createdAt'>): string => {
    const nextNum = leads.length + 1001;
    const newId = `LD-${nextNum}`;
    const newLead: Lead = {
      ...data,
      id: newId,
      createdAt: ANCHOR_DATE,
    };
    setLeads(prev => [newLead, ...prev]);
    // Create activity
    const newActivity: ActivityEvent = {
      id: `ACT-${Date.now()}`,
      timestamp: `${ANCHOR_DATE}T12:00:00`,
      type: 'lead_created',
      title: `New Lead Created — ${newLead.company}`,
      description: `${newLead.name} added as a ${newLead.status} lead.`,
      amount: newLead.estimatedValue,
      relatedEntity: { type: 'lead', id: newId },
    };
    setActivities(prev => [newActivity, ...prev]);
    addToast('success', 'Lead Created', `Added ${newLead.company} (${newId})`);
    return newId;
  }, [leads.length, addToast]);

  const updateLead = useCallback((lead: Lead) => {
    setLeads(prev => prev.map(l => l.id === lead.id ? lead : l));
    addToast('success', 'Lead Updated', `Updated information for ${lead.company}`);
  }, [addToast]);

  const deleteLead = useCallback((id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    addToast('info', 'Lead Deleted', `Record ${id} removed.`);
  }, [addToast]);

  const updateLeadStatus = useCallback((id: string, status: LeadStatus) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    addToast('success', 'Status Updated', `Lead ${id} status set to ${status}`);
  }, [addToast]);

  // Quotations
  const addQuotation = useCallback((data: Omit<Quotation, 'id' | 'createdAt'>): string => {
    const nextNum = quotations.length + 2001;
    const newId = `QT-${nextNum}`;
    const newQuotation: Quotation = {
      ...data,
      id: newId,
      createdAt: ANCHOR_DATE,
    };
    setQuotations(prev => [newQuotation, ...prev]);
    const newActivity: ActivityEvent = {
      id: `ACT-${Date.now()}`,
      timestamp: `${ANCHOR_DATE}T12:05:00`,
      type: 'quotation_sent',
      title: `Quotation Sent — ${newQuotation.leadName}`,
      description: `Quotation ${newId} created for ${newQuotation.serviceCategory}`,
      amount: newQuotation.amount,
      relatedEntity: { type: 'quotation', id: newId }
    };
    setActivities(prev => [newActivity, ...prev]);
    addToast('success', 'Quotation Generated', `Quotation ${newId} created successfully`);
    return newId;
  }, [quotations.length, addToast]);

  const updateQuotation = useCallback((quotation: Quotation) => {
    setQuotations(prev => prev.map(q => q.id === quotation.id ? quotation : q));
    addToast('success', 'Quotation Updated', `Updated ${quotation.id}`);
  }, [addToast]);

  const deleteQuotation = useCallback((id: string) => {
    setQuotations(prev => prev.filter(q => q.id !== id));
    addToast('info', 'Quotation Deleted', `Quotation ${id} has been removed.`);
  }, [addToast]);

  const updateQuotationStatus = useCallback((id: string, status: QuotationStatus) => {
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, status } : q));
    addToast('success', 'Quotation Status Updated', `Quotation ${id} marked as ${status}`);
  }, [addToast]);

  // Deals
  const addDeal = useCallback((data: Omit<Deal, 'id'>): string => {
    const nextNum = deals.length + 3001;
    const newId = `DL-${nextNum}`;
    const newDeal: Deal = {
      ...data,
      id: newId,
    };
    setDeals(prev => [newDeal, ...prev]);
    const newActivity: ActivityEvent = {
      id: `ACT-${Date.now()}`,
      timestamp: `${ANCHOR_DATE}T12:10:00`,
      type: 'deal_created',
      title: `Deal Created — ${newDeal.title}`,
      description: `Value: ₹${newDeal.dealValue.toLocaleString('en-IN')}`,
      amount: newDeal.dealValue,
      relatedEntity: { type: 'deal', id: newId }
    };
    setActivities(prev => [newActivity, ...prev]);
    addToast('success', 'Deal Created', `New Deal ${newId} logged.`);
    return newId;
  }, [deals.length, addToast]);

  const updateDeal = useCallback((deal: Deal) => {
    setDeals(prev => prev.map(d => d.id === deal.id ? deal : d));
    addToast('success', 'Deal Updated', `Updated ${deal.title}`);
  }, [addToast]);

  const deleteDeal = useCallback((id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
    addToast('info', 'Deal Removed', `Deal ${id} has been removed.`);
  }, [addToast]);

  const updateDealStatus = useCallback((id: string, status: DealStatus) => {
    setDeals(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status,
          actualCloseDate: (status === 'Won' || status === 'Lost') ? ANCHOR_DATE : d.actualCloseDate
        };
      }
      return d;
    }));
    addToast('success', 'Deal Status Updated', `Deal ${id} marked as ${status}`);
  }, [addToast]);

  const updateDealPriority = useCallback((id: string, priority: DealPriority) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, priority } : d));
    addToast('info', 'Priority Updated', `Deal ${id} priority set to ${priority}`);
  }, [addToast]);

  // Orders
  const addOrder = useCallback((data: Omit<Order, 'id'>): string => {
    const nextNum = orders.length + 4001;
    const newId = `ORD-${nextNum}`;
    const newOrder: Order = {
      ...data,
      id: newId,
    };
    setOrders(prev => [newOrder, ...prev]);
    addToast('success', 'Order Created', `Order ${newId} initialized`);
    return newId;
  }, [orders.length, addToast]);

  const updateOrder = useCallback((order: Order) => {
    setOrders(prev => prev.map(o => o.id === order.id ? order : o));
    addToast('success', 'Order Updated', `Updated order ${order.id}`);
  }, [addToast]);

  const deleteOrder = useCallback((id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    addToast('info', 'Order Removed', `Order ${id} deleted.`);
  }, [addToast]);

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        const progress = status === 'Completed' ? 100 : (status === 'Pending' ? 0 : (o.progress === 0 ? 30 : o.progress));
        const completionDate = status === 'Completed' ? ANCHOR_DATE : undefined;
        return { ...o, status, progress, completionDate };
      }
      return o;
    }));
    addToast('success', 'Order Status Updated', `Order ${id} is now ${status}`);
  }, [addToast]);

  const updateOrderProgress = useCallback((id: string, progress: number) => {
    const cleanProgress = Math.min(100, Math.max(0, progress));
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        const status = cleanProgress === 100 ? 'Completed' : (cleanProgress === 0 ? 'Pending' : 'In Progress');
        const completionDate = cleanProgress === 100 ? ANCHOR_DATE : undefined;
        return { ...o, progress: cleanProgress, status, completionDate };
      }
      return o;
    }));
    addToast('info', 'Progress Updated', `Order ${id} updated to ${cleanProgress}%`);
  }, [addToast]);

  // Payments
  const addPayment = useCallback((data: Omit<Payment, 'id'>): string => {
    const nextNum = payments.length + 5001;
    const newId = `PAY-${nextNum}`;
    const newPayment: Payment = {
      ...data,
      id: newId,
    };
    setPayments(prev => [newPayment, ...prev]);
    if (newPayment.status === 'Successful') {
      const newActivity: ActivityEvent = {
        id: `ACT-${Date.now()}`,
        timestamp: `${ANCHOR_DATE}T12:20:00`,
        type: 'payment_received',
        title: `Payment Received — ${newPayment.leadName}`,
        description: `Collected ₹${newPayment.amount.toLocaleString('en-IN')} via ${newPayment.paymentMethod}`,
        amount: newPayment.amount,
        relatedEntity: { type: 'payment', id: newId }
      };
      setActivities(prev => [newActivity, ...prev]);
    }
    addToast('success', 'Payment Logged', `Recorded ${newId} for ₹${newPayment.amount.toLocaleString('en-IN')}`);
    return newId;
  }, [payments.length, addToast]);

  const updatePaymentStatus = useCallback((id: string, status: PaymentStatus) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    addToast('success', 'Payment Status Updated', `Payment ${id} set to ${status}`);
  }, [addToast]);

  const deletePayment = useCallback((id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
    addToast('info', 'Payment Removed', `Payment record ${id} deleted.`);
  }, [addToast]);

  // Notifications
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('info', 'Notifications', 'All notifications marked as read.');
  }, [addToast]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    addToast('info', 'Notifications Cleared', 'Notification list is now empty.');
  }, [addToast]);

  // Settings
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addToast('success', 'Settings Saved', 'Preferences updated in local storage.');
  }, [addToast]);

  // Reset Demo Data
  const resetDemoData = useCallback(() => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}leads`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}quotations`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}deals`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}orders`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}payments`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}activities`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}notifications`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}settings`);

    setLeads(initialLeads);
    setQuotations(initialQuotations);
    setDeals(initialDeals);
    setOrders(initialOrders);
    setPayments(initialPayments);
    setActivities(initialActivities);
    setNotifications(initialNotifications);
    setSettings(defaultSettings);
    setDateRangeOption('last30');

    addToast('info', 'Demo Data Reset', 'All records and settings restored to canonical fixtures.');
  }, [addToast]);

  const refreshDashboard = useCallback(() => {
    setRefreshCount(prev => prev + 1);
    addToast('info', 'Dashboard Refreshed', 'Recalculated metrics from active dataset.');
  }, [addToast]);

  return (
    <DashboardContext.Provider value={{
      leads,
      quotations,
      deals,
      orders,
      payments,
      activities,
      notifications,
      settings,

      dateRangeOption,
      customRange,
      appliedCustomRange,
      currentRange,
      previousRange,
      setDateRangeOption,
      setCustomRange,
      applyCustomRange,
      resetDateRange,

      globalSearchQuery,
      setGlobalSearchQuery,
      activeEntity,
      openDetail,
      closeDetail,

      filteredLeads,
      filteredQuotations,
      filteredDeals,
      filteredOrders,
      filteredPayments,
      filteredActivities,

      prevLeads,
      prevQuotations,
      prevDeals,
      prevOrders,
      prevPayments,

      kpis,

      addLead,
      updateLead,
      deleteLead,
      updateLeadStatus,

      addQuotation,
      updateQuotation,
      deleteQuotation,
      updateQuotationStatus,

      addDeal,
      updateDeal,
      deleteDeal,
      updateDealStatus,
      updateDealPriority,

      addOrder,
      updateOrder,
      deleteOrder,
      updateOrderStatus,
      updateOrderProgress,

      addPayment,
      updatePaymentStatus,
      deletePayment,

      toasts,
      addToast,
      dismissToast,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearNotifications,

      updateSettings,
      resetDemoData,
      refreshDashboard,
      refreshCount,
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
