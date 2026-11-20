import React, { useEffect, useState } from 'react';
import {
  ArrowDownToLine,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Ban,
  Receipt,
  Search,
  Building2,
  Calendar,
  Copy,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { adminTreasuryService } from '../../services/adminTreasuryService';
import { extractErrorMessage } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { WithdrawalModal } from '../../components/treasury/WithdrawalModal';
import { WithdrawalDetailsModal } from '../../components/treasury/WithdrawalDetailsModal';
import { useToast } from '../../context/ToastContext';

export const WithdrawalsPage = () => {
  const { addToast } = useToast();
  const [withdrawals, setWithdrawals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });
  const [treasuryData, setTreasuryData] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState(null);

  useEffect(() => {
    fetchWithdrawals();
    fetchTreasuryAndBanks();
  }, [pagination.page, statusFilter]);

  const fetchWithdrawals = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await adminTreasuryService.listWithdrawals({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
      });

      setWithdrawals(res.data || []);
      if (res.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: res.pagination.total,
          pages: res.pagination.pages,
        }));
      }
      if (isManual) addToast('Withdrawals list updated.', 'info');
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to fetch withdrawals.'), 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTreasuryAndBanks = async () => {
    try {
      const [tData, bData] = await Promise.all([
        adminTreasuryService.getOverview(),
        adminTreasuryService.listBankAccounts(),
      ]);
      setTreasuryData(tData);
      setBankAccounts(bData || []);
    } catch {
      // Non-blocking
    }
  };

  const handleCopy = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    addToast(`${label} copied!`, 'info');
  };

  const availableBalance = treasuryData?.availableWithdrawalBalanceRupees || 0;
  const pendingReservations = treasuryData?.withdrawals?.pendingAdminWithdrawalsRupees || 0;
  const completedWithdrawals = treasuryData?.withdrawals?.completedAdminWithdrawalsRupees || 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'successful':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Successful
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 animate-spin" /> Processing
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'failed':
      case 'reversed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3" /> {status === 'reversed' ? 'Reversed' : 'Failed'}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-300">
            <Ban className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-light-text flex items-center gap-2">
            <ArrowDownToLine className="w-6 h-6 text-brand-orange" />
            Admin Withdrawals & Payouts
          </h1>
          <p className="text-xs sm:text-sm text-light-muted mt-0.5">
            Track bank payout transfers, real-time settlement status, UTR numbers, and immutable ledger entries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchWithdrawals(true)}
            disabled={refreshing || loading}
            className="p-2.5 rounded-2xl bg-light-card border border-light-border text-light-muted hover:text-light-text hover:bg-light-secondary transition cursor-pointer"
            title="Refresh withdrawals"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand-primary' : ''}`} />
          </button>

          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={availableBalance < 100}
            className="px-5 py-2.5 rounded-2xl bg-brand-primary hover:bg-[#0E3B2E] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm active:scale-98 disabled:opacity-50"
          >
            <ArrowDownToLine className="w-4 h-4 text-brand-orange" />
            <span>Request Withdrawal</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-light-card border border-light-border shadow-xs space-y-1.5">
          <span className="text-[11px] font-semibold text-light-muted uppercase tracking-wider block">
            Available to Withdraw
          </span>
          <div className="text-2xl font-black text-brand-primary">{formatCurrency(availableBalance)}</div>
          <p className="text-[11px] text-light-muted">Real settled platform funds net of all liabilities</p>
        </div>

        <div className="p-5 rounded-3xl bg-light-card border border-light-border shadow-xs space-y-1.5">
          <span className="text-[11px] font-semibold text-light-muted uppercase tracking-wider block">
            Locked in Transfer (Pending)
          </span>
          <div className="text-2xl font-black text-amber-700">{formatCurrency(pendingReservations)}</div>
          <p className="text-[11px] text-light-muted">Reserved atomically during provider transfer</p>
        </div>

        <div className="p-5 rounded-3xl bg-light-card border border-light-border shadow-xs space-y-1.5">
          <span className="text-[11px] font-semibold text-light-muted uppercase tracking-wider block">
            Total Completed Payouts
          </span>
          <div className="text-2xl font-black text-emerald-700">{formatCurrency(completedWithdrawals)}</div>
          <p className="text-[11px] text-light-muted">Lifetime bank payouts settled</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-light-card border border-light-border shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'processing', 'pending', 'successful', 'failed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize cursor-pointer ${
                statusFilter === status
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-light-secondary/60 text-light-muted hover:text-light-text hover:bg-light-secondary'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Date Filter Inputs */}
        <div className="flex items-center gap-2 text-xs">
          <input
            type="date"
            value={dateFilter.startDate}
            onChange={(e) => setDateFilter((d) => ({ ...d, startDate: e.target.value }))}
            className="px-2.5 py-1.5 rounded-xl bg-light-secondary/50 border border-light-border text-light-text focus:outline-none"
          />
          <span className="text-light-muted">to</span>
          <input
            type="date"
            value={dateFilter.endDate}
            onChange={(e) => setDateFilter((d) => ({ ...d, endDate: e.target.value }))}
            className="px-2.5 py-1.5 rounded-xl bg-light-secondary/50 border border-light-border text-light-text focus:outline-none"
          />
          <button
            onClick={() => fetchWithdrawals()}
            className="px-3 py-1.5 rounded-xl bg-light-secondary text-light-text font-semibold hover:bg-light-border transition"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="rounded-3xl bg-light-card border border-light-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
            <span className="text-xs text-light-muted font-medium">Loading withdrawal history...</span>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Receipt className="w-10 h-10 text-light-muted mx-auto" />
            <h3 className="text-sm font-bold text-light-text">No Withdrawals Found</h3>
            <p className="text-xs text-light-muted">
              {statusFilter !== 'all'
                ? `No withdrawals matching '${statusFilter}' status.`
                : 'You have not submitted any withdrawal requests yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-light-border bg-light-secondary/30 text-[11px] font-bold text-light-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4">Withdrawal #</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Bank Account</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">UTR / Reference</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border">
                {withdrawals.map((w) => (
                  <tr key={w._id} className="hover:bg-light-secondary/20 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-light-text">
                      <div className="flex items-center gap-1.5">
                        <span>{w.withdrawalNumber}</span>
                        <button
                          onClick={() => handleCopy(w.withdrawalNumber, 'Withdrawal #')}
                          className="text-light-muted hover:text-brand-primary transition"
                          title="Copy withdrawal number"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-light-muted whitespace-nowrap">
                      {formatDate(w.requestedAt || w.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-light-text flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                        <span>{w.bankSnapshot?.bankName}</span>
                      </div>
                      <span className="font-mono text-[11px] text-light-muted">
                        {w.bankSnapshot?.maskedAccountNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-black text-brand-primary">
                        {formatCurrency((w.amountPaise || 0) / 100)}
                      </span>
                      <span className="block text-[10px] text-light-muted">
                        Fee: ₹0.00 | Net: {formatCurrency((w.netTransferPaise || 0) / 100)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(w.status)}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-light-muted">
                      {w.utrNumber ? (
                        <div className="flex items-center gap-1 text-light-text font-bold">
                          <span>{w.utrNumber}</span>
                          <button
                            onClick={() => handleCopy(w.utrNumber, 'UTR number')}
                            className="p-1 hover:text-brand-primary"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="italic text-light-muted">In Progress</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedWithdrawalId(w._id)}
                        className="px-3 py-1.5 rounded-xl border border-light-border hover:bg-light-secondary text-xs font-bold text-light-text transition cursor-pointer"
                      >
                        Receipt & Audit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-light-border flex items-center justify-between text-xs text-light-muted">
            <span>
              Page {pagination.page} of {pagination.pages} ({pagination.total} withdrawals)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-xl border border-light-border hover:bg-light-secondary disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
                disabled={pagination.page >= pagination.pages}
                className="p-1.5 rounded-xl border border-light-border hover:bg-light-secondary disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <WithdrawalModal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          availableBalanceRupees={availableBalance}
          bankAccounts={bankAccounts}
          onWithdrawalRequested={() => {
            fetchWithdrawals(true);
            fetchTreasuryAndBanks();
          }}
        />
      )}

      {/* Withdrawal Details & Audit Modal */}
      {selectedWithdrawalId && (
        <WithdrawalDetailsModal
          isOpen={Boolean(selectedWithdrawalId)}
          onClose={() => setSelectedWithdrawalId(null)}
          withdrawalId={selectedWithdrawalId}
          onCancelled={() => {
            fetchWithdrawals(true);
            fetchTreasuryAndBanks();
          }}
        />
      )}
    </div>
  );
};

export default WithdrawalsPage;
