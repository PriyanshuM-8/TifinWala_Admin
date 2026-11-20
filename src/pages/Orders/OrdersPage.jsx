import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Clock,
  MapPin,
  CreditCard,
  User,
  ChefHat,
  Ban,
  Filter,
} from 'lucide-react';
import orderService from '../../services/orderService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { TableSkeleton } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const OrdersPage = () => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Detail & Cancel Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderService.listOrders({
        page,
        limit: 15,
        search,
        orderStatus: statusFilter,
        paymentMethod: paymentMethodFilter,
      });
      setOrders(res.orders || res.data || []);
      setTotalPages(res.pagination?.pages || res.totalPages || 1);
      setTotalOrders(res.pagination?.total || res.total || 0);
    } catch (err) {
      console.error('Failed to load orders:', err);
      addToast('Failed to load orders.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, paymentMethodFilter, addToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      addToast('Please provide a reason for cancelling this order.', 'error');
      return;
    }

    setCancelling(true);
    try {
      await orderService.cancelOrder(cancelModalOrder._id, {
        cancellationReason: cancelReason,
        refundType: 'full',
      });
      addToast(`Order #${cancelModalOrder.orderNumber || cancelModalOrder._id.slice(-6)} cancelled.`, 'info');
      setCancelModalOrder(null);
      fetchOrders();
      if (selectedOrder?._id === cancelModalOrder._id) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: 'cancelled' }));
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel order.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-light-text">
            Marketplace Orders
          </h2>
          <p className="text-xs text-light-muted mt-1">
            Real-time feed of food orders, kitchen preparation phases, delivery progress, and cancellations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-light-muted" />
            <input
              type="text"
              placeholder="Search order #, customer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-light-border bg-light-card pl-9 pr-3 py-2 text-xs text-light-text focus:border-brand-primary focus:outline-none w-48 sm:w-56"
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
            <option value="pending_confirmation">Pending Confirmation</option>
            <option value="accepted">Accepted</option>
            <option value="preparing">Preparing</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Payment Method */}
          <select
            value={paymentMethodFilter}
            onChange={(e) => {
              setPaymentMethodFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-light-border bg-light-card px-3 py-2 text-xs font-medium text-light-text focus:outline-none cursor-pointer"
          >
            <option value="">Payment Method</option>
            <option value="online">Online Prepaid</option>
            <option value="cod">Cash on Delivery</option>
          </select>

          <button
            onClick={fetchOrders}
            className="rounded-xl border border-light-border bg-light-card p-2 text-light-muted hover:text-light-text hover:bg-light-secondary transition-colors cursor-pointer"
            title="Refresh Orders"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <Card bodyClassName="p-0 overflow-x-auto">
        {loading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders found"
            description="No orders match your selected status and date range."
            className="my-8 border-none"
          />
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="border-b border-light-border bg-light-secondary/40 text-light-muted font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">HomeChef</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border">
                {orders.map((order) => {
                  const totalAmt = order.totalAmount || (order.totalAmountPaise ? order.totalAmountPaise / 100 : 0);
                  const canCancel = !['delivered', 'cancelled', 'rejected'].includes(order.orderStatus);

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-light-secondary/20 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-light-text">
                        #{order.orderNumber || order._id.slice(-6)}
                      </td>

                      <td className="py-3.5 px-4 text-light-text font-medium truncate max-w-[120px]">
                        {order.customerId?.name || order.deliveryAddressSnapshot?.receiverName || 'Customer'}
                      </td>

                      <td className="py-3.5 px-4 text-light-muted truncate max-w-[120px]">
                        {order.chefId?.kitchenName || order.chefId?.name || 'HomeChef'}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-light-text">
                        {formatCurrency(totalAmt)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-light-secondary text-light-text border border-light-border">
                          {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge status={order.orderStatus} size="xs" />
                      </td>

                      <td className="py-3.5 px-4 text-light-muted whitespace-nowrap">
                        {formatDateTime(order.createdAt)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-lg p-1.5 text-light-muted hover:text-brand-primary hover:bg-light-secondary transition-colors cursor-pointer"
                            title="View Order Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {canCancel && (
                            <button
                              onClick={() => {
                                setCancelModalOrder(order);
                                setCancelReason('');
                              }}
                              className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Cancel Order by Admin"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalOrders}
          pageSize={15}
          onPageChange={setPage}
        />
      </Card>

      {/* Order Details Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order #${selectedOrder?.orderNumber || selectedOrder?._id?.slice(-6)}`}
        subtitle={`Placed ${formatDateTime(selectedOrder?.createdAt)}`}
        maxWidth="max-w-xl"
      >
        {selectedOrder && (
          <div className="space-y-5 text-xs">
            {/* Status & Amount Banner */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-light-border bg-light-secondary/30">
              <div>
                <span className="text-light-muted font-medium">Order Total:</span>
                <p className="text-lg font-bold text-light-text mt-0.5">
                  {formatCurrency(selectedOrder.totalAmount || (selectedOrder.totalAmountPaise ? selectedOrder.totalAmountPaise / 100 : 0))}
                </p>
                <p className="text-[11px] text-light-muted mt-0.5 uppercase">
                  Payment: {selectedOrder.paymentMethod} • Status: {selectedOrder.paymentStatus}
                </p>
              </div>

              <Badge status={selectedOrder.orderStatus} size="md" />
            </div>

            {/* Parties */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-light-border bg-light-card space-y-1">
                <span className="font-semibold text-light-muted uppercase text-[10px] flex items-center gap-1">
                  <User className="h-3 w-3" /> Customer
                </span>
                <p className="font-bold text-light-text">
                  {selectedOrder.customerId?.name || selectedOrder.deliveryAddressSnapshot?.receiverName || 'Customer'}
                </p>
                <p className="text-[11px] text-light-muted">
                  {selectedOrder.deliveryAddressSnapshot?.receiverPhone || selectedOrder.customerId?.phone || '-'}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-light-border bg-light-card space-y-1">
                <span className="font-semibold text-light-muted uppercase text-[10px] flex items-center gap-1">
                  <ChefHat className="h-3 w-3" /> HomeChef
                </span>
                <p className="font-bold text-light-text">
                  {selectedOrder.chefId?.kitchenName || selectedOrder.chefId?.name || 'Chef Kitchen'}
                </p>
                <p className="text-[11px] text-light-muted">
                  {selectedOrder.chefId?.city || '-'}
                </p>
              </div>
            </div>

            {/* Delivery Address */}
            {selectedOrder.deliveryAddressSnapshot && (
              <div className="p-3 rounded-xl border border-light-border bg-light-card space-y-1">
                <span className="font-semibold text-light-muted uppercase text-[10px] flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-brand-primary" /> Delivery Address
                </span>
                <p className="text-light-text">
                  {selectedOrder.deliveryAddressSnapshot.addressLine}, {selectedOrder.deliveryAddressSnapshot.city} - {selectedOrder.deliveryAddressSnapshot.pincode}
                </p>
              </div>
            )}

            {/* Items Ordered */}
            <div>
              <span className="font-semibold text-light-muted uppercase text-[10px] block mb-2">
                Items in Order ({selectedOrder.items?.length || 0})
              </span>
              <div className="space-y-1.5 rounded-xl border border-light-border p-2">
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-light-secondary/20"
                  >
                    <div>
                      <p className="font-semibold text-light-text">
                        {item.foodName || item.name}
                      </p>
                      <p className="text-[10px] text-light-muted">
                        Qty: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <span className="font-bold">
                      {formatCurrency(item.itemTotal || (item.price * item.quantity))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Admin Order Cancellation Modal */}
      <Modal
        isOpen={!!cancelModalOrder}
        onClose={() => setCancelModalOrder(null)}
        title="Admin Order Cancellation"
        subtitle={`Order #${cancelModalOrder?.orderNumber || cancelModalOrder?._id?.slice(-6)}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmCancel} className="space-y-4 text-xs">
          <p className="text-light-muted leading-relaxed">
            Cancelling this order will immediately update the status to cancelled, reverse commissions in the financial ledger, and issue a full refund if prepaid online.
          </p>

          <div>
            <label className="block font-semibold text-light-text mb-1.5">
              Cancellation Reason *
            </label>
            <textarea
              rows={3}
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Customer dispute, delivery emergency, kitchen closure..."
              className="w-full rounded-xl border border-light-border bg-light-secondary/40 p-3 text-xs text-light-text focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-light-border">
            <button
              type="button"
              onClick={() => setCancelModalOrder(null)}
              className="px-4 py-2 rounded-xl border border-light-border text-light-text font-medium hover:bg-light-secondary transition-colors cursor-pointer"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={cancelling}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrdersPage;
