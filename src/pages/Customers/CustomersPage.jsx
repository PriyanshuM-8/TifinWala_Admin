import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  ShoppingBag,
  Award,
  Calendar,
  Phone,
  Mail,
  UserX,
  UserCheck,
} from 'lucide-react';
import customerService from '../../services/customerService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner, TableSkeleton } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const CustomersPage = () => {
  const { addToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // Detail Modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerRewards, setCustomerRewards] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerService.listCustomers({
        page,
        limit: 15,
        search,
        status: statusFilter,
      });
      setCustomers(res.customers || res.data || []);
      setTotalPages(res.pagination?.pages || res.totalPages || 1);
      setTotalCustomers(res.pagination?.total || res.total || 0);
    } catch (err) {
      console.error('Failed to load customers:', err);
      addToast('Failed to load customers list.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, addToast]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleToggleStatus = async (customer) => {
    const newStatus = !customer.isActive;
    const actionWord = newStatus ? 'activate' : 'block';
    if (!window.confirm(`Are you sure you want to ${actionWord} customer "${customer.name}"?`)) {
      return;
    }

    try {
      await customerService.updateCustomerStatus(customer._id, newStatus);
      addToast(`Customer "${customer.name}" ${newStatus ? 'activated' : 'blocked'} successfully.`, 'success');
      fetchCustomers();
      if (selectedCustomer?._id === customer._id) {
        setSelectedCustomer((prev) => ({ ...prev, isActive: newStatus }));
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update customer status.', 'error');
    }
  };

  const handleViewCustomer = async (cust) => {
    setSelectedCustomer(cust);
    setDetailLoading(true);
    try {
      const [ordersRes, rewardsRes] = await Promise.allSettled([
        customerService.getCustomerOrders(cust._id, { limit: 5 }),
        customerService.getCustomerRewards(cust._id),
      ]);
      if (ordersRes.status === 'fulfilled') {
        setCustomerOrders(ordersRes.value?.orders || ordersRes.value?.data || []);
      }
      if (rewardsRes.status === 'fulfilled') {
        setCustomerRewards(rewardsRes.value);
      }
    } catch {
      // Ignored
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-light-text">
            Customer Directory
          </h2>
          <p className="text-xs text-light-muted mt-1">
            Registered customer accounts, contact details, ordering status, and wallet loyalty data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-light-muted" />
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-light-border bg-light-card pl-9 pr-3 py-2 text-xs text-light-text placeholder-light-muted focus:border-brand-primary focus:outline-none w-56 sm:w-64"
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
            <option value="">All Accounts</option>
            <option value="active">Active Only</option>
            <option value="inactive">Blocked Only</option>
          </select>

          <button
            onClick={fetchCustomers}
            className="rounded-xl border border-light-border bg-light-card p-2 text-light-muted hover:text-light-text hover:bg-light-secondary transition-colors cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <Card bodyClassName="p-0 overflow-x-auto">
        {loading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers found"
            description="No customer accounts match your search or filter criteria."
            className="my-8 border-none"
          />
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead className="border-b border-light-border bg-light-secondary/40 text-light-muted font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Email Verification</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border">
                {customers.map((cust) => (
                  <tr
                    key={cust._id}
                    className="hover:bg-light-secondary/20 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {(cust.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-light-text truncate">
                            {cust.name}
                          </p>
                          <p className="text-[11px] text-light-muted truncate">
                            {cust.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-light-text">
                      {cust.phone || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      {cust.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600">
                          <XCircle className="h-3 w-3" /> Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={cust.isActive ? 'active' : 'suspended'} size="xs" />
                    </td>
                    <td className="py-3.5 px-4 text-light-muted whitespace-nowrap">
                      {formatDateTime(cust.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewCustomer(cust)}
                          className="rounded-lg p-1.5 text-light-muted hover:text-brand-primary hover:bg-light-secondary transition-colors cursor-pointer"
                          title="View Customer Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(cust)}
                          className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                            cust.isActive
                              ? 'text-rose-500 hover:bg-rose-50'
                              : 'text-emerald-500 hover:bg-emerald-50'
                          }`}
                          title={cust.isActive ? 'Block Customer' : 'Activate Customer'}
                        >
                          {cust.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalCustomers}
          pageSize={15}
          onPageChange={setPage}
        />
      </Card>

      {/* Customer Details Modal */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name || 'Customer Profile'}
        subtitle={`ID: ${selectedCustomer?._id}`}
        maxWidth="max-w-2xl"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Quick Profile Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-light-border bg-light-secondary/40">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-light-text">
                    {selectedCustomer.name}
                  </h4>
                  <p className="text-xs text-light-muted">
                    {selectedCustomer.email} • {selectedCustomer.phone || 'No phone'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge status={selectedCustomer.isActive ? 'active' : 'suspended'} />
                <button
                  onClick={() => handleToggleStatus(selectedCustomer)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer ${
                    selectedCustomer.isActive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {selectedCustomer.isActive ? 'Block Customer' : 'Activate Customer'}
                </button>
              </div>
            </div>

            {/* Loyalty & Rewards Summary */}
            {customerRewards && (
              <div className="p-4 rounded-xl border border-light-border bg-brand-orange/5">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-orange mb-2">
                  <Award className="h-4 w-4" />
                  <span>Loyalty & Reward Balance</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-light-muted">Points Balance:</span>
                    <p className="font-bold text-light-text text-sm">
                      {customerRewards.loyaltyAccount?.pointsBalance || 0} pts
                    </p>
                  </div>
                  <div>
                    <span className="text-light-muted">Active Reward Coupons:</span>
                    <p className="font-bold text-light-text text-sm">
                      {customerRewards.coupons?.length || 0} Coupons
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Orders Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-light-text mb-3 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-brand-primary" />
                <span>Recent Customer Orders</span>
              </h4>

              {detailLoading ? (
                <LoadingSpinner size="sm" text="Loading customer orders..." />
              ) : customerOrders.length === 0 ? (
                <p className="text-xs text-light-muted py-4 text-center">
                  This customer has not placed any orders yet.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-light-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-light-secondary/60 text-light-muted font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Order #</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-light-border">
                      {customerOrders.map((ord) => (
                        <tr key={ord._id}>
                          <td className="py-2.5 px-3 font-mono font-medium">
                            #{ord.orderNumber || ord._id.slice(-6)}
                          </td>
                          <td className="py-2.5 px-3 font-bold">
                            {formatCurrency(ord.totalAmount)}
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge status={ord.orderStatus} size="xs" />
                          </td>
                          <td className="py-2.5 px-3 text-right text-light-muted whitespace-nowrap">
                            {formatDateTime(ord.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomersPage;
