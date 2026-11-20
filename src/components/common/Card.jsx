import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
  bodyClassName = 'p-6',
  headerClassName = 'px-6 py-4.5',
}) => {
  return (
    <div
      className={`rounded-2xl border border-light-border bg-light-card shadow-sm transition-colors duration-200 ${className}`}
    >
      {(title || subtitle || actions) && (
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-light-border ${headerClassName}`}
        >
          <div>
            {title && (
              <h3 className="text-base font-semibold text-light-text tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-light-muted mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
};

export default Card;
