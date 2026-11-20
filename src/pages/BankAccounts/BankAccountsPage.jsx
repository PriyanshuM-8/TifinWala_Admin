import React, { useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Star,
  Trash2,
  RefreshCw,
  CreditCard,
  Lock,
  ArrowDownToLine,
  Loader2,
} from 'lucide-react';
import { adminTreasuryService } from '../../services/adminTreasuryService';
import { extractErrorMessage } from '../../services/api';
import { AddBankAccountModal } from '../../components/treasury/AddBankAccountModal';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export const BankAccountsPage = () => {
  const { addToast } = useToast();
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await adminTreasuryService.listBankAccounts();
      setBankAccounts(data || []);
      if (isManual) addToast('Bank accounts refreshed.', 'info');
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to fetch bank accounts.'), 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleVerify = async (accountId) => {
    setActionId(accountId);
    try {
      await adminTreasuryService.verifyBankAccount(accountId);
      addToast('Bank account verified successfully!', 'success');
      fetchAccounts();
    } catch (err) {
      addToast(extractErrorMessage(err, 'Verification failed.'), 'error');
    } finally {
      setActionId(null);
    }
  };

  const handleSetDefault = async (accountId) => {
    setActionId(accountId);
    try {
      await adminTreasuryService.setDefaultBankAccount(accountId);
      addToast('Default payout account updated!', 'success');
      fetchAccounts();
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to set default.'), 'error');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (accountId, bankName) => {
    if (!window.confirm(`Are you sure you want to remove ${bankName}?`)) return;

    setActionId(accountId);
    try {
      await adminTreasuryService.deleteBankAccount(accountId);
      addToast('Bank account removed.', 'success');
      fetchAccounts();
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to remove bank account.'), 'error');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-light-text flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-primary" />
            Admin Bank Accounts
          </h1>
          <p className="text-xs sm:text-sm text-light-muted mt-0.5">
            Add and manage verified destination accounts for platform earnings payouts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchAccounts(true)}
            disabled={refreshing || loading}
            className="p-2.5 rounded-2xl bg-light-card border border-light-border text-light-muted hover:text-light-text hover:bg-light-secondary transition cursor-pointer"
            title="Refresh bank accounts"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand-primary' : ''}`} />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-brand-primary hover:bg-[#0E3B2E] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm active:scale-98"
          >
            <Plus className="w-4 h-4 text-brand-orange" />
            <span>Add Bank Account</span>
          </button>
        </div>
      </div>

      {/* Security Notice Card */}
      <div className="p-4 rounded-3xl bg-light-secondary/60 border border-light-border flex items-start sm:items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs text-light-muted">
          <span className="font-bold text-light-text block">Bank-Grade Field Encryption Active</span>
          Raw account numbers and IFSC codes are encrypted using AES-256-GCM at rest and permanently masked in UI
          responses. Withdrawals can only be dispatched to verified accounts.
        </div>
      </div>

      {/* Accounts List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
          <span className="text-xs text-light-muted font-medium">Loading bank accounts...</span>
        </div>
      ) : bankAccounts.length === 0 ? (
        <div className="p-10 rounded-3xl bg-light-card border border-light-border text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-light-secondary text-light-muted mx-auto flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-light-text">No Bank Accounts Added Yet</h3>
          <p className="text-xs text-light-muted max-w-sm mx-auto">
            Add your company or proprietary bank account to enable platform earnings withdrawal transfers.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-primary text-white text-xs font-bold hover:bg-[#0E3B2E] transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 text-brand-orange" />
            <span>Add Bank Account Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bankAccounts.map((account) => {
            const isActing = actionId === account._id;

            return (
              <div
                key={account._id}
                className={`p-6 rounded-3xl bg-light-card border transition shadow-xs flex flex-col justify-between space-y-4 ${
                  account.isDefault
                    ? 'border-brand-primary ring-1 ring-brand-primary/20'
                    : 'border-light-border hover:border-light-border/80'
                }`}
              >
                {/* Card Top: Bank Name & Status */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-light-text">{account.bankName}</h3>
                        <span className="text-[11px] text-light-muted uppercase font-medium">
                          {account.accountType} Account
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {account.isDefault && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-primary text-white">
                          <Star className="w-3 h-3 fill-current" /> Default
                        </span>
                      )}
                      {account.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertCircle className="w-3 h-3" /> Unverified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Masked Account Details */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-light-secondary/50 border border-light-border space-y-2">
                    <div>
                      <span className="text-[10px] font-semibold text-light-muted uppercase tracking-wider block">
                        Account Holder
                      </span>
                      <span className="text-xs font-bold text-light-text">{account.accountHolderName}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-light-border">
                      <div>
                        <span className="text-[10px] font-semibold text-light-muted uppercase tracking-wider block">
                          Account Number
                        </span>
                        <span className="font-mono text-xs font-bold text-light-text tracking-wider">
                          {account.maskedAccountNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-light-muted uppercase tracking-wider block">
                          IFSC Code
                        </span>
                        <span className="font-mono text-xs font-bold text-light-text tracking-wider">
                          {account.maskedIfscCode}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Actions */}
                <div className="pt-2 border-t border-light-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {!account.isVerified && (
                      <button
                        onClick={() => handleVerify(account._id)}
                        disabled={isActing}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {isActing ? 'Verifying...' : 'Verify Account'}
                      </button>
                    )}

                    {account.isVerified && !account.isDefault && (
                      <button
                        onClick={() => handleSetDefault(account._id)}
                        disabled={isActing}
                        className="px-3 py-1.5 rounded-xl border border-light-border hover:bg-light-secondary text-xs font-bold text-light-text transition cursor-pointer disabled:opacity-50"
                      >
                        {isActing ? 'Setting...' : 'Set as Default'}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(account._id, account.bankName)}
                    disabled={isActing}
                    className="p-1.5 rounded-xl text-light-muted hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Remove Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Bank Account Modal */}
      {showAddModal && (
        <AddBankAccountModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAccountAdded={() => fetchAccounts(true)}
        />
      )}
    </div>
  );
};

export default BankAccountsPage;
