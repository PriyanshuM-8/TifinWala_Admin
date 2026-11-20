import React, { useState } from 'react';
import {
  X,
  Building2,
  CreditCard,
  User,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { adminTreasuryService } from '../../services/adminTreasuryService';
import { extractErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AddBankAccountModal = ({ isOpen, onClose, onAccountAdded }) => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    accountType: 'current',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError(null);
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'ifscCode' ? value.toUpperCase().trim() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Frontend validations
    if (!formData.accountHolderName.trim()) {
      setError('Please enter the account holder name.');
      return;
    }
    if (!formData.bankName.trim()) {
      setError('Please enter the bank name.');
      return;
    }
    if (!formData.accountNumber.trim() || formData.accountNumber.length < 9) {
      setError('Account number must be at least 9 digits.');
      return;
    }
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      setError('Account numbers do not match.');
      return;
    }
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(formData.ifscCode)) {
      setError('Invalid IFSC format. Example: HDFC0001234');
      return;
    }

    setIsSubmitting(true);
    try {
      const newAccount = await adminTreasuryService.addBankAccount(formData);
      addToast('Bank account added successfully!', 'success');
      if (onAccountAdded) onAccountAdded(newAccount);
      onClose();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to add bank account.');
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg bg-light-card rounded-3xl p-6 sm:p-7 shadow-2xl border border-light-border relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-light-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-light-text">Add Platform Bank Account</h3>
              <p className="text-xs text-light-muted">Encrypted with AES-256-GCM. Never exposed in public APIs.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-light-muted hover:text-light-text hover:bg-light-secondary rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-light-text mb-1">
              Account Holder Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-light-muted absolute left-3.5 top-3" />
              <input
                type="text"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleChange}
                placeholder="e.g. GharKaSwad Foods Pvt Ltd"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-light-secondary/40 border border-light-border text-xs sm:text-sm text-light-text focus:outline-none focus:border-brand-primary transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-light-text mb-1">
                Bank Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-light-muted absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="e.g. HDFC Bank"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-light-secondary/40 border border-light-border text-xs sm:text-sm text-light-text focus:outline-none focus:border-brand-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-light-text mb-1">
                Account Type <span className="text-rose-500">*</span>
              </label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-light-secondary/40 border border-light-border text-xs sm:text-sm text-light-text focus:outline-none focus:border-brand-primary transition"
              >
                <option value="current">Current Account</option>
                <option value="savings">Savings Account</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-light-text mb-1">
              Bank Account Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-light-muted absolute left-3.5 top-3" />
              <input
                type="password"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Enter 9-18 digit account number"
                required
                autoComplete="new-password"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-light-secondary/40 border border-light-border text-xs sm:text-sm text-light-text focus:outline-none focus:border-brand-primary transition tracking-widest"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-light-text mb-1">
              Confirm Account Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-light-muted absolute left-3.5 top-3" />
              <input
                type="text"
                name="confirmAccountNumber"
                value={formData.confirmAccountNumber}
                onChange={handleChange}
                placeholder="Re-enter bank account number"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-light-secondary/40 border border-light-border text-xs sm:text-sm text-light-text focus:outline-none focus:border-brand-primary transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-light-text mb-1">
              IFSC Code <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-light-muted absolute left-3.5 top-3" />
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                placeholder="e.g. HDFC0001234"
                maxLength={11}
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-light-secondary/40 border border-light-border text-xs sm:text-sm text-light-text focus:outline-none focus:border-brand-primary transition uppercase tracking-wider"
              />
            </div>
          </div>

          {/* Security note */}
          <div className="p-3 rounded-2xl bg-light-secondary/60 border border-light-border text-[11px] text-light-muted flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Full account number is encrypted on write and permanently masked across all screens.</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-2xl border border-light-border text-xs font-bold text-light-muted hover:text-light-text hover:bg-light-secondary transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-2xl bg-brand-primary hover:bg-[#0E3B2E] text-white text-xs font-bold transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />
                  <span>Saving Encrypted...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-brand-orange" />
                  <span>Save Bank Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBankAccountModal;
