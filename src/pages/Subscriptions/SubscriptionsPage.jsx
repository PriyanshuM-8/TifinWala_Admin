import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Clock,
  Calendar,
  UtensilsCrossed,
  User,
  ChefHat,
  Filter,
} from 'lucide-react';
import subscriptionService from '../../services/subscriptionService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { TableSkeleton } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const SubscriptionsPage = () => {
  const { addToast } = useToast();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubs, setTotalSubs] = useState(0);

  // Detail Modal
  const [selectedSub, setSelectedSub] = useState(null);
  const [subMeals, setSubMeals] = useState([]);
  const [mealsLoading, setMealsLoading] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await subscriptionService.listSubscriptions({
        page,
        limit: 15,
        search,
        subscriptionStatus: statusFilter,
      });
      setSubscriptions(res.subscriptions || res.data || []);
      setTotalPages(res.pagination?.pages || res.totalPages || 1);
      setTotalSubs(res.pagination?.total || res.total || 0);
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
      addToast('Failed to load subscriptions.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, addToast]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleViewSub = async (sub) => {
    setSelectedSub(sub);
    setMealsLoading(true);
    try {
      const res = await subscriptionService.getSubscriptionMeals(sub._id);
      setSubMeals(res.meals || res.data || []);
    } catch {
      // Ignored
    } finally {
      setMealsLoading(false);
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-light-text">
            Meal Subscriptions
          </h2>
          <p className="text-xs text-light-muted mt-1">
            Weekly and monthly recurring homemade meal schedules, billing plans, and meal fulfillment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-light-muted" />
            <input
              type="text"
              placeholder="Search subscriber, plan..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-light-border bg-light-card pl-9 pr-3 py-2 text-xs text-light-text focus:outline-none w-52 sm:w-60"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-light-border bg-light-card px-3 py-2 text-xs font-medium text-light-text focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={fetchSubscriptions}
            className="rounded-xl border border-light-border bg-light-card p-2 text-light-muted hover:text-light-text hover:bg-light-secondary transition-colors cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Subscriptions Table */}
      <Card bodyClassName="p-0 overflow-x-auto">
        {loading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : subscriptions.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No subscriptions found"
            description="No customer meal plans match your current criteria."
            className="my-8 border-none"
          />
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead className="border-b border-light-border bg-light-secondary/40 text-light-muted font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Plan & Subscriber</th>
                  <th className="py-3.5 px-4">HomeChef</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Start Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border">
                {subscriptions.map((sub) => (
                  <tr
                    key={sub._id}
                    className="hover:bg-light-secondary/20 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-light-text truncate">
                        {sub.planName || 'Homemade Meal Subscription'}
                      </p>
                      <p className="text-[11px] text-light-muted truncate">
                        By {sub.customerId?.name || 'Customer'}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-light-muted truncate max-w-[130px]">
                      {sub.chefId?.kitchenName || sub.chefId?.name || 'HomeChef'}
                    </td>

                    <td className="py-3.5 px-4 text-light-text font-medium capitalize">
                      {sub.durationWeeks ? `${sub.durationWeeks} Weeks` : sub.planType || 'Standard'}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-light-text">
                      {formatCurrency(sub.totalAmount || (sub.totalAmountPaise ? sub.totalAmountPaise / 100 : 0))}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge status={sub.subscriptionStatus} size="xs" />
                    </td>

                    <td className="py-3.5 px-4 text-light-muted whitespace-nowrap">
                      {formatDateTime(sub.startDate || sub.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleViewSub(sub)}
                        className="rounded-lg p-1.5 text-light-muted hover:text-brand-primary hover:bg-light-secondary transition-colors cursor-pointer"
                        title="View Plan Details & Meals"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalSubs}
          pageSize={15}
          onPageChange={setPage}
        />
      </Card>

      {/* Subscription Details Modal */}
      <Modal
        isOpen={!!selectedSub}
        onClose={() => setSelectedSub(null)}
        title={selectedSub?.planName || 'Meal Subscription Details'}
        subtitle={`Subscriber: ${selectedSub?.customerId?.name || 'Customer'}`}
        maxWidth="max-w-xl"
      >
        {selectedSub && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between p-4 rounded-xl border border-light-border bg-light-secondary/30">
              <div>
                <span className="text-light-muted font-medium">Plan Total:</span>
                <p className="text-base font-bold text-light-text mt-0.5">
                  {formatCurrency(selectedSub.totalAmount || (selectedSub.totalAmountPaise ? selectedSub.totalAmountPaise / 100 : 0))}
                </p>
                <p className="text-[11px] text-light-muted mt-0.5">
                  Chef: {selectedSub.chefId?.kitchenName || 'Kitchen'}
                </p>
              </div>

              <Badge status={selectedSub.subscriptionStatus} size="md" />
            </div>

            {/* Daily Meals Breakdown */}
            <div>
              <h4 className="font-bold uppercase tracking-wider text-light-text mb-2.5 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand-primary" />
                <span>Scheduled Meal Orders ({subMeals.length})</span>
              </h4>

              {mealsLoading ? (
                <div className="py-6 text-center text-xs text-light-muted">
                  Loading scheduled meals...
                </div>
              ) : subMeals.length === 0 ? (
                <p className="text-light-muted py-3 text-center border rounded-xl">
                  No meal instances generated for this subscription schedule.
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl border border-light-border p-2">
                  {subMeals.map((m) => (
                    <div
                      key={m._id}
                      className="flex items-center justify-between p-2 rounded-lg bg-light-secondary/20"
                    >
                      <div>
                        <span className="font-semibold text-light-text">
                          {formatDateTime(m.deliveryDate || m.createdAt)}
                        </span>
                        <p className="text-[10px] text-light-muted">
                          {m.mealType || 'Lunch'}
                        </p>
                      </div>
                      <Badge status={m.orderStatus} size="xs" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SubscriptionsPage;
