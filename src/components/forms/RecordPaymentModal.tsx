import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { X, CreditCard } from 'lucide-react';
import { PaymentMethod, PaymentStatus } from '../../types';
import { ANCHOR_DATE } from '../../utils/dates';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDealId?: string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  preselectedDealId,
}) => {
  const { deals, orders, addPayment } = useDashboard();

  const [dealId, setDealId] = useState(preselectedDealId || (deals[0]?.id || ''));
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState(1500000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [paymentDate, setPaymentDate] = useState(ANCHOR_DATE);
  const [dueDate, setDueDate] = useState(ANCHOR_DATE);
  const [status, setStatus] = useState<PaymentStatus>('Successful');
  const [transactionRef, setTransactionRef] = useState(`NEFT/DEMO-${Date.now().toString().slice(-6)}`);
  const [notes, setNotes] = useState('Commercial tranche received and credited to accounts.');

  if (!isOpen) return null;

  const relevantOrders = orders.filter(o => o.dealId === dealId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const deal = deals.find(d => d.id === dealId);
    if (!deal) {
      alert('Please select a valid commercial deal.');
      return;
    }

    addPayment({
      dealId: deal.id,
      orderId: orderId || undefined,
      leadId: deal.leadId,
      leadName: deal.leadName,
      amount: Number(amount) || 100000,
      paymentMethod,
      paymentDate,
      dueDate,
      status,
      transactionRef: transactionRef.trim() || `TXN-${Date.now()}`,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-navy-900 border border-navy-750 rounded-2xl shadow-2xl p-6 text-left relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-navy-800 pb-4 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-status-success/10 text-status-success border border-status-success/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Record Payment Transaction</h3>
              <p className="text-xs text-text-muted">Log demo payment collection or invoice against an active deal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-navy-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Select Commercial Deal *
            </label>
            <select
              required
              value={dealId}
              onChange={(e) => {
                setDealId(e.target.value);
                const firstOrd = orders.find(o => o.dealId === e.target.value);
                setOrderId(firstOrd ? firstOrd.id : '');
              }}
              className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
            >
              {deals.map(d => (
                <option key={d.id} value={d.id}>
                  {d.leadName} — {d.title} (Value: ₹{d.dealValue.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Linked Order (Optional)
            </label>
            <select
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
            >
              <option value="">No Direct Order Link</option>
              {relevantOrders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.id} — {o.serviceCategory} ({o.progress}%)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Transaction Amount (₹) *
              </label>
              <input
                type="number"
                min="1000"
                step="50000"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Payment Channel *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="UPI">UPI</option>
                <option value="Credit/Debit Card">Credit/Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Transaction Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PaymentStatus)}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
              >
                <option value="Successful">Successful (Counts in Revenue)</option>
                <option value="Pending">Pending (Awaiting Clearance)</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              UTR / Reference / Card Auth
            </label>
            <input
              type="text"
              required
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Internal Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-navy-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary bg-navy-800 hover:bg-navy-750 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-status-success hover:bg-status-success/90 transition-colors shadow-lg"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
