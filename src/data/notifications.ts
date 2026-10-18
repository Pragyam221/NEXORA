import { NotificationItem } from '../types';

export const initialNotifications: NotificationItem[] = [
  {
    id: 'NOTIF-1',
    title: 'Payment Received: ₹27.50 L',
    message: 'Dreamplug Technologies (CRED) sent advance for Cloud Security Posture Management.',
    timestamp: '2026-10-18T14:45:00',
    read: false,
    type: 'success',
    link: '/payments'
  },
  {
    id: 'NOTIF-2',
    title: 'New High-Value Lead Added',
    message: 'Wrappr Delivery Tech (₹31.00 L) requested demo for dark store robotics.',
    timestamp: '2026-10-18T09:30:00',
    read: false,
    type: 'info',
    link: '/leads'
  },
  {
    id: 'NOTIF-3',
    title: 'Payment Overdue Alert',
    message: 'Invoice of ₹15.00 L for Groww Wealth Platform was due on Oct 10.',
    timestamp: '2026-10-18T08:45:00',
    read: false,
    type: 'warning',
    link: '/payments'
  },
  {
    id: 'NOTIF-4',
    title: 'Milestone Order Completed',
    message: 'Order ORD-4015 for Nykaa Beauty Supply is marked 100% complete.',
    timestamp: '2026-10-18T13:20:00',
    read: true,
    type: 'success',
    link: '/orders'
  },
  {
    id: 'NOTIF-5',
    title: 'Deal Won: ₹44.00 L',
    message: 'Rainmatter Capital Tech accepted cybersecurity portfolio audit proposal.',
    timestamp: '2026-10-17T15:30:00',
    read: true,
    type: 'success',
    link: '/deals'
  }
];
