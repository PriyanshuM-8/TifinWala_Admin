import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Calendar,
  Filter,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Coins,
  Users,
  ChefHat,
  UtensilsCrossed,
  CreditCard,
  PieChart as PieIcon,
  CalendarDays,
} from 'lucide-react';
import reportService from '../../services/reportService';
import { Card } from '../../components/common/Card';
import { ChartContainer } from '../../components/charts/ChartContainer';
import { OrderAnalyticsChart } from '../../components/charts/OrderAnalyticsChart';
import { RevenueAnalyticsChart } from '../../components/charts/RevenueAnalyticsChart';
import { CustomerGrowthChart } from '../../components/charts/CustomerGrowthChart';
import { ChefAnalyticsChart } from '../../components/charts/ChefAnalyticsChart';
import { OrderDistributionDonut } from '../../components/charts/OrderDistributionDonut';
import { PaymentMethodDonut } from '../../components/charts/PaymentMethodDonut';
import { SubscriptionMealChart } from '../../components/charts/SubscriptionMealChart';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const AnalyticsPage = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'revenue' | 'chefs' | 'customers' | 'foods' | 'subscriptions'
  const [loading, setLoading] = useState(true);

  // Date filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Report States
  const [orderReport, setOrderReport] = useState(null);
  const [revenueReport, setRevenueReport] = useState(null);
  const [chefReport, setChefReport] = useState(null);
  const [customerReport, setCustomerReport] = useState(null);
  const [foodReport, setFoodReport] = useState(null);
  const [subscriptionReport, setSubscriptionReport] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const [orderRes, revRes, chefRes, custRes, foodRes, subRes] = await Promise.allSettled([
        reportService.getOrderReport({ startDate, endDate }),
        reportService.getRevenueReport({ startDate, endDate }),
        reportService.getChefReport({ startDate, endDate }),
        reportService.getCustomerReport({ startDate, endDate }),
        reportService.getFoodReport(),
        reportService.getSubscriptionReport(),
      ]);

      if (orderRes.status === 'fulfilled') setOrderReport(orderRes.value);
      if (revRes.status === 'fulfilled') setRevenueReport(revRes.value);
      if (chefRes.status === 'fulfilled') setChefReport(chefRes.value);
      if (custRes.status === 'fulfilled') setCustomerReport(custRes.value);
      if (foodRes.status === 'fulfilled') setFoodReport(foodRes.value);
      if (subRes.status === 'fulfilled') setSubscriptionReport(subRes.value);
    } catch (err) {
      console.error('Failed to load reports:', err);
      addToast('Failed to load analytics datasets.', 'error');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, addToast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="space-y-6 min-w-0">
      {/* Header & Date Pickers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-light-text">
            Marketplace Analytics & Reports
          </h2>
          <p className="text-xs text-light-muted mt-1">
            Data visualization derived directly from MongoDB aggregations with date boundary precision.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl border border-light-border bg-light-card px-2.5 py-1.5 text-xs text-light-text focus:outline-none"
            />
            <span className="text-light-muted">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl border border-light-border bg-light-card px-2.5 py-1.5 text-xs text-light-text focus:outline-none"
            />
          </div>

          <button
            onClick={fetchReports}
            className="rounded-xl border border-light-border bg-light-card p-2 text-light-muted hover:text-light-text hover:bg-light-secondary transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-light-border">
        {[
          { id: 'orders', label: 'Order Analytics', icon: ShoppingBag },
          { id: 'revenue', label: 'Revenue & Ledger', icon: Coins },
          { id: 'chefs', label: 'Chef Performance', icon: ChefHat },
          { id: 'customers', label: 'Customer Growth', icon: Users },
          { id: 'foods', label: 'Food Popularity', icon: UtensilsCrossed },
          { id: 'subscriptions', label: 'Subscriptions', icon: CalendarDays },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-light-card text-light-muted hover:text-light-text border border-light-border'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Panes */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" text="Processing server-side aggregations..." />
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. Orders Tab */}
          {activeTab === 'orders' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 min-w-0">
                <ChartContainer
                  title="Daily Order Trajectory"
                  subtitle="Total order volume vs completed fulfillment and cancellations"
                >
                  <OrderAnalyticsChart data={orderReport?.timeline || []} height={320} />
                </ChartContainer>
              </div>

              <div className="min-w-0">
                <ChartContainer
                  title="Payment Method Breakdown"
                  subtitle="Prepaid Online vs COD volume"
                >
                  <PaymentMethodDonut data={orderReport?.byPaymentMethod || []} height={320} />
                </ChartContainer>
              </div>
            </div>
          )}

          {/* 2. Revenue Tab */}
          {activeTab === 'revenue' && (
            <div className="space-y-6 min-w-0">
              <ChartContainer
                title="Financial Revenue Breakdown"
                subtitle="Segregated ledger metrics: Commission, COD Fees, Promotional Expenses, and Refunds"
              >
                <RevenueAnalyticsChart data={revenueReport?.timeline || []} height={320} />
              </ChartContainer>
            </div>
          )}

          {/* 3. Chefs Tab */}
          {activeTab === 'chefs' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="min-w-0">
                <ChartContainer
                  title="HomeChef Onboarding Velocity"
                  subtitle="Daily kitchen application registrations"
                >
                  <ChefAnalyticsChart data={chefReport?.registrationTimeline || []} height={280} />
                </ChartContainer>
              </div>

              <div className="min-w-0">
                <Card
                  title="Top Performing Culinary Partners"
                  subtitle="Ranked by delivered orders and customer satisfaction"
                  bodyClassName="p-4 space-y-3"
                >
                  {chefReport?.topChefs?.map((c, i) => (
                    <div
                      key={c.chefId || i}
                      className="flex items-center justify-between p-3 rounded-xl border border-light-border bg-light-secondary/30 text-xs"
                    >
                      <div>
                        <p className="font-bold text-light-text">
                          #{i + 1} {c.kitchenName || c.chefName}
                        </p>
                        <p className="text-[11px] text-light-muted">
                          {c.city} • {c.deliverySuccessRatePercent}% fulfillment success
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-brand-primary">
                          {c.deliveredOrders} Delivered
                        </span>
                        <p className="text-[10px] text-light-muted">
                          GOV: {formatCurrency(c.grossOrderValuePaise ? c.grossOrderValuePaise / 100 : 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          )}

          {/* 4. Customers Tab */}
          {activeTab === 'customers' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="min-w-0">
                <ChartContainer
                  title="Customer Registration Trajectory"
                  subtitle="Cumulative consumer signups"
                >
                  <CustomerGrowthChart data={customerReport?.registrationTimeline || []} height={280} />
                </ChartContainer>
              </div>

              <div className="min-w-0">
                <Card
                  title="Top Ordering Customers & Retention"
                  subtitle={`Repeat Customers: ${customerReport?.retentionSummary?.repeatCustomers || 0} • Single Order: ${customerReport?.retentionSummary?.singleOrderCustomers || 0}`}
                  bodyClassName="p-4 space-y-2.5"
                >
                  {customerReport?.topCustomers?.map((cust, i) => (
                    <div
                      key={cust.customerId || i}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-light-border bg-light-secondary/20 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-light-text">
                          {cust.name}
                        </p>
                        <p className="text-[10px] text-light-muted">
                          {cust.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-light-text">
                          {cust.orderCount} Orders
                        </p>
                        <p className="text-[10px] text-light-muted">
                          Total: {formatCurrency(cust.totalSpent || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          )}

          {/* 5. Food Popularity Tab */}
          {activeTab === 'foods' && (
            <Card
              title="Top Selling Homemade Dishes"
              subtitle="Ordered items across fulfilled delivery orders"
              bodyClassName="p-0 overflow-x-auto"
            >
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[550px] text-left text-xs">
                  <thead className="bg-light-secondary/40 border-b border-light-border font-semibold text-light-muted">
                    <tr>
                      <th className="py-3 px-4">Dish Name</th>
                      <th className="py-3 px-4">Dietary Type</th>
                      <th className="py-3 px-4">Quantity Ordered</th>
                      <th className="py-3 px-4 text-right">Gross Order Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-light-border">
                    {foodReport?.topSellingFoods?.map((f, i) => (
                      <tr key={f._id || i}>
                        <td className="py-3 px-4 font-semibold text-light-text">
                          {f.foodName || 'Unnamed Dish'}
                        </td>
                        <td className="py-3 px-4 capitalize text-light-muted">
                          {f.foodType || 'Vegetarian'}
                        </td>
                        <td className="py-3 px-4 font-bold">
                          {f.totalQuantityOrdered} portions
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-brand-primary">
                          {formatCurrency(f.totalRevenuePaise ? f.totalRevenuePaise / 100 : 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* 6. Subscriptions Tab */}
          {activeTab === 'subscriptions' && (
            <div className="min-w-0">
              <ChartContainer
                title="Meal Order Fulfillment Funnel"
                subtitle="Scheduled meal instances across active subscriptions"
              >
                <SubscriptionMealChart
                  data={subscriptionReport?.mealSummary || {}}
                  height={300}
                />
              </ChartContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
