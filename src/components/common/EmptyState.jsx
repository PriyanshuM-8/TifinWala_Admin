import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is currently no data to display for this view.',
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-light-border bg-light-card/50 ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-light-secondary text-light-muted mb-4">
        <Icon className="h-7 w-7 stroke-[1.5]" />
      </div>
      <h4 className="text-base font-semibold text-light-text tracking-tight mb-1">
        {title}
      </h4>
      <p className="max-w-sm text-xs text-light-muted mb-6 leading-relaxed">
        {description}
      </p>
      {action}
    </div>
  );
};

export default EmptyState;
