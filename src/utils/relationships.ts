import { Lead, Quotation, Deal, Order, Payment } from '../types';

export function getQuotationsForLead(quotations: Quotation[], leadId: string): Quotation[] {
  return quotations.filter(q => q.leadId === leadId);
}

export function getDealsForLead(deals: Deal[], leadId: string): Deal[] {
  return deals.filter(d => d.leadId === leadId);
}

export function getOrdersForDeal(orders: Order[], dealId: string): Order[] {
  return orders.filter(o => o.dealId === dealId);
}

export function getPaymentsForDeal(payments: Payment[], dealId: string): Payment[] {
  return payments.filter(p => p.dealId === dealId);
}

export function getPaymentsForOrder(payments: Payment[], orderId: string): Payment[] {
  return payments.filter(p => p.orderId === orderId);
}

export function getOrdersForLead(orders: Order[], leadId: string): Order[] {
  return orders.filter(o => o.leadId === leadId);
}

export function getPaymentsForLead(payments: Payment[], leadId: string): Payment[] {
  return payments.filter(p => p.leadId === leadId);
}

export interface LeadFinancialSummary {
  totalQuotationsCount: number;
  totalQuotationValue: number;
  totalDealsCount: number;
  wonDealsCount: number;
  wonDealValue: number;
  totalOrdersCount: number;
  completedOrdersCount: number;
  totalCollectedPayment: number;
  pendingPayment: number;
}

export function calculateLeadFinancials(
  leadId: string,
  quotations: Quotation[],
  deals: Deal[],
  orders: Order[],
  payments: Payment[]
): LeadFinancialSummary {
  const leadQuotes = getQuotationsForLead(quotations, leadId);
  const leadDeals = getDealsForLead(deals, leadId);
  const leadOrders = getOrdersForLead(orders, leadId);
  const leadPayments = getPaymentsForLead(payments, leadId);

  const totalQuotationValue = leadQuotes.reduce((acc, q) => acc + q.amount, 0);
  const wonDeals = leadDeals.filter(d => d.status === 'Won');
  const wonDealValue = wonDeals.reduce((acc, d) => acc + d.dealValue, 0);
  
  const completedOrders = leadOrders.filter(o => o.status === 'Completed');

  // Collected revenue only counts successful payments (net of refunded)
  const totalCollectedPayment = leadPayments
    .filter(p => p.status === 'Successful')
    .reduce((acc, p) => acc + p.amount, 0);

  const pendingPayment = leadPayments
    .filter(p => p.status === 'Pending')
    .reduce((acc, p) => acc + p.amount, 0);

  return {
    totalQuotationsCount: leadQuotes.length,
    totalQuotationValue,
    totalDealsCount: leadDeals.length,
    wonDealsCount: wonDeals.length,
    wonDealValue,
    totalOrdersCount: leadOrders.length,
    completedOrdersCount: completedOrders.length,
    totalCollectedPayment,
    pendingPayment,
  };
}
