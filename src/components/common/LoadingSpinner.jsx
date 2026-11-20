import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', text, className = '' }) => {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-8 ${className}`}>
      <Loader2 className={`animate-spin text-brand-primary ${sizeMap[size] || sizeMap.md}`} />
      {text && (
        <p className="text-xs font-medium text-light-muted animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export const Skeleton = ({ className = '', rounded = 'rounded-xl' }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200/80 ${rounded} ${className}`}
    />
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full space-y-3 p-4">
      <Skeleton className="h-10 w-full rounded-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1 rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;
