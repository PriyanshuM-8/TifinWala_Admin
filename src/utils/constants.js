/**
 * GharKaSwad Admin Constants
 */

export const ORDER_STATUS = {
  PENDING_CONFIRMATION: 'pending_confirmation',
  ACCEPTED: 'accepted',
  PREPARING: 'preparing',
  READY_FOR_PICKUP: 'ready_for_pickup',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
};

export const SUBSCRIPTION_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const CHEF_APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const WITHDRAWAL_STATUS = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  PROCESSING: 'processing',
  PAID: 'paid',
  REJECTED: 'rejected',
};

export const COMPLAINT_STATUS = {
  SUBMITTED: 'submitted',
  IN_REVIEW: 'in_review',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

export const PERIOD_OPTIONS = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Last 30 Days', value: '30days' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'All Time', value: 'all_time' },
];

export const BRAND_COLORS = {
  primaryGreen: '#14513F',
  primaryOrange: '#F6A23A',
  creamWhite: '#FFFDF8',
  darkText: '#27352F',
  secondaryText: '#737B76',
  lightBackground: '#F7F8F5',
  border: '#E8ECE7',
};
