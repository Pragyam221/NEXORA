export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Unqualified' | 'Converted';
export type LeadSource = 'Website' | 'Referral' | 'Social Media' | 'Paid Ads' | 'Direct' | 'Other';

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  assignedOwner: string;
  createdAt: string; // ISO date YYYY-MM-DD
  estimatedValue: number;
  notes?: string;
  industry?: string;
  city?: string;
}

export type QuotationStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';

export interface Quotation {
  id: string;
  leadId: string;
  leadName: string;
  serviceCategory: string;
  amount: number;
  createdAt: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  status: QuotationStatus;
  linkedDealId?: string;
  discountPercentage?: number;
  terms?: string;
}

export type DealStatus = 'New' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
export type DealPriority = 'High' | 'Medium' | 'Low';

export interface Deal {
  id: string;
  leadId: string;
  leadName: string;
  quotationId?: string;
  title: string;
  serviceCategory: string;
  dealValue: number;
  status: DealStatus;
  priority: DealPriority;
  owner: string;
  expectedCloseDate: string; // YYYY-MM-DD
  actualCloseDate?: string;
  notes?: string;
}

export type OrderStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Order {
  id: string;
  dealId: string;
  leadId: string;
  leadName: string;
  serviceCategory: string;
  orderAmount: number;
  status: OrderStatus;
  progress: number; // 0 to 100
  startDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  completionDate?: string;
  deliveryNotes?: string;
}

export type PaymentStatus = 'Successful' | 'Pending' | 'Failed' | 'Refunded';
export type PaymentMethod = 'UPI' | 'Bank Transfer' | 'Credit/Debit Card' | 'Cash' | 'Other';

export interface Payment {
  id: string;
  dealId: string;
  orderId?: string;
  leadId: string;
  leadName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: PaymentStatus;
  transactionRef: string;
  notes?: string;
}

export type ActivityType = 
  | 'lead_created'
  | 'quotation_sent'
  | 'quotation_accepted'
  | 'deal_won'
  | 'deal_created'
  | 'order_completed'
  | 'order_started'
  | 'payment_received'
  | 'payment_overdue';

export interface ActivityEvent {
  id: string;
  timestamp: string; // ISO datetime or YYYY-MM-DD HH:mm
  type: ActivityType;
  title: string;
  description: string;
  amount?: number;
  relatedEntity: {
    type: 'lead' | 'quotation' | 'deal' | 'order' | 'payment';
    id: string;
  };
}

export type DateRangeOption = 'today' | 'last7' | 'last30' | 'custom';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface MetricComparison {
  currentValue: number;
  previousValue: number;
  absoluteChange: number;
  percentageChange: number | null; // null if previousValue == 0 (displayed as 'New')
  isPositive: boolean;
  isNeutral?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'danger';
  link?: string;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  density: 'comfortable' | 'compact';
  currency: 'INR';
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY';
  pageSize: number;
}
