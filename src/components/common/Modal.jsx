import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  showClose = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Dialog box */}
      <div
        className={`relative w-full max-w-[calc(100vw-1.5rem)] ${maxWidth} rounded-2xl border border-light-border bg-light-card shadow-2xl transition-all z-10 my-auto sm:my-8`}
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between border-b border-light-border px-4 sm:px-6 py-4">
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
            {showClose && (
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-light-muted hover:text-light-text hover:bg-light-secondary transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        <div className="p-4 sm:p-6 max-h-[calc(90vh-6rem)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
