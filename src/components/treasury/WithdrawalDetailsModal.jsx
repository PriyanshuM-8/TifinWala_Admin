import React, { useEffect, useState } from 'react';
import {
  X,
  ArrowDownToLine,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Receipt,
  ShieldCheck,
  Ban,
  Loader2,
} from 'lucide-react';
import { adminTreasuryService } from '../../services/adminTreasuryService';
import { extractErrorMessage } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const WithdrawalDetailsModal = ({ isOpen, onClose, withdrawalId, onCancelled }) => {
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

  useEffect(() => {
    if (isOpen && withdrawalId) {
      fetchDetails();
    }
  }, [isOpen, withdrawalId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await adminTreasuryService.getWithdrawalDetails(withdrawalId);
      setData(res);
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to load withdrawal details.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCopy = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    addToast(`${label} copied to clipboard!`, 'info');
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      const res = await adminTreasuryService.cancelWithdrawal(withdrawalId, cancelReason || 'Cancelled by admin');
      addToast(res.message || 'Withdrawal cancelled and funds unlocked.', 'success');
      if (onCancelled) onCancelled(res.withdrawal);
      onClose();
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to cancel withdrawal.'), 'error');
    } finally {
      setCancelling(false);
    }
  };

  const withdrawal = data?.withdrawal;
  const ledger = data?.ledgerTransactions || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'successful':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Successful
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 animate-spin" /> Processing
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case 'failed':
      case 'reversed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" /> {status === 'reversed' ? 'Reversed' : 'Failed'}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300">
            <Ban className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-xl bg-light-card rounded-3xl p-6 sm:p-7 shadow-2xl border border-light-border relative overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-light-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <Receipt className="w-5 h-5 text-brand-orange" />
            </div>
            <div>
              <h3 className="text-base font-bold text-light-text">Withdrawal Receipt & Audit Trail</h3>
              <p className="text-xs text-light-muted">Traceable ledger transactions and bank settlement details.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-light-muted hover:text-light-text hover:bg-light-secondary rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
            <span className="text-xs text-light-muted font-medium">Loading withdrawal details...</span>
          </div>
        ) : !withdrawal ? (
          <div className="py-12 text-center text-xs text-light-muted">Withdrawal record not found.</div>
        ) : (
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {/* Status and Amount Card */}
            <div className="p-4 rounded-2xl bg-light-secondary/50 border border-light-border flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-light-muted uppercase tracking-wider">
                  Transfer Amount
                </span>
                <div className="text-2xl font-black text-brand-primary">
                  {formatCurrency((withdrawal.amountPaise || 0) / 100)}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-light-muted">
                  <span>Number:</span>
                  <span className="font-mono font-semibold text-light-text">{withdrawal.withdrawalNumber}</span>
                  <button
                    onClick={() => handleCopy(withdrawal.withdrawalNumber, 'Withdrawal number')}
                    className="p-1 hover:text-brand-primary transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">{getStatusBadge(withdrawal.status)}</div>
            </div>

            {/* Payout & UTR Details */}
            <div className="p-4 rounded-2xl bg-light-secondary/30 border border-light-border space-y-2.5 text-xs">
              <h4 className="font-bold text-light-text text-xs uppercase tracking-wider text-brand-primary">
                Settlement Details
              </h4>
              <div className="grid grid-cols-2 gap-2 text-light-muted">
                <div>
                  <span className="block text-[11px]">UTR / Reference Number:</span>
                  <span className="font-mono font-bold text-light-text">
                    {withdrawal.utrNumber || 'Pending Provider Generation'}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px]">Payout Provider:</span>
                  <span className="font-semibold text-light-text uppercase">
                    {withdrawal.payoutProvider || 'RazorpayX'}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px]">Requested At:</span>
                  <span className="font-medium text-light-text">{formatDate(withdrawal.requestedAt)}</span>
                </div>
                <div>
                  <span className="block text-[11px]">Completed At:</span>
                  <span className="font-medium text-light-text">
                    {withdrawal.completedAt ? formatDate(withdrawal.completedAt) : 'In Progress'}
                  </span>
                </div>
              </div>

              {withdrawal.failureReason && (
                <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  <span className="font-bold">Failure / Cancellation Reason:</span> {withdrawal.failureReason}
                </div>
              )}
            </div>

            {/* Destination Bank Snapshot */}
            <div className="p-4 rounded-2xl bg-light-secondary/30 border border-light-border space-y-2 text-xs">
              <h4 className="font-bold text-light-text text-xs uppercase tracking-wider text-brand-primary flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Destination Bank Account
              </h4>
              <div className="grid grid-cols-2 gap-2 text-light-muted">
                <div>
                  <span className="block text-[11px]">Account Holder:</span>
                  <span className="font-semibold text-light-text">{withdrawal.bankSnapshot?.accountHolderName}</span>
                </div>
                <div>
                  <span className="block text-[11px]">Bank:</span>
                  <span className="font-semibold text-light-text">{withdrawal.bankSnapshot?.bankName}</span>
                </div>
                <div>
                  <span className="block text-[11px]">Account Number:</span>
                  <span className="font-mono font-bold text-light-text">
                    {withdrawal.bankSnapshot?.maskedAccountNumber}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px]">IFSC Code:</span>
                  <span className="font-mono font-bold text-light-text">
                    {withdrawal.bankSnapshot?.maskedIfscCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Traceable Ledger Entries */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-light-text text-xs uppercase tracking-wider text-brand-primary flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Traceable Ledger Transactions
              </h4>
              {ledger.length === 0 ? (
                <p className="text-light-muted text-xs">No individual ledger transactions found.</p>
              ) : (
                <div className="space-y-1.5">
                  {ledger.map((tx) => (
                    <div
                      key={tx._id}
                      className="p-2.5 rounded-xl bg-light-card border border-light-border flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-light-text">{tx.transactionNumber}</div>
                        <div className="text-[11px] text-light-muted">{tx.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-brand-primary">
                          {formatCurrency((tx.amountPaise || 0) / 100)}
                        </div>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary">
                          {tx.transactionType}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cancellation Option for Pending/Processing */}
            {['pending', 'processing'].includes(withdrawal.status) && (
              <div className="pt-2 border-t border-light-border">
                {!showCancelPrompt ? (
                  <button
                    type="button"
                    onClick={() => setShowCancelPrompt(true)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                  >
                    Cancel this withdrawal request
                  </button>
                ) : (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                    <p className="text-xs font-bold text-rose-900">
                      Are you sure you want to cancel this withdrawal?
                    </p>
                    <input
                      type="text"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Reason for cancellation"
                      className="w-full p-2 text-xs rounded-xl bg-white border border-rose-300 text-rose-950 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCancelPrompt(false)}
                        className="py-1.5 px-3 rounded-xl border border-rose-300 bg-white text-xs font-semibold text-rose-800"
                      >
                        Keep Request
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmCancel}
                        disabled={cancelling}
                        className="py-1.5 px-3 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm disabled:opacity-50"
                      >
                        {cancelling ? 'Cancelling...' : 'Confirm Cancel & Unlock Funds'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalDetailsModal;
