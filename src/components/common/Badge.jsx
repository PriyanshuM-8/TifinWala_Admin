import React from 'react';
import { getStatusBadgeClass } from '../../utils/formatters';

export const Badge = ({ status, text, size = 'sm', className = '' }) => {
  const displayStatus = text || status?.replace(/_/g, ' ') || 'unknown';
  const colorClass = getStatusBadgeClass(status);

  const sizeClass =
    size === 'xs'
      ? 'px-2 py-0.5 text-[10px]'
      : size === 'md'
      ? 'px-3 py-1 text-xs'
      : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium capitalize rounded-full border transition-colors ${sizeClass} ${colorClass} ${className}`}
    >
      {displayStatus}
    </span>
  );
};

export default Badge;
