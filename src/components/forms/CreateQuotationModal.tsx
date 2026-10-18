import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDashboard } from '../../context/DashboardContext';
import { X, FileText, CheckCircle2 } from 'lucide-react';
import { QuotationStatus } from '../../types';
import { ANCHOR_DATE } from '../../utils/dates';

interface CreateQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedLeadId?: string;
}

export const CreateQuotationModal: React.FC<CreateQuotationModalProps> = ({
  isOpen,
  onClose,
  preselectedLeadId,
}) => {
  const { leads, addQuotation } = useDashboard();

  const [leadId, setLeadId] = useState(preselectedLeadId || (leads[0]?.id || ''));
  const [serviceCategory, setServiceCategory] = useState('Enterprise Cloud ERP');
  const [amount, setAmount] = useState(2800000);
  const [expiryDays, setExpiryDays] = useState(30);
  const [status, setStatus] = useState<QuotationStatus>('Sent');
  const [terms, setTerms] = useState('Payment: 50% advance upon contract signoff, 50% upon UAT delivery sign-off.');

  if (!isOpen || typeof document === 'undefined') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedLead = leads.find(l => l.id === leadId);
    if (!selectedLead) {
      alert('Please select a valid customer lead.');
      return;
    }

    // Expiry date calculation
    const createdDate = new Date(ANCHOR_DATE);
    createdDate.setDate(createdDate.getDate() + Number(expiryDays));
    const expiryDateStr = createdDate.toISOString().slice(0, 10);

    addQuotation({
      leadId: selectedLead.id,
      leadName: `${selectedLead.name} (${selectedLead.company})`,
      serviceCategory,
      amount: Number(amount) || 500000,
      expiryDate: expiryDateStr,
      status,
      terms,
    });

    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-navy-900 border border-navy-750 rounded-2xl shadow-2xl p-6 text-left relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-navy-800 pb-4 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-accent-purple/10 text-accent-purple border border-accent-purple/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Generate Quotation Proposal</h3>
              <p className="text-xs text-text-muted">Link quotation to existing lead and specify commercial terms</p>
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
              Select Client Lead *
            </label>
            <select
              required
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
            >
              {leads.map(lead => (
                <option key={lead.id} value={lead.id}>
                  {lead.company} — {lead.name} ({lead.id})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Service Category *
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
                Quotation Amount (₹) *
              </label>
              <input
                type="number"
                min="50000"
                step="50000"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Validity Window
              </label>
              <select
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
              >
                <option value={15}>15 Days</option>
                <option value={30}>30 Days (Standard)</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QuotationStatus)}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent to Client</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Terms & Scope Clauses
            </label>
            <textarea
              rows={3}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
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
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-accent-purple hover:bg-accent-purpleHover transition-colors shadow-lg"
            >
              Create Quotation
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
