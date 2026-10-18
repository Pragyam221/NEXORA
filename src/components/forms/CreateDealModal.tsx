import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDashboard } from '../../context/DashboardContext';
import { X, TrendingUp } from 'lucide-react';
import { DealPriority, DealStatus } from '../../types';
import { ANCHOR_DATE } from '../../utils/dates';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedLeadId?: string;
}

export const CreateDealModal: React.FC<CreateDealModalProps> = ({
  isOpen,
  onClose,
  preselectedLeadId,
}) => {
  const { leads, quotations, addDeal } = useDashboard();

  const [leadId, setLeadId] = useState(preselectedLeadId || (leads[0]?.id || ''));
  const [quotationId, setQuotationId] = useState('');
  const [title, setTitle] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Enterprise Cloud ERP');
  const [dealValue, setDealValue] = useState(3500000);
  const [status, setStatus] = useState<DealStatus>('Proposal');
  const [priority, setPriority] = useState<DealPriority>('High');
  const [owner, setOwner] = useState('Aarav Sharma');
  const [expectedCloseDate, setExpectedCloseDate] = useState('2026-11-15');
  const [notes, setNotes] = useState('');

  if (!isOpen || typeof document === 'undefined') return null;

  const relevantQuotations = quotations.filter(q => q.leadId === leadId);

  const handleLeadChange = (newLeadId: string) => {
    setLeadId(newLeadId);
    const related = quotations.filter(q => q.leadId === newLeadId);
    if (related.length > 0) {
      setQuotationId(related[0].id);
      setServiceCategory(related[0].serviceCategory);
      setDealValue(related[0].amount);
    } else {
      setQuotationId('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedLead = leads.find(l => l.id === leadId);
    if (!selectedLead) {
      alert('Please select a valid customer lead.');
      return;
    }

    addDeal({
      leadId: selectedLead.id,
      leadName: selectedLead.company,
      quotationId: quotationId || undefined,
      title: title.trim() || `${selectedLead.company} — ${serviceCategory}`,
      serviceCategory,
      dealValue: Number(dealValue) || 1000000,
      status,
      priority,
      owner,
      expectedCloseDate,
      actualCloseDate: (status === 'Won' || status === 'Lost') ? ANCHOR_DATE : undefined,
      notes,
    });

    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-navy-900 border border-navy-750 rounded-2xl shadow-2xl p-6 text-left relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-navy-800 pb-4 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Create Commercial Deal</h3>
              <p className="text-xs text-text-muted">Register deal pipeline opportunity with value and stages</p>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Client Account *
              </label>
              <select
                required
                value={leadId}
                onChange={(e) => handleLeadChange(e.target.value)}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
              >
                {leads.map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.company} ({lead.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Linked Quotation (Optional)
              </label>
              <select
                value={quotationId}
                onChange={(e) => {
                  setQuotationId(e.target.value);
                  const q = quotations.find(item => item.id === e.target.value);
                  if (q) {
                    setServiceCategory(q.serviceCategory);
                    setDealValue(q.amount);
                  }
                }}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
              >
                <option value="">None / Standalone Deal</option>
                {relevantQuotations.map(q => (
                  <option key={q.id} value={q.id}>
                    {q.id} - {q.serviceCategory} (₹{q.amount.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Deal Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Omnichannel Cloud ERP Architecture Rollout"
              className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
            />
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
                Contract Deal Value (₹) *
              </label>
              <input
                type="number"
                min="50000"
                step="50000"
                required
                value={dealValue}
                onChange={(e) => setDealValue(Number(e.target.value))}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Deal Stage Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DealStatus)}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
              >
                <option value="New">New</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as DealPriority)}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Deal Owner
              </label>
              <select
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
              >
                <option value="Aarav Sharma">Aarav Sharma</option>
                <option value="Priya Patel">Priya Patel</option>
                <option value="Vikram Malhotra">Vikram Malhotra</option>
                <option value="Ananya Iyer">Ananya Iyer</option>
                <option value="Rohan Verma">Rohan Verma</option>
                <option value="Sneha Rao">Sneha Rao</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Target Close Date
            </label>
            <input
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
              className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Deal Strategy & Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key stakeholders, competition, technical qualification notes..."
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
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-accent-blue hover:bg-accent-blueHover transition-colors shadow-lg"
            >
              Create Deal
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
