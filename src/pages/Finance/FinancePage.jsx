import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  CreditCard,
  FileText,
  DollarSign,
  Send,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import financeService from '../../services/financeService';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner, TableSkeleton } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ChartContainer } from '../../components/charts/ChartContainer';
import { RevenueAnalyticsChart } from '../../components/charts/RevenueAnalyticsChart';
import { PaymentMethodDonut } from '../../components/charts/PaymentMethodDonut';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const FinancePage = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'transactions' | 'withdrawals' | 'config'
  const [loading, setLoading] = useState(true);

  // Financial overview & analytics
  const [financeOverview, setFinanceOverview] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [reconciling, setReconciling] = useState(false);

  // Transactions ledger
  const [transactions, setTransactions] = useState([]);
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [txTotal, setTxTotal] = useState(0);
  const [txTypeFilter, setTxTypeFilter] = useState('');

  // Withdrawals
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalPage, setWithdrawalPage] = useState(1);
  const [withdrawalTotalPages, setWithdrawalTotalPages] = useState(1);
  const [withdrawalTotal, setWithdrawalTotal] = useState(0);
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState('');

  // Payout / Action Modal
  const [actionWithdrawal, setActionWithdrawal] = useState(null);
  const [actionType, setActionType] = useState('pay'); // 'approve' | 'pay' | 'reject'
  const [paymentReference, setPaymentReference] = useState('');
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  // Platform Config
  const [config, setConfig] = useState({
    commissionRatePercent: 10,
    codFeePaise: 1500,
    minWithdrawalPaise: 50000,
  });
  const [configSaving, setConfigSaving] = useState(false);

  const fetchFinanceData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, configRes, analyticsRes] = await Promise.allSettled([
        financeService.getOverview(),
        financeService.getConfig(),
        financeService.getAnalytics({ days: 30 }),
      ]);

      if (overviewRes.status === 'fulfilled') setFinanceOverview(overviewRes.value);
      if (configRes.status === 'fulfilled' && configRes.value?.config) {
        setConfig(configRes.value.config);
      }
      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value);
      }
    } catch (err) {
      console.error('Failed to load finance data:', err);
      addToast('Failed to load financial ledger.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const handleRunReconciliation = async () => {
    setReconciling(true);
    try {
      const res = await financeService.reconcileLedger();
      addToast(res.message || 'Ledger reconciled and backfilled successfully!', 'success');
      await fetchFinanceData();
      if (activeTab === 'transactions') fetchTransactions();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reconcile ledger.', 'error');
    } finally {
      setReconciling(false);
    }
  };

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await financeService.getTransactions({
        page: txPage,
        limit: 15,
        transactionType: txTypeFilter,
      });
      setTransactions(res.transactions || res.data || []);
      setTxTotalPages(res.pagination?.pages || res.totalPages || 1);
      setTxTotal(res.pagination?.total || res.total || 0);
    } catch {
      // Ignored
    }
  }, [txPage, txTypeFilter]);

  const fetchWithdrawals = useCallback(async () => {
    try {
      const res = await financeService.listWithdrawals({
        page: withdrawalPage,
        limit: 15,
        status: withdrawalStatusFilter,
      });
      setWithdrawals(res.withdrawals || res.data || []);
      setWithdrawalTotalPages(res.pagination?.pages || res.totalPages || 1);
      setWithdrawalTotal(res.pagination?.total || res.total || 0);
    } catch {
      // Ignored
    }
  }, [withdrawalPage, withdrawalStatusFilter]);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  useEffect(() => {
    if (activeTab === 'transactions') fetchTransactions();
    if (activeTab === 'withdrawals') fetchWithdrawals();
  }, [activeTab, fetchTransactions, fetchWithdrawals]);

  const handleWithdrawalAction = async (e) => {
    e.preventDefault();
    if (!actionWithdrawal) return;

    setProcessing(true);
    try {
      if (actionType === 'approve') {
        await financeService.approveWithdrawal(actionWithdrawal._id, remarks);
        addToast('Withdrawal approved for processing.', 'success');
      } else if (actionType === 'pay') {
        if (!paymentReference.trim()) {
          addToast('Payment reference (UTR/Bank Ref) is required.', 'error');
          setProcessing(false);
          return;
        }
        await financeService.recordManualPayout(actionWithdrawal._id, {
          paymentReference,
          remarks,
        });
        addToast('Payout recorded and settled in ledger.', 'success');
      } else if (actionType === 'reject') {
        if (!remarks.trim()) {
          addToast('Please provide a reason for rejecting this withdrawal.', 'error');
          setProcessing(false);
          return;
        }
        await financeService.rejectWithdrawal(actionWithdrawal._id, remarks);
        addToast('Withdrawal rejected. Reserved funds refunded to chef.', 'info');
      }

      setActionWithdrawal(null);
      fetchWithdrawals();
      fetchFinanceData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to process withdrawal action.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setConfigSaving(true);
    try {
      await financeService.updateConfig(config);
      addToast('Financial platform parameters updated successfully.', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update configuration.', 'error');
    } finally {
      setConfigSaving(false);
    }
  };

  const collections = financeOverview?.collections || {};
  const platformRevenue = financeOverview?.platformRevenue || {};
  const platformExpenses = financeOverview?.platformExpenses || {};
  const chefEarnings = financeOverview?.chefEarnings || {};
  const refunds = financeOverview?.refunds || {};

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-light-text">
            Financial Ledger & Wallet Accounting
          </h2>
          <p className="text-xs text-light-muted mt-1">
            Reconciled collections, commission ledger, chef liabilities, and withdrawal payouts.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-light-border bg-light-card text-xs font-semibold">
          {[
            { id: 'overview', label: 'Ledger Summary' },
            { id: 'transactions', label: 'Transactions' },
            { id: 'withdrawals', label: 'Chef Payouts' },
            { id: 'config', label: 'Rates & Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-light-muted hover:text-light-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Ledger Summary */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Segregated Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Gross Collections"
              value={formatCurrency(collections.grossCustomerCollections || 0)}
              icon={Coins}
              iconColor="text-blue-600"
              iconBg="bg-blue-500/10"
              subtitle={`Online: ${formatCurrency(collections.onlinePaymentCollections || 0)} | COD: ${formatCurrency(collections.codCashCollections || 0)}`}
              badge="Total Inflow"
            />

            <StatCard
              title="Gross Platform Revenue"
              value={formatCurrency(platformRevenue.grossPlatformRevenue || 0)}
              icon={Wallet}
              iconColor="text-brand-primary"
              iconBg="bg-brand-primary/10"
              subtitle={`Comm: ${formatCurrency(platformRevenue.commissionRevenue || 0)} | COD Fee: ${formatCurrency(platformRevenue.codFeeRevenue || 0)}`}
              badge="Earned"
            />

            <StatCard
              title="Platform Expenses"
              value={formatCurrency(platformExpenses.totalPlatformExpenses || platformRevenue.promotionalDiscountExpenses || 0)}
              icon={XCircle}
              iconColor="text-rose-600"
              iconBg="bg-rose-500/10"
              subtitle={`Subsidy: ${formatCurrency(platformExpenses.promotionalDiscountExpenses || platformRevenue.promotionalDiscountExpenses || 0)} | Gateways: ${formatCurrency(platformExpenses.estimatedGatewayCharges || platformRevenue.estimatedGatewayCharges || 0)}`}
              badge="Costs"
            />

            <StatCard
              title="Net Operating Income"
              value={formatCurrency(platformRevenue.netPlatformOperatingIncome || 0)}
              icon={TrendingUp}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-500/10"
              subtitle="Realized platform margin"
              badge="Net Profit"
            />

            <StatCard
              title="Chef Payables / Escrow"
              value={formatCurrency(chefEarnings.chefEarningsPayable || 0)}
              icon={Clock}
              iconColor="text-amber-600"
              iconBg="bg-amber-500/10"
              subtitle={`Available: ${formatCurrency(chefEarnings.chefAvailable || 0)} | Pending: ${formatCurrency(chefEarnings.chefPending || 0)}`}
              badge="Chef Liability"
            />
          </div>

          {/* Ledger Health & Self-Healing Action Banner */}
          <div className="p-4 sm:p-5 rounded-2xl border border-light-border bg-light-card shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-light-text flex items-center gap-2">
                  Double-Entry Ledger Status: Synchronized & Verified
                  <Badge variant="success">Active</Badge>
                </h4>
                <p className="text-xs text-light-muted mt-0.5">
                  Delivered orders, payment captures, platform commission credits, and chef earnings are reconciled against immutable transaction ledgers.
                </p>
              </div>
            </div>

            <button
              onClick={handleRunReconciliation}
              disabled={reconciling}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-light-secondary hover:bg-light-border text-light-text text-xs font-semibold border border-light-border transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${reconciling ? 'animate-spin' : ''}`} />
              {reconciling ? 'Reconciling Ledger...' : 'Reconcile & Backfill Ledger'}
            </button>
          </div>

          {/* Financial Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartContainer
                title="Revenue, Commission & Chef Earnings Trend"
                subtitle="Daily GMV, Platform Commission, and Net Chef Payouts (Last 30 Days)"
              >
                <RevenueAnalyticsChart
                  data={analytics?.timeline || []}
                  height={280}
                />
              </ChartContainer>
            </div>

            <div>
              <ChartContainer
                title="Payment Collections Mix"
                subtitle="Online Prepaid vs Cash on Delivery"
              >
                <PaymentMethodDonut
                  data={analytics?.paymentDistribution || []}
                  height={240}
                />
              </ChartContainer>
            </div>
          </div>

          {/* Revenue Distribution Business Rules Explainer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-light-border bg-light-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-light-text">Online Order (Standard)</span>
                <Badge variant="success">10% Commission</Badge>
              </div>
              <p className="text-xs text-light-muted leading-relaxed">
                Customer receives fixed ₹20 online discount funded by platform. Chef receives 90% of original food price. Platform earns 10% commission minus discount & gateway fees.
              </p>
              <div className="text-[11px] text-light-muted font-mono bg-light-secondary/40 p-2 rounded-lg">
                Ex: ₹500 Food &rarr; Cust pays ₹480 | Chef ₹450 | Admin ₹50 - ₹20 = ₹30 Net
              </div>
            </div>

            <div className="p-4 rounded-xl border border-light-border bg-light-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-light-text">First Order Benefit</span>
                <Badge variant="warning">0% Commission</Badge>
              </div>
              <p className="text-xs text-light-muted leading-relaxed">
                New HomeChefs pay 0% commission on their first completed order. Chef retains 100% of food price. Platform absorbs promotional discount and gateway cost.
              </p>
              <div className="text-[11px] text-light-muted font-mono bg-light-secondary/40 p-2 rounded-lg">
                Ex: ₹500 Food &rarr; Cust pays ₹480 | Chef ₹500 | Admin ₹0 - ₹20 = -₹20 Net
              </div>
            </div>

            <div className="p-4 rounded-xl border border-light-border bg-light-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-light-text">Cash on Delivery (COD)</span>
                <Badge variant="info">₹20 COD Fee</Badge>
              </div>
              <p className="text-xs text-light-muted leading-relaxed">
                Customer pays ₹20 surcharge. Chef keeps entire cash collected. Chef Commission Wallet is charged 10% commission + ₹20 COD fee on delivery.
              </p>
              <div className="text-[11px] text-light-muted font-mono bg-light-secondary/40 p-2 rounded-lg">
                Ex: ₹500 Food &rarr; Cust pays ₹520 | Chef keeps cash | Wallet debited ₹70
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Transactions Ledger */}
      {activeTab === 'transactions' && (
        <Card bodyClassName="p-0 overflow-x-auto">
          <div className="p-4 border-b border-light-border flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-light-text">
              Platform Ledger Audit Trail
            </h3>

            <select
              value={txTypeFilter}
              onChange={(e) => {
                setTxTypeFilter(e.target.value);
                setTxPage(1);
              }}
              className="rounded-xl border border-light-border bg-light-card px-3 py-1.5 text-xs text-light-text focus:outline-none cursor-pointer"
            >
              <option value="">All Transaction Types</option>
              <option value="commission_credit">Commission Credit</option>
              <option value="cod_fee_credit">COD Fee Credit</option>
              <option value="promotional_discount_expense">Promotional Discount</option>
              <option value="refund_debit">Refund Debit</option>
            </select>
          </div>

          {transactions.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No transactions logged"
              description="No ledger transactions match this filter."
              className="my-8 border-none"
            />
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead className="border-b border-light-border bg-light-secondary/40 text-light-muted font-semibold">
                  <tr>
                    <th className="py-3 px-4">Tx Number</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Balance After</th>
                    <th className="py-3 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-light-secondary/20 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium">{tx.transactionNumber}</td>
                      <td className="py-3 px-4 capitalize">{tx.transactionType?.replace(/_/g, ' ')}</td>
                      <td className="py-3 px-4 font-bold text-light-text">
                        {formatCurrency(tx.amountPaise / 100)}
                      </td>
                      <td className="py-3 px-4 text-light-muted">
                        {formatCurrency(tx.balanceAfterPaise / 100)}
                      </td>
                      <td className="py-3 px-4 text-right text-light-muted whitespace-nowrap">
                        {formatDateTime(tx.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            currentPage={txPage}
            totalPages={txTotalPages}
            totalItems={txTotal}
            pageSize={15}
            onPageChange={setTxPage}
          />
        </Card>
      )}

      {/* Tab 3: Chef Payouts & Withdrawals */}
      {activeTab === 'withdrawals' && (
        <Card bodyClassName="p-0 overflow-x-auto">
          <div className="p-4 border-b border-light-border flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-light-text">
              HomeChef Bank Payout Requests
            </h3>

            <select
              value={withdrawalStatusFilter}
              onChange={(e) => {
                setWithdrawalStatusFilter(e.target.value);
                setWithdrawalPage(1);
              }}
              className="rounded-xl border border-light-border bg-light-card px-3 py-1.5 text-xs text-light-text focus:outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="requested">Requested</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid / Settled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {withdrawals.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No withdrawal requests"
              description="No chef payout requests pending in this view."
              className="my-8 border-none"
            />
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead className="border-b border-light-border bg-light-secondary/40 text-light-muted font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">HomeChef</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Bank Details</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Requested On</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border">
                  {withdrawals.map((w) => (
                    <tr key={w._id} className="hover:bg-light-secondary/20 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-light-text">
                        {w.chefId?.name || 'HomeChef'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-light-text">
                        {formatCurrency(w.amountPaise / 100)}
                      </td>
                      <td className="py-3.5 px-4 text-light-muted">
                        {w.bankDetails?.bankName || 'UPI'} • {w.bankDetails?.accountNumber || w.bankDetails?.upiId || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={w.status} size="xs" />
                      </td>
                      <td className="py-3.5 px-4 text-light-muted whitespace-nowrap">
                        {formatDateTime(w.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {w.status === 'requested' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setActionWithdrawal(w);
                                setActionType('approve');
                                setRemarks('');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setActionWithdrawal(w);
                                setActionType('reject');
                                setRemarks('');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {w.status === 'approved' && (
                          <button
                            onClick={() => {
                              setActionWithdrawal(w);
                              setActionType('pay');
                              setPaymentReference('');
                              setRemarks('');
                            }}
                            className="px-3 py-1 rounded-lg bg-brand-primary text-white font-semibold text-[11px] hover:bg-brand-primary-dark cursor-pointer"
                          >
                            Record Payout
                          </button>
                        )}

                        {['paid', 'rejected'].includes(w.status) && (
                          <span className="text-[11px] text-light-muted">Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            currentPage={withdrawalPage}
            totalPages={withdrawalTotalPages}
            totalItems={withdrawalTotal}
            pageSize={15}
            onPageChange={setWithdrawalPage}
          />
        </Card>
      )}

      {/* Tab 4: Financial Platform Config */}
      {activeTab === 'config' && (
        <Card title="Marketplace Financial Parameters" subtitle="Adjust fee structures and payout thresholds">
          <form onSubmit={handleSaveConfig} className="max-w-md space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-light-text mb-1">
                Standard Commission Rate (%)
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={config.commissionRatePercent}
                onChange={(e) => setConfig({ ...config, commissionRatePercent: Number(e.target.value) })}
                className="w-full rounded-xl border border-light-border bg-light-secondary/40 p-2.5 text-xs text-light-text focus:outline-none"
              />
              <p className="text-[10px] text-light-muted mt-1">
                Platform fee percentage deducted upon successful order delivery.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-light-text mb-1">
                COD Collection Fee (Rupees)
              </label>
              <input
                type="number"
                min={0}
                value={config.codFeePaise ? config.codFeePaise / 100 : 15}
                onChange={(e) => setConfig({ ...config, codFeePaise: Number(e.target.value) * 100 })}
                className="w-full rounded-xl border border-light-border bg-light-secondary/40 p-2.5 text-xs text-light-text focus:outline-none"
              />
              <p className="text-[10px] text-light-muted mt-1">
                Flat processing surcharge applied to cash-on-delivery orders.
              </p>
            </div>

            <button
              type="submit"
              disabled={configSaving}
              className="mt-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white font-bold shadow-xs hover:bg-brand-primary-dark transition-colors cursor-pointer disabled:opacity-60"
            >
              {configSaving ? 'Saving...' : 'Save Parameters'}
            </button>
          </form>
        </Card>
      )}

      {/* Payout Action Modal */}
      <Modal
        isOpen={!!actionWithdrawal}
        onClose={() => setActionWithdrawal(null)}
        title={
          actionType === 'pay'
            ? 'Record Bank Payout'
            : actionType === 'approve'
            ? 'Approve Withdrawal Request'
            : 'Reject Withdrawal Request'
        }
        subtitle={`Amount: ${actionWithdrawal ? formatCurrency(actionWithdrawal.amountPaise / 100) : ''}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleWithdrawalAction} className="space-y-4 text-xs">
          {actionType === 'pay' && (
            <div>
              <label className="block font-semibold text-light-text mb-1.5">
                Bank UTR / Transaction Reference *
              </label>
              <input
                type="text"
                required
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g. UTR123456789012"
                className="w-full rounded-xl border border-light-border bg-light-secondary/40 p-2.5 text-xs text-light-text focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-light-text mb-1.5">
              {actionType === 'reject' ? 'Rejection Reason *' : 'Internal Remarks (Optional)'}
            </label>
            <textarea
              rows={3}
              required={actionType === 'reject'}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Notes for ledger records..."
              className="w-full rounded-xl border border-light-border bg-light-secondary/40 p-2.5 text-xs text-light-text focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-light-border">
            <button
              type="button"
              onClick={() => setActionWithdrawal(null)}
              className="px-4 py-2 rounded-xl border border-light-border font-medium hover:bg-light-secondary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className={`px-5 py-2 rounded-xl text-white font-bold shadow-xs transition-colors cursor-pointer ${
                actionType === 'reject' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-primary hover:bg-brand-primary-dark'
              }`}
            >
              {processing ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FinancePage;
