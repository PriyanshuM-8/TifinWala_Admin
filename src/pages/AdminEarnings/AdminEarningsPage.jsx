import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Landmark,
  Building2,
  ArrowDownToLine,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Wallet,
  ArrowUpRight,
  Receipt,
  Scale,
  Lock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { adminTreasuryService } from '../../services/adminTreasuryService';
import { extractErrorMessage } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { WithdrawalModal } from '../../components/treasury/WithdrawalModal';
import { useToast } from '../../context/ToastContext';

export const AdminEarningsPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [treasuryRes, banksRes] = await Promise.all([
        adminTreasuryService.getOverview(),
        adminTreasuryService.listBankAccounts(),
      ]);
      setData(treasuryRes);
      setBankAccounts(banksRes || []);
      if (isManual) addToast('Treasury figures updated.', 'info');
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to fetch treasury overview.'), 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const availableBalance = data?.availableWithdrawalBalanceRupees || 0;
  const liquid = data?.liquidTreasury || {};
  const expenses = data?.expensesAndOutflows || {};
  const liabilities = data?.liabilities || {};
  const accounting = data?.accounting || {};
  const withdrawals = data?.withdrawals || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-light-text flex items-center gap-2">
            <Landmark className="w-6 h-6 text-brand-primary" />
            Admin Earnings & Platform Treasury
          </h1>
          <p className="text-xs sm:text-sm text-light-muted mt-0.5">
            Reconciled liquid cash in bank vs accounting revenue with escrow liability protection.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            className="p-2.5 rounded-2xl bg-light-card border border-light-border text-light-muted hover:text-light-text hover:bg-light-secondary transition cursor-pointer"
            title="Refresh treasury metrics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand-primary' : ''}`} />
          </button>

          <button
            onClick={() => navigate('/bank-accounts')}
            className="px-4 py-2.5 rounded-2xl bg-light-card border border-light-border text-xs font-bold text-light-text hover:bg-light-secondary transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Building2 className="w-4 h-4 text-brand-primary" />
            <span>Bank Accounts ({bankAccounts.length})</span>
          </button>

          <button
            onClick={() => setShowWithdrawalModal(true)}
            disabled={availableBalance < 100}
            className="px-5 py-2.5 rounded-2xl bg-brand-primary hover:bg-[#0E3B2E] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm active:scale-98 disabled:opacity-50"
          >
            <ArrowDownToLine className="w-4 h-4 text-brand-orange" />
            <span>Withdraw Earnings</span>
          </button>
        </div>
      </div>

      {/* Primary Available Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#14513F] via-[#114234] to-[#0B2C23] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-72 h-72 rounded-full bg-brand-orange/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-[11px] font-semibold backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-orange" />
              <span>Real Settled Funds (Net of All Chef Escrow & Operating Buffer)</span>
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {formatCurrency(availableBalance)}
            </div>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
              Calculated from actual settled gateway funds held in the platform account, strictly deducting chef
              custodial earnings, unconsumed chef deposits, and pending withdrawal reservations.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:items-end justify-center">
            <button
              onClick={() => setShowWithdrawalModal(true)}
              disabled={availableBalance < 100}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-brand-orange hover:bg-[#e0912f] text-white text-xs sm:text-sm font-black transition shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Request Payout Transfer</span>
            </button>
            <div className="text-[11px] text-white/70 flex items-center gap-1.5">
              <span>Completed Payouts:</span>
              <span className="font-bold text-white">
                {formatCurrency(withdrawals.completedAdminWithdrawalsRupees || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Key Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Liquid Treasury */}
        <div className="p-5 rounded-3xl bg-light-card border border-light-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-light-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Liquid Treasury</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-light-text">
            {formatCurrency(liquid.grossLiquidTreasuryRupees || 0)}
          </div>
          <p className="text-[11px] text-light-muted">
            Total online gateway collections minus gateway charges, refunds & payouts.
          </p>
        </div>

        {/* Card 2: Platform Net Accounting Revenue */}
        <div className="p-5 rounded-3xl bg-light-card border border-light-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-light-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Realized Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-700">
            {formatCurrency(accounting.netRealizedAccountingEarningsRupees || 0)}
          </div>
          <p className="text-[11px] text-light-muted">
            Commission (10%) + COD Fees (₹20) minus promotional subsidies & expenses.
          </p>
        </div>

        {/* Card 3: Custodial Liabilities */}
        <div className="p-5 rounded-3xl bg-light-card border border-light-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-light-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Custodial Liabilities</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-700">
            {formatCurrency(liabilities.totalLiabilitiesRupees || 0)}
          </div>
          <p className="text-[11px] text-light-muted">
            Chef earnings payable ({formatCurrency(liabilities.chefTotalEscrowLiabilityRupees || 0)}) + deposits & buffer.
          </p>
        </div>

        {/* Card 4: Total Withdrawn */}
        <div className="p-5 rounded-3xl bg-light-card border border-light-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-light-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Withdrawn</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-purple-700">
            {formatCurrency(withdrawals.completedAdminWithdrawalsRupees || 0)}
          </div>
          <p className="text-[11px] text-light-muted">
            Pending in transfer: {formatCurrency(withdrawals.pendingAdminWithdrawalsRupees || 0)}
          </p>
        </div>
      </div>

      {/* Dual Comparison Section: Reconciled Cash vs Accounting Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Treasury Liquid Cash Breakdown */}
        <div className="p-6 rounded-3xl bg-light-card border border-light-border shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-light-border pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-brand-primary" />
              <h2 className="text-sm font-bold text-light-text">1. Settled Treasury Cash Breakdown</h2>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">Bank Funds</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 text-light-muted">
              <span>Total Settled Online Inflows:</span>
              <span className="font-semibold text-light-text">
                +{formatCurrency(liquid.totalSettledGatewayInflowsRupees || 0)}
              </span>
            </div>
            <div className="flex justify-between py-1 text-light-muted">
              <span>Customer Online Orders (Captured):</span>
              <span className="font-medium text-light-text">
                {formatCurrency(liquid.onlineOrderCollectionsRupees || 0)}
              </span>
            </div>
            <div className="flex justify-between py-1 text-light-muted">
              <span>Subscription Online Collections:</span>
              <span className="font-medium text-light-text">
                {formatCurrency(liquid.subscriptionCollectionsRupees || 0)}
              </span>
            </div>
            <div className="flex justify-between py-1 text-light-muted">
              <span>Chef Commission Wallet Recharges:</span>
              <span className="font-medium text-light-text">
                {formatCurrency(liquid.chefRechargeCollectionsRupees || 0)}
              </span>
            </div>
            <div className="flex justify-between py-1 text-light-muted border-t border-light-border pt-2">
              <span>Estimated Gateway Charges (2.36%):</span>
              <span className="font-semibold text-rose-600">
                -{formatCurrency(expenses.estimatedGatewayChargesRupees || 0)}
              </span>
            </div>
            <div className="flex justify-between py-1 text-light-muted">
              <span>Processed Customer Refunds:</span>
              <span className="font-semibold text-rose-600">
                -{formatCurrency(expenses.processedRefundsRupees || 0)}
              </span>
            </div>
            <div className="flex justify-between py-1 text-light-muted">
              <span>Completed Chef Payouts Paid Out:</span>
              <span className="font-semibold text-rose-600">
                -{formatCurrency(expenses.chefPaidWithdrawalsRupees || 0)}
              </span>
            </div>
            <div className="flex justify-between py-1 text-light-muted">
              <span>Completed Admin Withdrawals:</span>
              <span className="font-semibold text-rose-600">
                -{formatCurrency(withdrawals.completedAdminWithdrawalsRupees || 0)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-t-2 border-light-border font-bold text-light-text text-sm">
              <span>Gross Liquid Treasury Cash:</span>
              <span className="text-brand-primary">{formatCurrency(liquid.grossLiquidTreasuryRupees || 0)}</span>
            </div>
          </div>
        </div>

        {/* Third-Party Custodial Liabilities Breakdown */}
        <div className="p-6 rounded-3xl bg-light-card border border-light-border shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-light-border pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              <h2 className="text-sm font-bold text-light-text">2. Custodial Liabilities (Cannot Withdraw)</h2>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700">Protected</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 text-light-muted">
              <span>Chef Withdrawable Balances (Available):</span>
              <span className="font-semibold text-amber-800">
                {formatCurrency(liabilities.chefAvailableEarningsRupees || 0)}
              </span>
            </div>
            <div className="flex justify-between py-1 text-light-muted">
              <span>Chef In-Transit Cooking/Delivery (Pending):</span>
              <span className="font-semibold text-amber-800">
                {formatCurrency(liabilities.chefPendingEarningsRupees || 0)}
              </span>
            </div>
            <div className="flex justify-between py-1 text-light-muted">
              <span>Chef Reserved Withdrawals (Pending Transfer):</span>
              <span className="font-semibold text-amber-800">
                {formatCurrency(liabilities.chefReservedWithdrawalsRupees || 0)}
              </span>
            </div>
            <div className="flex justify-between py-1 text-light-muted">
              <span>Unconsumed Chef Commission Deposits:</span>
              <span className="font-semibold text-amber-800">
                {formatCurrency(liabilities.unconsumedChefDepositsRupees || 0)}
              </span>
            </div>
            <div className="flex justify-between py-1 text-light-muted">
              <span>Platform Minimum Liquidity Buffer:</span>
              <span className="font-semibold text-amber-800">
                {formatCurrency(liabilities.operatingBufferRupees || 0)}
              </span>
            </div>
            <div className="flex justify-between py-1 text-light-muted border-t border-light-border pt-2">
              <span>Pending Admin Withdrawals (Reserved):</span>
              <span className="font-semibold text-purple-700">
                {formatCurrency(withdrawals.pendingAdminWithdrawalsRupees || 0)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-t-2 border-light-border font-bold text-light-text text-sm">
              <span>Total Active Custodial Obligations:</span>
              <span className="text-rose-600">{formatCurrency(liabilities.totalLiabilitiesRupees || 0)}</span>
            </div>
            <p className="text-[11px] text-light-muted italic pt-1">
              * Protected by the dual-ceiling formula to prevent spending partner chef earnings.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/bank-accounts')}
          className="p-5 rounded-3xl bg-light-card border border-light-border hover:border-brand-primary transition flex items-center justify-between text-left cursor-pointer group shadow-xs"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-light-text">Manage Bank Accounts</h3>
              <p className="text-xs text-light-muted">
                {bankAccounts.length} account{bankAccounts.length === 1 ? '' : 's'} registered ({bankAccounts.filter(a => a.isVerified).length} verified)
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-light-muted group-hover:text-brand-primary transition" />
        </button>

        <button
          onClick={() => navigate('/withdrawals')}
          className="p-5 rounded-3xl bg-light-card border border-light-border hover:border-brand-primary transition flex items-center justify-between text-left cursor-pointer group shadow-xs"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center group-hover:bg-brand-orange group-hover:text-white transition">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-light-text">Withdrawal Payout History</h3>
              <p className="text-xs text-light-muted">Track settlement status, UTR numbers, and traceable ledger trails</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-light-muted group-hover:text-brand-orange transition" />
        </button>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <WithdrawalModal
          isOpen={showWithdrawalModal}
          onClose={() => setShowWithdrawalModal(false)}
          availableBalanceRupees={availableBalance}
          bankAccounts={bankAccounts}
          onWithdrawalRequested={() => {
            fetchData(true);
            navigate('/withdrawals');
          }}
        />
      )}
    </div>
  );
};

export default AdminEarningsPage;
