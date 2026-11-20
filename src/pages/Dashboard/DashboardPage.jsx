import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ChefHat,
  ShoppingBag,
  TrendingUp,
  Wallet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  UtensilsCrossed,
  Calendar,
  CreditCard,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import reportService from '../../services/reportService';
import orderService from '../../services/orderService';
import chefService from '../../services/chefService';
import auditLogService from '../../services/auditLogService';
import customerService from '../../services/customerService';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ChartContainer } from '../../components/charts/ChartContainer';
import { OrderAnalyticsChart } from '../../components/charts/OrderAnalyticsChart';
import { RevenueAnalyticsChart } from '../../components/charts/RevenueAnalyticsChart';
import { CustomerGrowthChart } from '../../components/charts/CustomerGrowthChart';
import { ChefAnalyticsChart } from '../../components/charts/ChefAnalyticsChart';
import { OrderDistributionDonut } from '../../components/charts/OrderDistributionDonut';
import { PaymentMethodDonut } from '../../components/charts/PaymentMethodDonut';
import { formatCurrency, formatDateTime, formatNumber } from '../../utils/formatters';
import { PERIOD_OPTIONS } from '../../utils/constants';

export const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30days');

  // Overview metrics from backend
  const [overview, setOverview] = useState(null);

  // Reports data for charts
  const [orderReport, setOrderReport] = useState(null);
  const [revenueReport, setRevenueReport] = useState(null);
  const [customerReport, setCustomerReport] = useState(null);
  const [chefReport, setChefReport] = useState(null);

  // Recent operational items
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingChefs, setPendingChefs] = useState([]);
  const [topChefs, setTopChefs] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [
        overviewRes,
        orderRepRes,
        revRepRes,
        custRepRes,
        chefRepRes,
        recentOrdersRes,
        pendingChefsRes,
        recentCustRes,
        auditLogsRes,
      ] = await Promise.allSettled([
        dashboardService.getOverview({ period: selectedPeriod }),
        reportService.getOrderReport(),
        reportService.getRevenueReport(),
        reportService.getCustomerReport(),
        reportService.getChefReport({ limit: 5 }),
        orderService.listOrders({ page: 1, limit: 6 }),
        chefService.listChefs({ page: 1, limit: 4, approvalStatus: 'pending' }),
        customerService.listCustomers({ page: 1, limit: 4 }),
        auditLogService.listAuditLogs({ page: 1, limit: 6 }),
      ]);

      if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value);
      if (orderRepRes.status === 'fulfilled') setOrderReport(orderRepRes.value);
      if (revRepRes.status === 'fulfilled') setRevenueReport(revRepRes.value);
      if (custRepRes.status === 'fulfilled') setCustomerReport(custRepRes.value);
      if (chefRepRes.status === 'fulfilled') {
        setChefReport(chefRepRes.value);
        if (chefRepRes.value?.topChefs) {
          setTopChefs(chefRepRes.value.topChefs);
        }
      }
      if (recentOrdersRes.status === 'fulfilled') {
        setRecentOrders(recentOrdersRes.value?.orders || recentOrdersRes.value?.data || []);
      }
      if (pendingChefsRes.status === 'fulfilled') {
        const rawChefs = pendingChefsRes.value?.chefs || pendingChefsRes.value?.data || [];
        setPendingChefs(rawChefs.filter((c) => c.approvalStatus === 'pending'));
      }
      if (recentCustRes.status === 'fulfilled') {
        setRecentCustomers(recentCustRes.value?.customers || recentCustRes.value?.data || []);
      }
      if (auditLogsRes.status === 'fulfilled') {
        setRecentActivities(auditLogsRes.value?.logs || auditLogsRes.value?.data || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading platform intelligence & ledger metrics..." />
      </div>
    );
  }

  // Segregated finance values
  const collections = overview?.finance?.collections || {};
  const platformRevenue = overview?.finance?.platformRevenue || {};
  const chefEarnings = overview?.finance?.chefEarnings || {};
  const customerStats = overview?.customers || {};
  const chefStats = overview?.chefs || {};
  const orderStats = overview?.orders || {};
  const subStats = overview?.subscriptions || {};
  const foodStats = overview?.foods || {};

  return (
    <div className="space-y-8 pb-12 min-w-0">
      {/* 1. Header Bar with Period Filter & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-light-text">
            Platform Executive Overview
          </h2>
          <p className="text-xs text-light-muted mt-1">
            Real-time multi-sided marketplace operations, segregated financials, and verified chef activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Period selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-xl border border-light-border bg-light-card px-3 py-2 text-xs font-medium text-light-text shadow-xs focus:border-brand-primary focus:outline-none cursor-pointer"
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-xl border border-light-border bg-light-card px-3 py-2 text-xs font-medium text-light-text hover:bg-light-secondary shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards (Customer, Chef, Order, Financial Statistics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Customer Statistics Card */}
        <StatCard
          title="Customer Accounts"
          value={formatNumber(customerStats.total || 0)}
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-500/10"
          subtitle={`${customerStats.active || 0} Active • ${customerStats.inactive || 0} Blocked`}
          badge={`+${customerStats.newToday || 0} Today`}
        />

        {/* HomeChef Statistics Card */}
        <StatCard
          title="HomeChefs"
          value={formatNumber(chefStats.total || 0)}
          icon={ChefHat}
          iconColor="text-amber-600"
          iconBg="bg-amber-500/10"
          subtitle={`${chefStats.approved || 0} Approved • ${chefStats.active || 0} Live`}
          badge={chefStats.pendingApproval > 0 ? `${chefStats.pendingApproval} Pending Review` : 'All Reviewed'}
        />

        {/* Order Statistics Card */}
        <StatCard
          title="Total Orders"
          value={formatNumber(orderStats.total || 0)}
          icon={ShoppingBag}
          iconColor="text-brand-primary"
          iconBg="bg-brand-primary/10"
          subtitle={`${orderStats.delivered || 0} Delivered • ${orderStats.cancelled || 0} Cancelled`}
          badge={`${(orderStats.pending_confirmation || 0) + (orderStats.accepted || 0) + (orderStats.preparing || 0)} Active Now`}
        />

        {/* Platform Revenue */}
        <StatCard
          title="Gross Platform Revenue"
          value={formatCurrency(platformRevenue.grossPlatformRevenue || platformRevenue.commissionRevenue || 0)}
          icon={Wallet}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-500/10"
          subtitle={`Commission: ${formatCurrency(platformRevenue.commissionRevenue || 0)} • COD: ${formatCurrency(platformRevenue.codFeeRevenue || 0)}`}
          badge="Platform Revenue"
        />
      </div>

      {/* Secondary Quick Financial Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 rounded-2xl border border-light-border bg-light-card/60 backdrop-blur-xs">
        <div>
          <p className="text-[11px] font-medium text-light-muted">
            Gross Customer Collections
          </p>
          <p className="text-base sm:text-lg font-bold text-light-text mt-0.5">
            {formatCurrency(collections.grossCustomerCollections || 0)}
          </p>
          <p className="text-[10px] text-light-muted mt-0.5">
            Online: {formatCurrency(collections.onlinePaymentCollections || 0)} • COD: {formatCurrency(collections.codCashCollections || 0)}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-medium text-light-muted">
            Net Platform Operating Income
          </p>
          <p className="text-base sm:text-lg font-bold text-brand-primary mt-0.5">
            {formatCurrency(platformRevenue.netPlatformOperatingIncome || 0)}
          </p>
          <p className="text-[10px] text-light-muted mt-0.5">
            After Discounts ({formatCurrency(platformRevenue.promotionalDiscountExpenses || 0)}) & Gateways
          </p>
        </div>

        <div>
          <p className="text-[11px] font-medium text-light-muted">
            Chef Earnings Payable
          </p>
          <p className="text-base sm:text-lg font-bold text-light-text mt-0.5">
            {formatCurrency(chefEarnings.chefEarningsPayable || 0)}
          </p>
          <p className="text-[10px] text-light-muted mt-0.5">
            Pending chef wallet balance awaiting withdrawal
          </p>
        </div>

        <div>
          <p className="text-[11px] font-medium text-light-muted">
            Active Subscriptions
          </p>
          <p className="text-base sm:text-lg font-bold text-light-text mt-0.5">
            {formatNumber(subStats.active || 0)}
          </p>
          <p className="text-[10px] text-light-muted mt-0.5">
            {subStats.total || 0} Total Plans • {foodStats.total || 0} Active Food Items
          </p>
        </div>
      </div>

      {/* 3. Primary Charts Section (Order Analytics Line + Revenue Analytics Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Analytics Chart */}
        <div className="min-w-0">
          <ChartContainer
            title="Order Trends Over Time"
            subtitle="Daily order volume, delivered fulfillment, and cancellations"
            actions={
              <Link
                to="/analytics"
                className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
              >
                Full Analytics <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <OrderAnalyticsChart
              data={orderReport?.timeline || []}
              height={280}
            />
          </ChartContainer>
        </div>

        {/* Revenue Analytics Chart */}
        <div className="min-w-0">
          <ChartContainer
            title="Financial Ledger Breakdown"
            subtitle="Segregated platform commission, COD fees, promotional expenses, and refunds"
            actions={
              <Link
                to="/finance"
                className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
              >
                Finance Ledger <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <RevenueAnalyticsChart
              data={revenueReport?.timeline || []}
              height={280}
            />
          </ChartContainer>
        </div>
      </div>

      {/* 4. Secondary Analytics Row (Customer Growth, Chef Growth, Order Status & Payment Donuts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Customer Growth */}
        <div className="min-w-0">
          <ChartContainer
            title="Customer Registrations"
            subtitle="Account onboarding trend"
          >
            <CustomerGrowthChart
              data={customerReport?.registrationTimeline || []}
              height={220}
            />
          </ChartContainer>
        </div>

        {/* Chef Registrations */}
        <div className="min-w-0">
          <ChartContainer
            title="HomeChef Onboarding"
            subtitle="Kitchen applications trend"
          >
            <ChefAnalyticsChart
              data={chefReport?.registrationTimeline || []}
              height={220}
            />
          </ChartContainer>
        </div>

        {/* Order Status Distribution */}
        <div className="min-w-0">
          <ChartContainer
            title="Order Status Breakdown"
            subtitle="Fulfillment pipeline status"
          >
            <OrderDistributionDonut
              data={orderStats}
              height={220}
            />
          </ChartContainer>
        </div>

        {/* Payment Method Distribution */}
        <div className="min-w-0">
          <ChartContainer
            title="Payment Methods"
            subtitle="Online Prepaid vs Cash on Delivery"
          >
            <PaymentMethodDonut
              data={orderReport?.byPaymentMethod || []}
              height={220}
            />
          </ChartContainer>
        </div>
      </div>

      {/* 5. Operational Tables Section (Recent Orders, Pending Chef Approvals, Top Performing Chefs) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table (2 Columns Span) */}
        <div className="lg:col-span-2 min-w-0">
          <Card
            title="Recent Marketplace Orders"
            subtitle="Latest orders across customer and chef portals"
            actions={
              <Link
                to="/orders"
                className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
              >
                View All Orders <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
            bodyClassName="p-0 overflow-x-auto"
          >
            {recentOrders.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="No recent orders"
                description="Orders placed by customers will appear here in real time."
                className="my-6 border-none"
              />
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[550px] text-left text-xs">
                  <thead className="border-b border-light-border bg-light-secondary/40 text-light-muted font-semibold">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-light-border">
                    {recentOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-light-secondary/30 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-medium text-light-text">
                          <Link
                            to={`/orders?id=${order._id}`}
                            className="hover:text-brand-primary hover:underline"
                          >
                            #{order.orderNumber || order._id?.slice(-6)}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-light-text font-medium truncate max-w-[120px]">
                          {order.customerId?.name || order.deliveryAddressSnapshot?.receiverName || 'Customer'}
                        </td>
                        <td className="py-3 px-4 font-bold text-light-text">
                          {formatCurrency(order.totalAmount || (order.totalAmountPaise ? order.totalAmountPaise / 100 : 0))}
                        </td>
                        <td className="py-3 px-4 uppercase text-[10px] font-semibold text-light-muted">
                          {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge status={order.orderStatus} size="xs" />
                        </td>
                        <td className="py-3 px-4 text-right text-light-muted whitespace-nowrap">
                          {formatDateTime(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Pending Chef Approvals Card */}
        <div className="space-y-6 min-w-0">
          <Card
            title="Pending Chef Approvals"
            subtitle={`${pendingChefs.length} awaiting identity & kitchen inspection`}
            actions={
              <Link
                to="/chef-approvals"
                className="text-xs font-semibold text-brand-orange hover:underline flex items-center gap-1"
              >
                Review All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
            bodyClassName="p-4 space-y-3"
          >
            {pendingChefs.length === 0 ? (
              <div className="py-8 text-center text-xs text-light-muted">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-light-text">
                  All Chefs Reviewed
                </p>
                <p className="mt-0.5">No pending onboarding applications.</p>
              </div>
            ) : (
              pendingChefs.map((chef) => (
                <div
                  key={chef._id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-light-border bg-light-secondary/30 hover:border-brand-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center font-bold text-xs shrink-0">
                      {(chef.kitchenName || chef.ownerName || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-light-text truncate">
                        {chef.kitchenName || chef.ownerName || 'HomeChef'}
                      </p>
                      <p className="text-[11px] text-light-muted truncate">
                        {chef.city || 'Location unverified'} • Registered {formatDateTime(chef.createdAt)}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/chef-approvals"
                    className="shrink-0 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-brand-primary text-white hover:bg-brand-primary-dark transition-colors"
                  >
                    Review
                  </Link>
                </div>
              ))
            )}
          </Card>

          {/* Top Performing Chefs Ranking */}
          <Card
            title="Top Performing HomeChefs"
            subtitle="Ranked by verified fulfilled orders"
            bodyClassName="p-4 space-y-3"
          >
            {topChefs.length === 0 ? (
              <div className="py-6 text-center text-xs text-light-muted">
                No chef delivery rankings available yet.
              </div>
            ) : (
              topChefs.map((chef, idx) => (
                <div
                  key={chef.chefId || idx}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-light-border bg-light-secondary/20"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-light-secondary text-[11px] font-bold text-light-text shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-light-text truncate">
                        {chef.kitchenName || chef.chefName || 'HomeChef'}
                      </p>
                      <p className="text-[10px] text-light-muted">
                        {chef.city || 'Verified'} • {chef.deliverySuccessRatePercent || 100}% fulfillment rate
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-brand-primary">
                      {chef.deliveredOrders || 0} Delivered
                    </p>
                    <p className="text-[10px] text-light-muted">
                      {formatCurrency(chef.grossOrderValuePaise ? chef.grossOrderValuePaise / 100 : 0)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>

      {/* 6. Bottom Row: Recent Customers & System Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Customers */}
        <div className="min-w-0">
          <Card
            title="Recently Registered Customers"
            subtitle="New accounts onboarded to the marketplace"
            actions={
              <Link
                to="/customers"
                className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
              >
                All Customers <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
            bodyClassName="p-4 space-y-3"
          >
            {recentCustomers.length === 0 ? (
              <p className="py-6 text-center text-xs text-light-muted">
                No recent customer registrations.
              </p>
            ) : (
              recentCustomers.map((cust) => (
                <div
                  key={cust._id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-light-border bg-light-secondary/20"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {(cust.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-light-text truncate">
                        {cust.name}
                      </p>
                      <p className="text-[10px] text-light-muted truncate">
                        {cust.email} • {cust.phone || 'No phone'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        cust.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <span className="text-[11px] font-medium text-light-muted">
                      {cust.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>

        {/* Recent Audit Activities */}
        <div className="min-w-0">
          <Card
            title="Recent System Audit Activities"
            subtitle="Immutable administrative action logs"
            actions={
              <Link
                to="/audit-logs"
                className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
              >
                All Audit Logs <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
            bodyClassName="p-4 space-y-3"
          >
            {recentActivities.length === 0 ? (
              <p className="py-6 text-center text-xs text-light-muted">
                No administrative activities logged recently.
              </p>
            ) : (
              recentActivities.map((act) => (
                <div
                  key={act._id}
                  className="flex items-start gap-3 p-2.5 rounded-xl border border-light-border bg-light-secondary/20 text-xs"
                >
                  <ShieldAlert className="h-4 w-4 text-light-muted mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-light-text truncate">
                      {act.action?.replace(/_/g, ' ') || 'Admin Operation'}
                    </p>
                    <p className="text-[11px] text-light-muted mt-0.5 truncate">
                      Target: {act.targetModel || 'System'} • By {act.adminId?.name || 'Administrator'}
                    </p>
                  </div>
                  <span className="text-[10px] text-light-muted shrink-0 whitespace-nowrap">
                    {formatDateTime(act.createdAt)}
                  </span>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
