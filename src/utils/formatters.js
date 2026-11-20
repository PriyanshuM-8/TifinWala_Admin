/**
 * Formatting helpers for GharKaSwad Admin
 */

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0.00';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPaiseToRupees = (paise) => {
  if (!paise || isNaN(paise)) return '₹0.00';
  return formatCurrency(paise / 100);
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateString);
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return String(dateString);
  }
};

export const formatNumber = (num) => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
};

export const formatCompactNumber = (num) => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return String(num);
};

export const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered':
    case 'approved':
    case 'active':
    case 'paid':
    case 'resolved':
    case 'available':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';

    case 'pending':
    case 'pending_confirmation':
    case 'pending_payment':
    case 'submitted':
    case 'requested':
      return 'bg-amber-50 text-amber-700 border-amber-200';

    case 'accepted':
    case 'preparing':
    case 'ready_for_pickup':
    case 'out_for_delivery':
    case 'processing':
    case 'in_review':
      return 'bg-blue-50 text-blue-700 border-blue-200';

    case 'cancelled':
    case 'rejected':
    case 'suspended':
    case 'inactive':
    case 'unavailable':
      return 'bg-rose-50 text-rose-700 border-rose-200';

    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};
