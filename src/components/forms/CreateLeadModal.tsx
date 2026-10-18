import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDashboard } from '../../context/DashboardContext';
import { X, UserPlus, Building, Mail, Phone, Tag } from 'lucide-react';
import { LeadSource, LeadStatus } from '../../types';

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateLeadModal: React.FC<CreateLeadModalProps> = ({ isOpen, onClose }) => {
  const { addLead } = useDashboard();

  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState<LeadSource>('Website');
  const [status, setStatus] = useState<LeadStatus>('New');
  const [assignedOwner, setAssignedOwner] = useState('Aarav Sharma');
  const [estimatedValue, setEstimatedValue] = useState(2500000);
  const [industry, setIndustry] = useState('Enterprise Tech');
  const [city, setCity] = useState('Bengaluru');
  const [notes, setNotes] = useState('');

  if (!isOpen || typeof document === 'undefined') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !name.trim() || !email.trim()) {
      alert('Please fill in Company, Contact Name, and Email.');
      return;
    }

    addLead({
      company: company.trim(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+91 98000 00000',
      source,
      status,
      assignedOwner,
      estimatedValue: Number(estimatedValue) || 1000000,
      industry,
      city,
      notes: notes.trim() || 'Direct lead logged through NEXORA CRM.',
    });

    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-navy-900 border border-navy-750 rounded-2xl shadow-2xl p-6 text-left relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-navy-800 pb-4 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-accent-purple/10 text-accent-purple border border-accent-purple/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Create New Enterprise Lead</h3>
              <p className="text-xs text-text-muted">Enter prospect credentials and estimated potential deal value</p>
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
              <label className="text-xs font-semibold text-text-secondary block mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Reliance Smart Retail"
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">Contact Person *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Iyer"
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ramesh@reliance.in"
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 12345"
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">Lead Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
              >
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Social Media">Social Media</option>
                <option value="Paid Ads">Paid Ads</option>
                <option value="Direct">Direct</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Unqualified">Unqualified</option>
                <option value="Converted">Converted</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">Account Owner</label>
              <select
                value={assignedOwner}
                onChange={(e) => setAssignedOwner(e.target.value)}
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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">Estimated Value (₹)</label>
              <input
                type="number"
                min="50000"
                step="50000"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(Number(e.target.value))}
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">Industry</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Fintech / SaaS"
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bengaluru / Mumbai"
                className="w-full bg-navy-850 text-text-primary border border-navy-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">Requirements & Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enterprise scope, technical stack constraints, budget timeline..."
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
              Create Lead
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
