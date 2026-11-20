import React, { useState } from 'react';
import {
  X,
  ArrowDownToLine,
  Building2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { adminTreasuryService } from '../../services/adminTreasuryService';
import { extractErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';

export const WithdrawalModal = ({
  isOpen,
  onClose,
  availableBalanceRupees = 0,
  bankAccounts = [],
  onWithdrawalRequested,
}) => {
  const { addToast } = useToast();
  const verifiedAccounts = bankAccounts.filter((acc) => acc.isVerified);
  const defaultAccount = verifiedAccounts.find((acc) => acc.isDefault) || verifiedAccounts[0];

  const [amountRupees, setAmountRupees] = useState('');
  const [selectedBankId, setSelectedBankId] = useState(defaultAccount?._id || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const parsedAmount = Number(amountRupees) || 0;
  const payoutFee = 0.0;
  const netTransfer = Math.max(0, parsedAmount - payoutFee);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (verifiedAccounts.length === 0) {
      setError('No verified bank account available. Please add and verify a bank account first.');
      return;
    }

    if (!selectedBankId) {
      setError('Please select a destination bank account.');
      return;
    }

    if (parsedAmount < 100) {
      setError('Minimum withdrawal amount is ₹100.00.');
      return;
    }

    if (parsedAmount > availableBalanceRupees) {
      setError(`Requested amount exceeds available balance of ${formatCurrency(availableBalanceRupees)}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const idempotencyKey = `adm_wth_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const result = await adminTreasuryService.requestWithdrawal({
        amountRupees: parsedAmount,
        bankAccountId: selectedBankId,
        notes,
        idempotencyKey,
      });

      addToast(result.message || 'Withdrawal initiated successfully!', 'success');
      if (onWithdrawalRequested) onWithdrawalRequested(result);
      onClose();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to process withdrawal.');
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
              <ArrowDownToLine className="w-5 h-5 text-brand-orange" />
            </div>
            <div>
              <h3 className="text-base font-bold text-light-text">Withdraw Platform Earnings</h3>
              <p className="text-xs text-light-muted">Transfer real settled earnings to your verified bank account.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-light-muted hover:text-light-text hover:bg-light-secondary rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Available Balance Box */}
        <div className="mt-4 p-4 rounded-2xl bg-light-secondary/60 border border-light-border flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-light-muted uppercase tracking-wider">
              Reconciled Available Balance
            </span>
            <div className="text-xl font-black text-brand-primary">
              {formatCurrency(availableBalanceRupees)}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAmountRupees(String(availableBalanceRupees))}
            className="px-3 py-1.5 rounded-xl bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary text-xs font-bold transition"
          >
            Max Amount
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
              Select Verified Bank Account <span className="text-rose-500">*</span>
            </label>
            {verifiedAccounts.length === 0 ? (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>No verified bank accounts found. Please add and verify an account first.</span>
              </div>
            ) : (
              <select
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-light-secondary/40 border border-light-border text-xs sm:text-sm text-light-text focus:outline-none focus:border-brand-primary transition"
              >
                {verifiedAccounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.bankName} - {acc.maskedAccountNumber} ({acc.accountHolderName}){' '}
                    {acc.isDefault ? '[DEFAULT]' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-light-text mb-1">
              Withdrawal Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-light-muted">₹</span>
              <input
                type="number"
                min="100"
                step="0.01"
                max={availableBalanceRupees}
                value={amountRupees}
                onChange={(e) => {
                  setError(null);
                  setAmountRupees(e.target.value);
                }}
                placeholder="100.00"
                required
                className="w-full pl-8 pr-3.5 py-2.5 rounded-2xl bg-light-secondary/40 border border-light-border text-sm font-semibold text-light-text focus:outline-none focus:border-brand-primary transition"
              />
            </div>
            <p className="text-[11px] text-light-muted mt-1">Minimum withdrawal: ₹100.00</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-light-text mb-1">
              Transfer Narration / Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Platform earnings payout for November"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-light-secondary/40 border border-light-border text-xs sm:text-sm text-light-text focus:outline-none focus:border-brand-primary transition"
            />
          </div>

          {/* Breakdown summary */}
          <div className="p-3.5 rounded-2xl bg-light-secondary/50 border border-light-border space-y-1.5 text-xs">
            <div className="flex justify-between text-light-muted">
              <span>Requested Amount:</span>
              <span className="font-semibold text-light-text">{formatCurrency(parsedAmount)}</span>
            </div>
            <div className="flex justify-between text-light-muted">
              <span>Payout Processing Fee:</span>
              <span className="font-semibold text-emerald-600">₹0.00 (Free)</span>
            </div>
            <div className="border-t border-light-border pt-1.5 flex justify-between font-bold text-light-text">
              <span>Net Bank Transfer:</span>
              <span className="text-brand-primary">{formatCurrency(netTransfer)}</span>
            </div>
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
              disabled={isSubmitting || verifiedAccounts.length === 0 || parsedAmount < 100}
              className="flex-1 py-2.5 rounded-2xl bg-brand-primary hover:bg-[#0E3B2E] text-white text-xs font-bold transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />
                  <span>Reserving & Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-brand-orange" />
                  <span>Confirm Withdrawal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawalModal;
