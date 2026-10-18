import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { X, Package } from 'lucide-react';
import { OrderStatus } from '../../types';
import { ANCHOR_DATE } from '../../utils/dates';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDealId?: string;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  preselectedDealId,
}) => {
  const { deals, addOrder } = useDashboard();

  const [dealId, setDealId] = useState(preselectedDealId || (deals[0]?.id || ''));
  const [serviceCategory, setServiceCategory] = useState('Enterprise Cloud ERP');
  const [orderAmount, setOrderAmount] = useState(2500000);
  const [status, setStatus] = useState<OrderStatus>('In Progress');
  const [progress, setProgress] = useState(30);
  const [startDate, setStartDate] = useState(ANCHOR_DATE);
  const [dueDate, setDueDate] = useState('2026-11-20');
  const [deliveryNotes, setDeliveryNotes] = useState('Sprint 1 milestones initiated with dedicated team.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const deal = deals.find(d => d.id === dealId);
    if (!deal) {
      alert('Please select a valid commercial deal.');
      return;
    }

    addOrder({
      dealId: deal.id,
      leadId: deal.leadId,
      leadName: deal.leadName,
      serviceCategory,
      orderAmount: Number(orderAmount) || 500000,
      status,
      progress: status === 'Completed' ? 100 : (status === 'Pending' ? 0 : Number(progress)),
      startDate,
      dueDate,
      completionDate: status === 'Completed' ? ANCHOR_DATE : undefined,
      deliveryNotes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-navy-900 border border-navy-750 rounded-2xl shadow-2xl p-6 text-left relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-navy-800 pb-4 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-status-info/10 text-status-info border border-status-info/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Deploy Client Fulfillment Order</h3>
              <p className="text-xs text-text-muted">Initialize operational delivery order tied to an approved deal</p>
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
                const d = deals.find(item => item.id === e.target.value);
                if (d) {
                  setServiceCategory(d.serviceCategory);
                  setOrderAmount(d.dealValue);
                }
              }}
              className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
            >
              {deals.map(d => (
                <option key={d.id} value={d.id}>
                  {d.leadName} — {d.title} ({d.id})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Service Category
              </label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value)}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
              >
                <option value="Enterprise Cloud ERP">Enterprise Cloud ERP</option>
                <option value="Custom AI & ML Pipeline">Custom AI & ML Pipeline</option>
                <option value="Cybersecurity Audit & SecOps">Cybersecurity Audit & SecOps</option>
                <option value="Fintech Payment Gateway Integration">Fintech Payment Gateway Integration</option>
                <option value="Healthcare SaaS Platform">Healthcare SaaS Platform</option>
                <option value="Mobile App & Telematics Development">Mobile App & Telematics Development</option>
                <option value="DevOps & Cloud Migration">DevOps & Cloud Migration</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Order Value (₹) *
              </label>
              <input
                type="number"
                min="50000"
                step="50000"
                required
                value={orderAmount}
                onChange={(e) => setOrderAmount(Number(e.target.value))}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Fulfillment Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const newStatus = e.target.value as OrderStatus;
                  setStatus(newStatus);
                  if (newStatus === 'Completed') setProgress(100);
                  if (newStatus === 'Pending') setProgress(0);
                }}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
              >
                <option value="Pending">Pending (0%)</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed (100%)</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-text-secondary">Progress Completion</label>
                <span className="text-xs font-bold text-accent-purple">{progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setProgress(val);
                  if (val === 100) setStatus('Completed');
                  else if (val === 0) setStatus('Pending');
                  else setStatus('In Progress');
                }}
                className="w-full accent-accent-purple cursor-pointer mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Commencement Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                SLA Delivery Target
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Fulfillment Scope & Deliverables
            </label>
            <textarea
              rows={2}
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
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
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-status-info hover:bg-status-info/90 transition-colors shadow-lg"
            >
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
