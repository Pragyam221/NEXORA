import { ActivityEvent } from '../types';

export const initialActivities: ActivityEvent[] = [
  {
    id: 'ACT-9001',
    timestamp: '2026-10-18T14:45:00',
    type: 'payment_received',
    title: 'Payment Received — Dreamplug Technologies (CRED)',
    description: 'Received ₹27,50,000 for Cloud Security Posture Management advance via RTGS.',
    amount: 2750000,
    relatedEntity: { type: 'payment', id: 'PAY-5046' }
  },
  {
    id: 'ACT-9002',
    timestamp: '2026-10-18T13:20:00',
    type: 'order_completed',
    title: 'Order Completed — Nykaa Beauty Supply',
    description: 'Virtual AR Shade Matcher milestone verified and delivered to mobile app team.',
    amount: 2600000,
    relatedEntity: { type: 'order', id: 'ORD-4015' }
  },
  {
    id: 'ACT-9003',
    timestamp: '2026-10-18T11:55:00',
    type: 'deal_won',
    title: 'Deal Won — Blinkit Instant Fulfillment',
    description: 'Edge Kubernetes Fleet Deployment contract finalized and signed (₹36,00,000).',
    amount: 3600000,
    relatedEntity: { type: 'deal', id: 'DL-3030' }
  },
  {
    id: 'ACT-9004',
    timestamp: '2026-10-18T10:15:00',
    type: 'payment_received',
    title: 'Payment Received — Blinkit Instant Fulfillment',
    description: 'Initial edge Kubernetes fleet rollout deposit received: ₹18,00,000 via UPI.',
    amount: 1800000,
    relatedEntity: { type: 'payment', id: 'PAY-5047' }
  },
  {
    id: 'ACT-9005',
    timestamp: '2026-10-18T09:30:00',
    type: 'lead_created',
    title: 'New Enterprise Lead — Wrappr Delivery Tech',
    description: 'Rahul Jaimini submitted inquiry for Dark store robotic sorting & scanner integration.',
    amount: 3100000,
    relatedEntity: { type: 'lead', id: 'LD-1055' }
  },
  {
    id: 'ACT-9006',
    timestamp: '2026-10-18T08:45:00',
    type: 'payment_overdue',
    title: 'Invoice Overdue Notice — Groww Wealth Platform',
    description: 'Payment of ₹15,00,000 for Deal DL-3031 is overdue past Oct 10 due date.',
    amount: 1500000,
    relatedEntity: { type: 'payment', id: 'PAY-5070' }
  },
  {
    id: 'ACT-9007',
    timestamp: '2026-10-17T17:10:00',
    type: 'quotation_sent',
    title: 'Quotation Sent — Honasa Consumer Tech',
    description: 'Quotation QT-2045 sent for Planogram Compliance Vision AI (₹24,00,000).',
    amount: 2400000,
    relatedEntity: { type: 'quotation', id: 'QT-2045' }
  },
  {
    id: 'ACT-9008',
    timestamp: '2026-10-17T15:30:00',
    type: 'deal_won',
    title: 'Deal Won — Rainmatter Capital Tech',
    description: 'Cybersecurity portfolio audit signed for 20 climate startups (₹44,00,000).',
    amount: 4400000,
    relatedEntity: { type: 'deal', id: 'DL-3025' }
  },
  {
    id: 'ACT-9009',
    timestamp: '2026-10-17T14:15:00',
    type: 'payment_received',
    title: 'Payment Received — Airtel Xstream Solutions',
    description: 'Fiber GIS auto-dispatch live completion signoff payment of ₹17,00,000 received.',
    amount: 1700000,
    relatedEntity: { type: 'payment', id: 'PAY-5039' }
  },
  {
    id: 'ACT-9010',
    timestamp: '2026-10-16T16:20:00',
    type: 'order_completed',
    title: 'Order Completed — Wipro Cloud Ecosystems',
    description: 'FinOps governance rollout completed with verified cost allocation policies.',
    amount: 4100000,
    relatedEntity: { type: 'order', id: 'ORD-4012' }
  },
  {
    id: 'ACT-9011',
    timestamp: '2026-10-16T11:00:00',
    type: 'payment_received',
    title: 'Payment Received — Meesho Social Commerce',
    description: 'Supplier return portal kickoff payment of ₹25,50,000 received via RTGS.',
    amount: 2550000,
    relatedEntity: { type: 'payment', id: 'PAY-5038' }
  },
  {
    id: 'ACT-9012',
    timestamp: '2026-10-15T18:00:00',
    type: 'order_started',
    title: 'Order Started — Edelweiss Asset Cloud',
    description: 'Commenced integration testing for RTGS automated reconciliation engine.',
    amount: 4900000,
    relatedEntity: { type: 'order', id: 'ORD-4021' }
  },
  {
    id: 'ACT-9013',
    timestamp: '2026-10-15T12:30:00',
    type: 'payment_received',
    title: 'Payment Received — Flipkart Wholesale Tech',
    description: 'Received final completion payment of ₹19,00,000 for B2B Kirana disbursal gateway.',
    amount: 1900000,
    relatedEntity: { type: 'payment', id: 'PAY-5033' }
  },
  {
    id: 'ACT-9014',
    timestamp: '2026-10-14T16:45:00',
    type: 'deal_won',
    title: 'Deal Won — Edelweiss Asset Cloud',
    description: 'High-value NEFT/RTGS automated reconciliation engine deal closed (₹49,00,000).',
    amount: 4900000,
    relatedEntity: { type: 'deal', id: 'DL-3021' }
  },
  {
    id: 'ACT-9015',
    timestamp: '2026-10-13T14:00:00',
    type: 'payment_received',
    title: 'Payment Received — Zerodha Fintech Labs',
    description: 'Final sign-off payment of ₹26,00,000 received for SEBI SOC-2 audit.',
    amount: 2600000,
    relatedEntity: { type: 'payment', id: 'PAY-5029' }
  }
];
